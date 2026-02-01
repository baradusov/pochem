# Contributing

Thanks for your interest in contributing to почём!

## Getting Started

```bash
# Clone the repo
git clone https://github.com/baradusov/pochem.git
cd pochem

# Install dependencies
npm install

# Start Expo
npm start
```

## Development

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go on your phone

For native builds, see [README.md](./README.md#native-build).

## Architecture

Before contributing, please read [CLAUDE.md](./CLAUDE.md) — it describes the architecture and coding conventions.

Key principles:
- **core/** contains business logic and must be framework-agnostic
- **UI layer** only renders, no business logic
- **Ports & Adapters** pattern for external dependencies

## Pull Requests

1. Fork the repo and create your branch from `main`
2. Make your changes
3. Test on iOS and/or Android
4. Create a pull request

### PR Guidelines

- Keep PRs focused — one feature or fix per PR
- Follow existing code style
- Update documentation if needed

## Versioning

This project uses [CalVer](https://calver.org/): `YY.MM.patch`

- `25.2.1` — first release of February 2025
- `25.2.2` — second release of February
- `25.3.1` — first release of March

Version is set in `app.json` and `package.json`. Build number (`buildNumber` in `app.json`) increments independently for app store submissions.

After changing version in `app.json`, run `npx expo prebuild --clean` to sync with native projects.

## Issues

- Use GitHub Issues for bugs and feature requests
- Search existing issues before creating a new one
- Provide steps to reproduce for bugs

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
