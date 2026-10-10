import { useCallback, useRef, useState } from 'react'

const WIDTH_KEY = 'cowork:composerWidth'
const MIN_W = 520
/** Never wider than this fraction of the window, so the panel keeps margins. */
const MAX_FRACTION = 0.95
/** Fraction of the column used when the user has not dragged a width yet. */
const DEFAULT_FRACTION = 0.8

function clamp(w: number): number {
  const maxPx = Math.max(MIN_W, Math.round(window.innerWidth * MAX_FRACTION) - 48)
  return Math.min(maxPx, Math.max(MIN_W, Math.round(w)))
}

function stored(): number | null {
  const raw = Number(window.localStorage.getItem(WIDTH_KEY))
  return Number.isFinite(raw) && raw >= MIN_W ? clamp(raw) : null
}

function defaultPx(): number {
  return Math.round(window.innerWidth * DEFAULT_FRACTION)
}

export function useComposerWidth() {
  const [customW, setCustomW] = useState<number | null>(stored)
  const widthRef = useRef<number | null>(customW)

  /** The width in px to render (custom when dragged, fraction otherwise). */
  const resolved = customW ?? defaultPx()

  const startResize = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      const handle = e.currentTarget
      const startX = e.clientX
      const startW = widthRef.current ?? defaultPx()
      handle.setPointerCapture(e.pointerId)
      const onMove = (ev: PointerEvent) => {
        const next = clamp(Math.max(startW + 2 * (startX - ev.clientX), MIN_W))
        widthRef.current = next
        setCustomW(next)
      }
      const onUp = () => {
        handle.removeEventListener('pointermove', onMove)
        handle.removeEventListener('pointerup', onUp)
        handle.removeEventListener('pointercancel', onUp)
        if (handle.hasPointerCapture(e.pointerId)) {
          handle.releasePointerCapture(e.pointerId)
        }
        window.localStorage.setItem(WIDTH_KEY, String(widthRef.current ?? defaultPx()))
      }
      handle.addEventListener('pointermove', onMove)
      handle.addEventListener('pointerup', onUp)
      handle.addEventListener('pointercancel', onUp)
    },
    []
  )

  const reset = useCallback(() => {
    widthRef.current = null
    setCustomW(null)
    window.localStorage.removeItem(WIDTH_KEY)
  }, [])

  return {
    /** Render the column at this pixel width. */
    widthPx: resolved,
    /** True when the user has dragged (i.e. not the default column). */
    isCustom: customW != null,
    startResize,
    reset,
    minWidth: MIN_W,
  }
}
