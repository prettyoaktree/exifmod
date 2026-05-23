import { describe, expect, it } from 'vitest'
import { syncLensTagsFromLensModel } from './lensWriteTags.js'

describe('syncLensTagsFromLensModel', () => {
  it('mirrors non-empty LensModel to Lens and LensID', () => {
    expect(syncLensTagsFromLensModel({ LensModel: 'Canon LTM 50mm f/1.4' })).toEqual({
      LensModel: 'Canon LTM 50mm f/1.4',
      Lens: 'Canon LTM 50mm f/1.4',
      LensID: 'Canon LTM 50mm f/1.4'
    })
  })

  it('clears Lens and LensID when LensModel is empty', () => {
    expect(syncLensTagsFromLensModel({ LensModel: '' })).toEqual({ LensModel: '', Lens: '', LensID: '' })
  })

  it('clears Lens and LensID when LensModel is whitespace only', () => {
    expect(syncLensTagsFromLensModel({ LensModel: '   ' })).toEqual({ LensModel: '   ', Lens: '', LensID: '' })
  })

  it('does not add derived tags when LensModel is absent', () => {
    expect(syncLensTagsFromLensModel({ LensMake: 'Canon' })).toEqual({ LensMake: 'Canon' })
  })

  it('overwrites a legacy Lens value with LensModel', () => {
    expect(syncLensTagsFromLensModel({ Lens: 'Legacy', LensModel: 'Modern' })).toEqual({
      Lens: 'Modern',
      LensModel: 'Modern',
      LensID: 'Modern'
    })
  })
})
