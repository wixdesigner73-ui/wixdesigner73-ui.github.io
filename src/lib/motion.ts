import { useLayoutEffect, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export const EASE = 'expo.out'
export const lenisRef: { current: Lenis | null } = { current: null }

export const prefersReduced = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
export const isCoarse = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches
export const isNarrow = () => typeof matchMedia !== 'undefined' && matchMedia('(max-width: 820px)').matches

/** gsap.context scoped to a ref, reverted on unmount. */
export function useGsap(fn: (self: gsap.Context) => void | (() => void), scope: React.RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useLayoutEffect(() => {
    const ctx = gsap.context((self) => fn(self), scope)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export function useSeo(title: string, description: string) {
  useEffect(() => {
    document.title = title
    let m = document.querySelector('meta[name="description"]')
    if (!m) {
      m = document.createElement('meta')
      m.setAttribute('name', 'description')
      document.head.appendChild(m)
    }
    m.setAttribute('content', description)
  }, [title, description])
}
