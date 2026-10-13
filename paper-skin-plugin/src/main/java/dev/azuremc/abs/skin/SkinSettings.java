package dev.azuremc.abs.skin;

import java.net.URI;
import java.util.Locale;
import java.util.regex.Pattern;

public record SkinSettings(boolean enabled, String username, String textureUrl, String model) {
    private static final Pattern USERNAME = Pattern.compile("^[A-Za-z0-9_]{1,16}$");
    private static final Pattern TEXTURE = Pattern.compile("^https://textures\\.minecraft\\.net/texture/[a-fA-F0-9]+$");

    public static SkinSettings fromConfig(org.bukkit.configuration.ConfigurationSection section) {
        return new SkinSettings(
            section.getBoolean("enabled", false),
            section.getString("username", "ABS-Bot"),
            section.getString("texture-url", ""),
            section.getString("model", "classic")
        );
    }

    public String validationError() {
        if (username == null || !USERNAME.matcher(username).matches()) return "username must be a valid Minecraft username.";
        if (model == null || !(model.equalsIgnoreCase("classic") || model.equalsIgnoreCase("slim"))) return "model must be classic or slim.";
        if (enabled && (textureUrl == null || !TEXTURE.matcher(textureUrl).matches())) return "enabled skin requires a textures.minecraft.net texture URL.";
        if (textureUrl != null && !textureUrl.isBlank() && !TEXTURE.matcher(textureUrl).matches()) return "texture URL is not an allowed Minecraft texture URL.";
        return null;
    }

    public boolean isSlim() {
        return "slim".equals(model.toLowerCase(Locale.ROOT));
    }

    public URI textureUri() {
        return URI.create(textureUrl);
    }
}
