# Releasing

## iOS

1. Update `app.json`:
   - `expo.version` — bump if new release (CalVer: `YY.MM.patch`)
   - `expo.ios.buildNumber` — always increment

2. Update `package.json` version to match

3. Update `CHANGELOG.md` if new version

4. Rebuild native project:
   ```bash
   npx expo prebuild --clean
   ```

5. Open Xcode:
   ```bash
   open ios/pochyom.xcworkspace
   ```

6. Select "Any iOS Device (arm64)"

7. **Product → Archive**

8. After archive: **Distribute App → App Store Connect**

9. Commit changes:
   ```bash
   git add -A && git commit -m "chore: release 25.X.X (build N)"
   ```

## Android

TODO
