import { useEffect, useRef } from 'react'

/** Visual feedback only; native scrolling and link activation stay untouched. */
export function useTouchFeedback() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let press: { element: Element; pointerId: number; x: number; y: number } | undefined
    const clear = () => {
      press?.element.removeAttribute('data-touch-pressed')
      press = undefined
    }
    const start = (event: PointerEvent) => {
      clear()
      if (event.pointerType === 'mouse' || !event.isPrimary || event.button !== 0) return
      const target = event.target
      if (!(target instanceof Element) || target.closest('.save-button')) return
      const element = target.closest('.home-tabs [role="tab"], .home-asset-card, .indicator-section .macro-tile')
      if (!element || !root.contains(element)) return
      press = { element, pointerId: event.pointerId, x: event.clientX, y: event.clientY }
      element.setAttribute('data-touch-pressed', '')
    }
    const move = (event: PointerEvent) => {
      if (!press || press.pointerId !== event.pointerId) return
      if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > 8) clear()
    }
    const finish = (event: PointerEvent) => {
      if (press?.pointerId === event.pointerId) clear()
    }
    root.addEventListener('pointerdown', start, { passive: true })
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', finish, { passive: true })
    window.addEventListener('pointercancel', finish, { passive: true })
    window.addEventListener('scroll', clear, { capture: true, passive: true })
    window.addEventListener('blur', clear)
    return () => {
      clear()
      root.removeEventListener('pointerdown', start)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
      window.removeEventListener('scroll', clear, true)
      window.removeEventListener('blur', clear)
    }
  }, [])

  return rootRef
}
