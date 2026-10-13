package com.azuremc.abs.skins;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.net.URI;
import java.net.URL;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.profile.PlayerProfile;
import org.bukkit.profile.PlayerTextures;

public final class AbsSkinsPlugin extends JavaPlugin implements Listener {
    private final Map<UUID, PlayerProfile> originalProfiles = new ConcurrentHashMap<>();
    private HttpClient httpClient;
    private volatile String apiBaseUrl = "";
    private volatile String apiToken = "";
    private volatile SkinSettings activeSkin;
    private volatile long lastRevision = -1;
    private final AtomicBoolean pollInFlight = new AtomicBoolean(false);
    private int pollTaskId = -1;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
        getServer().getPluginManager().registerEvents(this, this);
        registerCommand();
        reloadSettings();
    }

    private void registerCommand() {
        if (getCommand("abs-skin") == null) {
            getLogger().severe("Command abs-skin is missing from plugin.yml.");
            return;
        }
        getCommand("abs-skin").setExecutor((sender, command, label, args) -> {
            if (!sender.hasPermission("abs.skins.admin")) {
                sender.sendMessage("You do not have permission to use ABS-Skins.");
                return true;
            }
            if (args.length == 1 && args[0].equalsIgnoreCase("reload")) {
                reloadConfig();
                reloadSettings();
                sender.sendMessage("ABS-Skins configuration reloaded.");
                return true;
            }
            sender.sendMessage("Usage: /abs-skin reload");
            return true;
        });
    }

    private void reloadSettings() {
        lastRevision = -1;
        String username = getConfig().getString("bot.name", "ABS_Bot");
        boolean enabled = getConfig().getBoolean("skin.enabled", false);
        String texture = getConfig().getString("skin.texture", "");
        String model = getConfig().getString("skin.model", "classic");
        activeSkin = new SkinSettings(enabled, username, texture, model);
        apiBaseUrl = getConfig().getString("api.base-url", "").replaceAll("/+$", "");
        apiToken = getConfig().getString("api.token", "");

        if (pollTaskId != -1) {
            Bukkit.getScheduler().cancelTask(pollTaskId);
            pollTaskId = -1;
        }
        if (!apiBaseUrl.isBlank() && !apiToken.isBlank()) {
            if (!apiBaseUrl.startsWith("https://")) {
                getLogger().severe("api.base-url must use HTTPS; remote sync disabled.");
            } else if (apiToken.length() < 32) {
                getLogger().severe("api.token must be at least 32 characters; remote sync disabled.");
            } else {
                long seconds = Math.max(10, getConfig().getLong("api.poll-seconds", 30));
                pollTaskId = Bukkit.getScheduler().runTaskTimerAsynchronously(
                    this, this::pollRemoteConfig, 1L, seconds * 20L
                ).getTaskId();
                getLogger().info("Remote skin sync enabled; polling every " + seconds + " seconds.");
            }
        } else {
            getLogger().info("Remote sync disabled; using local skin settings.");
        }
        for (Player player : Bukkit.getOnlinePlayers()) {
            if (activeSkin.username().equalsIgnoreCase(player.getName())) {
                if (activeSkin.enabled()) applySkin(player, activeSkin);
                else restoreSkin(player);
            }
        }
    }

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        SkinSettings settings = activeSkin;
        if (settings != null && settings.enabled()
                && settings.username().equalsIgnoreCase(event.getPlayer().getName())) {
            applySkin(event.getPlayer(), settings);
        }
    }

    private void pollRemoteConfig() {
        if (!pollInFlight.compareAndSet(false, true)) return;
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(apiBaseUrl + "/api/v1/config"))
                .timeout(Duration.ofSeconds(10))
                .header("Authorization", "Bearer " + apiToken)
                .header("Accept", "application/json")
                .GET()
                .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                getLogger().warning("ABS API config poll returned HTTP " + response.statusCode());
                return;
            }
            JsonObject root = JsonParser.parseString(response.body()).getAsJsonObject();
            long revision = root.has("revision") ? root.get("revision").getAsLong() : -1;
            if (revision <= lastRevision) return;
            JsonObject skin = root.getAsJsonObject("skin");
            if (skin == null) {
                getLogger().warning("ABS API response has no skin configuration.");
                return;
            }
            SkinSettings candidate = new SkinSettings(
                skin.has("enabled") && skin.get("enabled").getAsBoolean(),
                skin.has("username") ? skin.get("username").getAsString() : "ABS_Bot",
                skin.has("textureUrl") ? skin.get("textureUrl").getAsString() : "",
                skin.has("model") ? skin.get("model").getAsString() : "classic"
            );
            String validationError = candidate.validationError();
            if (validationError != null) {
                getLogger().warning("Rejected remote skin configuration: " + validationError);
                return;
            }
            activeSkin = candidate;
            lastRevision = revision;
            Bukkit.getScheduler().runTask(this, () -> {
                for (Player player : Bukkit.getOnlinePlayers()) {
                    if (!candidate.username().equalsIgnoreCase(player.getName())) continue;
                    if (candidate.enabled()) applySkin(player, candidate);
                    else restoreSkin(player);
                }
            });
            getLogger().info("Applied ABS remote configuration revision " + revision + ".");
        } catch (Exception error) {
            getLogger().warning("ABS API sync failed: " + error.getClass().getSimpleName() + ": " + error.getMessage());
        } finally {
            pollInFlight.set(false);
        }
    }

    private void applySkin(Player player, SkinSettings settings) {
        String validationError = settings.validationError();
        if (validationError != null) {
            getLogger().warning("Skin not applied: " + validationError);
            return;
        }
        if (!settings.enabled()) return;
        try {
            originalProfiles.putIfAbsent(player.getUniqueId(), player.getPlayerProfile());
            PlayerProfile profile = player.getPlayerProfile();
            PlayerTextures textures = profile.getTextures();
            URL texture = URI.create(settings.textureUrl()).toURL();
            textures.setSkin(texture, settings.isSlim() ? PlayerTextures.SkinModel.SLIM : PlayerTextures.SkinModel.CLASSIC);
            profile.setTextures(textures);
            player.setPlayerProfile(profile);
            getLogger().info("Applied configured skin to " + player.getName() + ".");
        } catch (Exception error) {
            getLogger().warning("Could not apply skin to " + player.getName() + ": " + error.getMessage());
        }
    }

    private void restoreSkin(Player player) {
        PlayerProfile original = originalProfiles.get(player.getUniqueId());
        if (original != null && player.isOnline()) {
            player.setPlayerProfile(original);
            getLogger().info("Restored original skin for " + player.getName() + ".");
        }
    }

    @Override
    public void onDisable() {
        if (pollTaskId != -1) Bukkit.getScheduler().cancelTask(pollTaskId);
    }
}
