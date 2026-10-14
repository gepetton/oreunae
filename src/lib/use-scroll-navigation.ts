import { useEffect, useRef } from 'react'

/** Recede on downward scroll and return sooner on upward scroll. */
export function useScrollNavigation(activeTab: string) {
  const navigationRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const navigation = navigationRef.current
    if (!navigation) return
    // Clamp Safari's rubber-band overscroll so bouncing does not reverse direction.
    const scrollPosition = () => Math.max(0, Math.min(window.scrollY, document.documentElement.scrollHeight - window.innerHeight))
    let previous = scrollPosition()
    let distance = 0
    let direction = 0
    let frame = 0
    let keyboardInteraction = false
    const reveal = () => {
      delete navigation.dataset.hidden
      previous = scrollPosition()
      distance = 0
      direction = 0
    }
    const update = () => {
      frame = 0
      const current = scrollPosition()
      const delta = current - previous
      previous = current
      if (current <= 64 || (keyboardInteraction && navigation.contains(document.activeElement))) {
        reveal()
        return
      }
      if (delta === 0) return
      const nextDirection = Math.sign(delta)
      distance = nextDirection === direction ? distance + Math.abs(delta) : Math.abs(delta)
      direction = nextDirection
      if (direction > 0 && distance >= 24) navigation.dataset.hidden = 'true'
      if (direction < 0 && distance >= 10) delete navigation.dataset.hidden
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const onKeyDown = () => {
      keyboardInteraction = true
      if (navigation.contains(document.activeElement)) reveal()
    }
    const onPointerDown = () => { keyboardInteraction = false }
    // A new destination, including browser history navigation, starts visible.
    reveal()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    navigation.addEventListener('focusin', reveal)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
      navigation.removeEventListener('focusin', reveal)
    }
  }, [activeTab])

  return navigationRef
}
