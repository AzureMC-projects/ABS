package com.azuremc.abs.skins;

import java.net.MalformedURLException;
import java.net.URL;

import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.profile.PlayerProfile;
import org.bukkit.profile.PlayerTextures;

public final class AbsSkinsPlugin extends JavaPlugin implements Listener {

    @Override
    public void onEnable() {
        saveDefaultConfig();
        getServer().getPluginManager().registerEvents(this, this);

        if (getCommand("abs-skin") != null) {
            getCommand("abs-skin").setExecutor((sender, command, label, args) -> {
                if (!sender.hasPermission("abs.skins.admin")) {
                    sender.sendMessage("You do not have permission to use ABS-Skins.");
                    return true;
                }

                if (args.length == 1 && args[0].equalsIgnoreCase("reload")) {
                    reloadConfig();
                    sender.sendMessage("ABS-Skins configuration reloaded.");
                    return true;
                }

                sender.sendMessage("Usage: /abs-skin reload");
                return true;
            });
        }
    }

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        applySkin(event.getPlayer());
    }

    private void applySkin(Player player) {
        String botName = getConfig().getString("bot.name", "ABS-Bot");
        boolean enabled = getConfig().getBoolean("skin.enabled", false);
        String texture = getConfig().getString("skin.texture", "");
        String model = getConfig().getString("skin.model", "classic");

        if (!enabled || texture.isBlank() || !player.getName().equalsIgnoreCase(botName)) {
            return;
        }

        try {
            URL skinUrl = new URL(texture);
            PlayerProfile profile = player.getPlayerProfile();
            PlayerTextures textures = profile.getTextures();

            PlayerTextures.SkinModel skinModel =
                    model.equalsIgnoreCase("slim")
                            ? PlayerTextures.SkinModel.SLIM
                            : PlayerTextures.SkinModel.CLASSIC;

            textures.setSkin(skinUrl, skinModel);
            profile.setTextures(textures);
            player.setPlayerProfile(profile);

            getLogger().info("Applied configured skin to " + player.getName() + ".");
        } catch (MalformedURLException exception) {
            getLogger().warning("Invalid skin texture URL in config.yml: " + texture);
        } catch (RuntimeException exception) {
            getLogger().warning("Failed to apply ABS skin: " + exception.getMessage());
        }
    }
}
