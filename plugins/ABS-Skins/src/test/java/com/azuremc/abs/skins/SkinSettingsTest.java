package com.azuremc.abs.skins;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class SkinSettingsTest {
    @Test
    void acceptsValidClassicSkin() {
        SkinSettings settings = new SkinSettings(true, "ABS_Bot", "https://textures.minecraft.net/texture/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "classic");
        assertNull(settings.validationError());
        assertEquals(false, settings.isSlim());
    }

    @Test
    void acceptsSlimSkin() {
        SkinSettings settings = new SkinSettings(true, "ABS_Bot", "https://textures.minecraft.net/texture/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "slim");
        assertNull(settings.validationError());
        assertEquals(true, settings.isSlim());
    }

    @Test
    void rejectsArbitraryTextureHosts() {
        SkinSettings settings = new SkinSettings(true, "ABS_Bot", "https://example.com/skin.png", "classic");
        assertNotNull(settings.validationError());
    }

    @Test
    void requiresTextureWhenEnabled() {
        SkinSettings settings = new SkinSettings(true, "ABS_Bot", "", "classic");
        assertNotNull(settings.validationError());
    }
}
