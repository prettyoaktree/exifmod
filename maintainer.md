# Maintainer notes

Operational checklist for **exifmod** releases: signing, GitHub Actions secrets, and Homebrew cask bumps. **Do not commit real credentials**—use GitHub **Actions secrets** and a password manager or keychain for values; this file should only list secret *names* and procedures.

## GitHub Actions secrets (`exifmod` repo)

In **Settings → Secrets and variables → Actions**, configure:

| Secret | Purpose |
| ------ | ------- |
| `CSC_LINK` | Base64-encoded **Developer ID Application** `.p12` (same format expected by `apple-actions/import-codesign-certs`). |
| `CSC_KEY_PASSWORD` | Password for the `.p12`. |
| `APPLE_API_KEY_P8_BASE64` | Base64-encoded contents of the App Store Connect **API key** `.p8` file. |
| `APPLE_API_KEY_ID` | Key ID from App Store Connect. |
| `APPLE_API_ISSUER` | Issuer ID (UUID) from App Store Connect. |
| `AZURE_TENANT_ID` | Entra tenant ID for the app registration used by Windows release signing. |
| `AZURE_CLIENT_ID` | Application (client) ID for the Windows release signing service principal. |
| `AZURE_CLIENT_SECRET` | Client secret value for the Windows release signing service principal. |

The workflow [`.github/workflows/release-macos.yml`](.github/workflows/release-macos.yml) writes the `.p8` to a temp path and exports `APPLE_API_KEY`, `APPLE_API_KEY_ID`, and `APPLE_API_ISSUER` for [`scripts/afterSign.mjs`](scripts/afterSign.mjs).

The workflow [`.github/workflows/release-windows.yml`](.github/workflows/release-windows.yml) passes the Azure values to `electron-builder`, which signs Windows artifacts through Azure Artifact Signing (`build.win.azureSignOptions` in [`package.json`](package.json)). With `electron-builder@25.1.8`, keep `publisherName` in `build.win.publisherName`; unknown `azureSignOptions` keys are passed directly to `Invoke-TrustedSigning`.

Use [`.github/workflows/test-windows-signing.yml`](.github/workflows/test-windows-signing.yml) to verify Windows signing without publishing a GitHub Release. It builds the NSIS installer with `--publish never` and fails if `Get-AuthenticodeSignature` does not return `Valid` for the expected publisher.

Current Windows signing resource names:

| Resource | Value |
| -------- | ----- |
| Subscription | `5af04908-5e57-4f29-b319-1a8e5c52cd94` |
| Resource group | `ay-trusted-signing` |
| Artifact Signing account | `ay-trusted-signing` |
| Account endpoint | `https://eus.codesigning.azure.net/` |
| Certificate profile | `ay-cert` |
| Publisher name | `Alon Yaffe` |
| Signing service principal | `github-exifmod-windows-signing` |

The signing identity must have **Artifact Signing Certificate Profile Signer** on the certificate profile scope:

```bash
az role assignment create \
  --assignee <service-principal-object-id> \
  --role "Artifact Signing Certificate Profile Signer" \
  --scope "/subscriptions/5af04908-5e57-4f29-b319-1a8e5c52cd94/resourceGroups/ay-trusted-signing/providers/Microsoft.CodeSigning/codeSigningAccounts/ay-trusted-signing/certificateProfiles/ay-cert"
```

Rotate the `AZURE_CLIENT_SECRET` value periodically. When rotating, create a new app credential for `github-exifmod-windows-signing` and update the GitHub Actions secret with the new **secret value** (not the secret ID).

## Release checklist

1. Land changes on `main` via PR (protected branch).
2. Bump `version` in `package.json` to match the release you intend to ship.
3. Push git tag `v<version>` (must match `package.json`, e.g. `v1.0.2` for `1.0.2`).
4. **Invariant check before tagging:** `package.json.version` numeric part must equal the tag numeric part (standard: `version=1.3.2`, `tag=v1.3.2`).
5. **Do not** pre-create a **published** GitHub Release with `gh release create` before CI unless you understand `electron-builder`: it matches **draft** vs **published** releases. This repo sets `build.publish.releaseType` to **`release`** in `package.json` so assets upload correctly. If you already created an empty published release and CI skipped binaries, delete that release (`gh release delete vX.Y.Z`) and re-run the **Release (macOS)** and **Release (Windows)** workflows on `main` at the commit that includes the version bump (or move the tag and push).
6. Confirm **Release (macOS)** uploaded `EXIFmod-<version>.dmg`, `EXIFmod-<version>.dmg.sha256` (for the Homebrew bump script), `EXIFmod-<version>.zip`, and `latest-mac.yml`, and **Release (Windows)** uploaded the NSIS installer, `latest.yml`, and updater blockmap files, all under `releases/download/v<version>/...` (not an `untagged-...` draft URL).

## Homebrew cask bump

After the app release exists, run (from this repo, with a clean clone of the tap):

```bash
TAP_DIR=/path/to/homebrew-exifmod ./scripts/publish-homebrew-tap-release.sh
```

That updates the cask to download the DMG from **this** repo’s releases (not from the tap repo’s releases).

Policy notes:

- Homebrew is the bootstrap/install channel; in-app updater remains the primary day-to-day updater for signed macOS builds.
- Keep the cask versioned/checksummed (no dynamic latest URL strategy).
- Keep `auto_updates true` on the cask intentionally; cask bumps still happen every GitHub app release so new Homebrew installs get latest.
- On each GitHub app release, publish the Homebrew cask bump in the same release cycle.
- Retain a rolling window of the latest **3** app releases on GitHub for updater safety; prune older releases only after validating newest feed/artifacts.
