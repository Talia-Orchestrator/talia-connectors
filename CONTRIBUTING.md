# Contributing

`packages/` contains two package families:

- ArtCraft presets mirror the desktop's curated `ArtcraftMcpPreset` definitions. Keep `connector.json` schema version 1, preserve official documentation references, and do not add user paths, tokens, environment values, or server instances.
- Generic local and remote templates use `{ "schemaVersion": 1, "template": ... }`. Follow `schemas/connector-template.schema.json`; stdio templates require `command_hint` and `args`, while Streamable HTTP templates require an HTTPS `url_hint`. These are hints shown to the user, not configured or started servers.

Use the matching starter under `templates/` when adding a generic template. Keep packages declarative: discovery and installation must not start MCP processes, write connection settings, or execute package code. Store inclusion is an explicit selection; adding a package here alone does not publish it.

The three JSON files in `examples/` are generic local/remote MCP form examples, not installable packages. Keep placeholder values and their non-importable status explicit. Never replace placeholders with real credentials, private URLs, or machine-specific paths.

Run `npm test` in this repository before opening a pull request. The catalog packer and store tests validate the package shape and catalog inclusion separately.
