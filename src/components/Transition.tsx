import { createContext, useCallback, useContext, useRef, type MouseEvent, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { gsap, lenisRef, prefersReduced, ScrollTrigger } from '../lib/motion'

type Go = (to: string) => void
const Ctx = createContext<Go>(() => {})
export const useGo = () => useContext(Ctx)

/** Link that routes through the cinematic page curtain while keeping a real href. */
export function TLink({ to, className, children, onClick, ...rest }: {
  to: string; className?: string; children: ReactNode; onClick?: () => void; 'aria-label'?: string; 'aria-current'?: 'page'
}) {
  const go = useGo()
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    onClick?.()
    go(to)
  }
  return <a href={to} className={className} onClick={handle} {...rest}>{children}</a>
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const curtain = useRef<HTMLDivElement>(null)
  const busy = useRef(false)

  const toTop = () => {
    lenisRef.current?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo(0, 0)
  }

  const go = useCallback<Go>((to) => {
    if (busy.current) return
    if (to === pathname) { lenisRef.current ? lenisRef.current.scrollTo(0, { duration: 1.4 }) : window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    const el = curtain.current
    if (!el || prefersReduced()) { navigate(to); toTop(); return }
    busy.current = true
    lenisRef.current?.stop()
    const label = el.querySelector('[data-label]')
    const tl = gsap.timeline()
    tl.set(el, { visibility: 'visible', yPercent: 100, borderRadius: '50% 50% 0 0 / 12% 12% 0 0' })
      .to(el, { yPercent: 0, borderRadius: '0% 0% 0 0', duration: 0.75, ease: 'power4.inOut' })
      .fromTo(label, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, '-=0.3')
      .add(() => {
        navigate(to)
        toTop()
        setTimeout(() => ScrollTrigger.refresh(), 60)
      })
      .to(label, { y: -30, opacity: 0, duration: 0.35, ease: 'power2.in' }, '+=0.35')
      .to(el, { yPercent: -100, duration: 0.8, ease: 'power4.inOut' }, '<0.1')
      .set(el, { visibility: 'hidden' })
      .add(() => {
        busy.current = false
        lenisRef.current?.start()
        ScrollTrigger.refresh()
      })
  }, [navigate, pathname])

  return (
    <Ctx.Provider value={go}>
      {children}
      <div
        ref={curtain}
        aria-hidden="true"
        className="fixed inset-0 z-[90] flex items-center justify-center bg-carbon"
        style={{ visibility: 'hidden', transform: 'translateY(100%)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 to-ink" />
        <div data-label className="relative display text-center text-bone" style={{ fontSize: 'clamp(2rem,6vw,5rem)' }}>
          Neil&apos;s Express
          <div className="mx-auto mt-4 h-[2px] w-16 bg-race" />
        </div>
      </div>
    </Ctx.Provider>
  )
}
