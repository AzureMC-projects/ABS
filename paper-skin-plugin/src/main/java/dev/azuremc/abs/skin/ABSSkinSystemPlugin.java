package dev.azuremc.abs.skin;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import io.papermc.paper.profile.PlayerProfile;
import io.papermc.paper.profile.PlayerTextures;
import java.net.URI;
import java.net.URL;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Locale;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

public final class ABSSkinSystemPlugin extends JavaPlugin {
    private HttpClient httpClient;
    private String apiBaseUrl;
    private String apiToken;
    private SkinSettings activeSkin;
    private long lastRevision = -1;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
        apiBaseUrl = getConfig().getString("api.base-url", "").replaceAll("/+$", "");
        apiToken = getConfig().getString("api.token", "");
        activeSkin = SkinSettings.fromConfig(getConfig().getConfigurationSection("skin"));
        String localError = activeSkin.validationError();
        if (localError != null) getLogger().warning("Local skin settings: " + localError);

        long pollSeconds = Math.max(10, getConfig().getLong("api.poll-seconds", 30));
        Bukkit.getPluginManager().registerEvents(new SkinJoinListener(this), this);
        if (apiBaseUrl.isBlank() || apiToken.isBlank()) {
            getLogger().warning("Remote sync is disabled: set api.base-url and api.token in config.yml.");
            return;
        }
        if (!apiBaseUrl.startsWith("https://")) {
            getLogger().severe("api.base-url must use HTTPS. Remote sync has been disabled.");
            return;
        }
        Bukkit.getScheduler().runTaskTimerAsynchronously(this, this::pollRemoteConfig, 1L, pollSeconds * 20L);
    }

    void applyOnJoin(Player player) {
        if (!getConfig().getBoolean("skin.apply-on-join", true)) return;
        SkinSettings settings = activeSkin;
        if (settings == null || !settings.enabled() || !settings.username().equalsIgnoreCase(player.getName())) return;
        applySkin(player, settings);
    }

    private void pollRemoteConfig() {
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
                skin.has("username") ? skin.get("username").getAsString() : "ABS-Bot",
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
                    if (candidate.username().equalsIgnoreCase(player.getName()) && candidate.enabled()) {
                        applySkin(player, candidate);
                    }
                }
            });
            getLogger().info("Applied ABS remote configuration revision " + revision + ".");
        } catch (Exception error) {
            getLogger().warning("ABS API sync failed: " + error.getClass().getSimpleName() + ": " + error.getMessage());
        }
    }

    private void applySkin(Player player, SkinSettings settings) {
        String validationError = settings.validationError();
        if (validationError != null) {
            getLogger().warning("Skin not applied: " + validationError);
            return;
        }
        if (!settings.enabled()) return;

        CompletableFuture.runAsync(() -> {
            try {
                PlayerProfile profile = Bukkit.createProfile(player.getUniqueId(), player.getName());
                PlayerTextures textures = profile.getTextures();
                URL texture = settings.textureUri().toURL();
                textures.setSkin(texture, settings.isSlim() ? PlayerTextures.SkinModel.SLIM : PlayerTextures.SkinModel.CLASSIC);
                profile.setTextures(textures);
                Bukkit.getScheduler().runTask(this, () -> {
                    Player current = Bukkit.getPlayer(player.getUniqueId());
                    if (current != null && current.isOnline() && settings.username().equalsIgnoreCase(current.getName())) {
                        current.setPlayerProfile(profile);
                        getLogger().info("Applied configured skin to " + current.getName() + ".");
                    }
                });
            } catch (Exception error) {
                getLogger().warning("Could not apply skin to " + player.getName() + ": " + error.getMessage());
            }
        });
    }

    @Override
    public void onDisable() {
        // HttpClient owns no persistent threads; Bukkit cancels scheduled tasks.
    }
}
