import { describe, expect, it } from 'vitest'
import { isPathExtensionInSet, parseExiftoolExtensionList } from './exiftoolRunner.js'

describe('parseExiftoolExtensionList', () => {
  it('parses wrapped ExifTool extension output', () => {
    const parsed = parseExiftoolExtensionList(`
Writable file extensions:
  360 3G2 3GP AAE
  JPG JPEG JXL
  TIF TIFF XMP
`)

    expect(parsed).toEqual(new Set(['.360', '.3g2', '.3gp', '.aae', '.jpg', '.jpeg', '.jxl', '.tif', '.tiff', '.xmp']))
  })

  it('handles one-line headers and dotted extensions', () => {
    const parsed = parseExiftoolExtensionList('Writable file extensions: .JPG, .PDF; XMP')

    expect(parsed).toEqual(new Set(['.jpg', '.pdf', '.xmp']))
  })

  it('ignores prose and unsupported punctuation tokens', () => {
    const parsed = parseExiftoolExtensionList(`
Writable file extensions:
  JPG (read/write) -- TIFF
`)

    expect(parsed).toEqual(new Set(['.jpg', '.tiff']))
  })

  it('matches file paths against parsed extensions', () => {
    const extensions = parseExiftoolExtensionList('Writable file extensions:\n  JPG PDF')

    expect(isPathExtensionInSet('/photos/scan.JPG', extensions)).toBe(true)
    expect(isPathExtensionInSet('/photos/contact.pdf', extensions)).toBe(true)
    expect(isPathExtensionInSet('/photos/notes.txt', extensions)).toBe(false)
    expect(isPathExtensionInSet('/photos/no-extension', extensions)).toBe(false)
  })
})
