# Releasing

## iOS

1. Update `app.json`:
   - `expo.version` — bump if new release (CalVer: `YY.MM.patch`)
   - `expo.ios.buildNumber` — always increment

2. Update `package.json` version to match

3. Update `CHANGELOG.md` if new version

4. Run checks:
   ```bash
   npm run check
   ```

5. Rebuild native project:
   ```bash
   npx expo prebuild --clean
   ```

6. Open Xcode:
   ```bash
   open ios/pochyom.xcworkspace
   ```

7. Select "Any iOS Device (arm64)"

8. **Product → Archive**

9. After archive: **Distribute App → App Store Connect**

10. Commit changes:
   ```bash
   git add -A && git commit -m "chore: release 25.X.X (build N)"
   ```

## Android

TODO
