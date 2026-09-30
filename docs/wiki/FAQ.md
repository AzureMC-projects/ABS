# FAQ

## What is ABS?

ABS stands for **Azures Bot Service**, a Minecraft bot project maintained by AzureMC-projects.

## What does ABS do?

ABS connects to a Minecraft server, automatically reconnects after disconnects, handles respawning, and continuously walks with occasional jumps.

## Can ABS run on Render?

Yes. The repository includes Render deployment configuration.

## Does ABS support offline-mode servers?

ABS defaults to offline authentication. Server, proxy, and authentication-plugin configuration can affect final behavior.

## How do I change the bot's skin?

Use the planned ABS-Skins Paper plugin and the ABS Control Panel. See [Custom Skins](Custom-Skins.md).

## What texture URL should I use?

Use a direct Minecraft texture URL:

```text
https://textures.minecraft.net/texture/<texture-id>
```

## Can I use a NameMC URL?

No. The skin configuration expects a direct Minecraft texture URL.

## Can the Control Panel contain secrets?

No. GitHub Pages is public. Never put passwords, tokens, Render API keys, or private server credentials in the public Control Panel.

## Where do I report bugs?

Use the repository's GitHub issue templates and include enough technical information to reproduce the problem without exposing secrets.
