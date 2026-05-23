/**
 * Derived lens EXIF tags at write/preview time (not stored in preset JSON).
 */

/** When `LensModel` is in the write payload, set derived lens tags to the same value (or clear them). */
export function syncLensTagsFromLensModel(payload: Record<string, unknown>): Record<string, unknown> {
  if (!Object.prototype.hasOwnProperty.call(payload, 'LensModel')) {
    return { ...payload }
  }
  const out = { ...payload }
  const model = out['LensModel']
  if (model === '' || model === null) {
    out['Lens'] = ''
    out['LensID'] = ''
    return out
  }
  const s = String(model ?? '').trim()
  out['Lens'] = s || ''
  out['LensID'] = s || ''
  return out
}

export const syncLensIdFromLensModel = syncLensTagsFromLensModel
