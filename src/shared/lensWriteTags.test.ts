import { describe, expect, it } from 'vitest'
import { syncLensIdFromLensModel } from './lensWriteTags.js'

describe('syncLensIdFromLensModel', () => {
  it('mirrors non-empty LensModel to LensID', () => {
    expect(syncLensIdFromLensModel({ LensModel: 'Canon LTM 50mm f/1.4' })).toEqual({
      LensModel: 'Canon LTM 50mm f/1.4',
      LensID: 'Canon LTM 50mm f/1.4'
    })
  })

  it('clears LensID when LensModel is empty', () => {
    expect(syncLensIdFromLensModel({ LensModel: '' })).toEqual({ LensModel: '', LensID: '' })
  })

  it('clears LensID when LensModel is whitespace only', () => {
    expect(syncLensIdFromLensModel({ LensModel: '   ' })).toEqual({ LensModel: '   ', LensID: '' })
  })

  it('does not add LensID when LensModel is absent', () => {
    expect(syncLensIdFromLensModel({ LensMake: 'Canon' })).toEqual({ LensMake: 'Canon' })
  })
})
