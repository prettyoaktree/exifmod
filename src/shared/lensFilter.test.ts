import { describe, expect, it } from 'vitest'
import { lensPresetIdForWrite } from './lensFilter.js'

describe('lensPresetIdForWrite', () => {
  it('keeps the selected lens for interchangeable cameras', () => {
    expect(lensPresetIdForWrite(12, { lens_system: 'interchangeable', locks_lens: false })).toBe(12)
  })

  it('drops the selected lens when the camera locks a fixed lens', () => {
    expect(lensPresetIdForWrite(12, { lens_system: 'fixed', locks_lens: true })).toBeNull()
  })

  it('treats fixed lens_system as locked even without locks_lens', () => {
    expect(lensPresetIdForWrite(12, { lens_system: 'fixed' })).toBeNull()
  })

  it('keeps null lens selections unchanged', () => {
    expect(lensPresetIdForWrite(null, { lens_system: 'interchangeable', locks_lens: false })).toBeNull()
  })
})
