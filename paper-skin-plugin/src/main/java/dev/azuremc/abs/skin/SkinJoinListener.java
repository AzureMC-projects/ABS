package dev.azuremc.abs.skin;

import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;

public final class SkinJoinListener implements Listener {
    private final ABSSkinSystemPlugin plugin;

    public SkinJoinListener(ABSSkinSystemPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        plugin.applyOnJoin(event.getPlayer());
    }
}
