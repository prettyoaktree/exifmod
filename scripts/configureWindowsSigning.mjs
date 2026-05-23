import { readFile, writeFile } from 'node:fs/promises'

const requiredEnv = [
  'AZURE_SIGNING_PUBLISHER_NAME',
  'AZURE_SIGNING_ENDPOINT',
  'AZURE_SIGNING_CERTIFICATE_PROFILE_NAME',
  'AZURE_SIGNING_ACCOUNT_NAME'
]

const missing = requiredEnv.filter((name) => !process.env[name])
if (missing.length > 0) {
  throw new Error(`Missing Windows signing configuration: ${missing.join(', ')}`)
}

const packageJsonUrl = new URL('../package.json', import.meta.url)
const pkg = JSON.parse(await readFile(packageJsonUrl, 'utf8'))

pkg.build ??= {}
pkg.build.win ??= {}
pkg.build.win.publisherName = process.env.AZURE_SIGNING_PUBLISHER_NAME
pkg.build.win.azureSignOptions = {
  endpoint: process.env.AZURE_SIGNING_ENDPOINT,
  certificateProfileName: process.env.AZURE_SIGNING_CERTIFICATE_PROFILE_NAME,
  codeSigningAccountName: process.env.AZURE_SIGNING_ACCOUNT_NAME,
  TimestampRfc3161: 'http://timestamp.acs.microsoft.com',
  TimestampDigest: 'SHA256'
}

await writeFile(packageJsonUrl, `${JSON.stringify(pkg, null, 2)}\n`)
console.log('Configured Windows Azure signing for electron-builder')
