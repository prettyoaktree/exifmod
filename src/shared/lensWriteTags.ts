/**
 * Derived lens EXIF tags at write/preview time (not stored in preset JSON).
 */

/** When `LensModel` is in the write payload, set `LensID` to the same value (or clear both). */
export function syncLensIdFromLensModel(payload: Record<string, unknown>): Record<string, unknown> {
  if (!Object.prototype.hasOwnProperty.call(payload, 'LensModel')) {
    return { ...payload }
  }
  const out = { ...payload }
  const model = out['LensModel']
  if (model === '' || model === null) {
    out['LensID'] = ''
    return out
  }
  const s = String(model ?? '').trim()
  if (s) out['LensID'] = s
  else out['LensID'] = ''
  return out
}
