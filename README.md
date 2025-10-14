<div align="center">
  <img src="https://res.cloudinary.com/dje6m1lab/image/upload/v1745970240/solo_vdht4s.webp" height="200" width="200"/>
  <h1>Solo - Your next API Client ⚡</h1>
</div>

[![CI](https://github.com/sreq-inc/Solo/actions/workflows/ci.yml/badge.svg)](https://github.com/sreq-inc/Solo/actions/workflows/ci.yml) [![publish](https://github.com/sreq-inc/solo/actions/workflows/publish.yml/badge.svg)](https://github.com/sreq-inc/solo/actions/workflows/publish.yml)

<img width="1106" alt="image" src="https://github.com/user-attachments/assets/1edebfa9-ff8a-466a-a5ae-4b8eed207a39" />

## Installation

### macOS

```bash
curl -s https://api.github.com/repos/sreq-inc/solo/releases/latest \
| grep "browser_download_url" \
| grep ".dmg" \
| cut -d '"' -f 4 \
| xargs -n 1 curl -L --output solo.dmg && open solo.dmg
```

## Features

📁 Create and manage collections

- 🌐 HTTP requests – PUT, POST, GET, DELETE, and PATCH
- 🔐 Authentication – Bearer Token and Basic Auth
- 🧩 Query parameters
- 🧪 Variables
- 📝 JSON body formatting
- 🔎 GraphQL request support
- 📤 Export as cURL
- 🧑‍💻 User-friendly interface for creating and managing HTTP requests

## Running the project locally

```bash
# Install dependencies
bun install
# Start in development mode
bun tauri dev
```

## Build

```bash
# Build the application
bun tauri build
```

## Development

### Version Management

To update the project version across all configuration files:

```bash
./version.sh
```

This script will:

- Display the current version
- Prompt for the new version
- Update `package.json`, `src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json`
- Create a git commit with the changes

## License

This project is licensed under the [Business Source License 1.1 (BSL 1.1)](https://mariadb.com/bsl11/).
The BSL allows free use of the software while reserving commercial rights for the original author. For complete details, see the LICENSE file in the root of the repository.
