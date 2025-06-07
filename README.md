<div align="center">
  <img src="https://res.cloudinary.com/dje6m1lab/image/upload/v1745970240/solo_vdht4s.webp" height="200" width="200"/>
  <h1>Solo is an HTTP request client</h1>
</div>

> I really don't care about your data

[![CI](https://github.com/sreq-inc/Solo/actions/workflows/ci.yml/badge.svg)](https://github.com/sreq-inc/Solo/actions/workflows/ci.yml)

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

- User-friendly interface for creating and managing HTTP requests
- Cross-platform (Windows, macOS, Linux)

## Technologies

- Tauri 2
- Tailwind CSS

## Running the project

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

## License

This project is licensed under the [Business Source License 1.1 (BSL 1.1)](https://mariadb.com/bsl11/).
The BSL allows free use of the software while reserving commercial rights for the original author. For complete details, see the LICENSE file in the root of the repository.
