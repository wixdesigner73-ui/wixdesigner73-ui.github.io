import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { gsap, isNarrow, prefersReduced, useGsap } from '../lib/motion'
import { IMG } from '../lib/images'
import { Img } from './ui'

const CarScene = lazy(() => import('./CarScene'))

const PHASES = ['Darkness', 'Light', 'Reveal', 'Rotation', 'Statement', 'Exit']
const phaseOf = (p: number) => (p < 0.1 ? 0 : p < 0.4 ? 1 : p < 0.6 ? 2 : p < 0.74 ? 3 : p < 0.9 ? 4 : 5)

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}

export default function CarReveal() {
  const root = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const [near, setNear] = useState(false)
  const [active, setActive] = useState(false)
  const [ready, setReady] = useState(false)
  const [gl] = useState(() => (typeof document === 'undefined' ? true : hasWebGL()) && !prefersReduced())
  const mobile = typeof window !== 'undefined' && isNarrow()
  const onReady = useCallback(() => setReady(true), [])

  // Mount (and download) the heavy 3D scene only when the section is close, render only while visible.
  useEffect(() => {
    const el = root.current!
    const a = new IntersectionObserver(([e]) => setNear(e.isIntersecting || near), { rootMargin: '120% 0px 120% 0px' })
    const b = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: '10% 0px' })
    a.observe(el); b.observe(el)
    return () => { a.disconnect(); b.disconnect() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useGsap(() => {
    const el = root.current!
    const q = (s: string) => el.querySelector(s)
    const lines = el.querySelectorAll('[data-title] .ln > span')
    const label = q('[data-phase]') as HTMLElement
    const rail = q('[data-rail]') as HTMLElement
    const nums = el.querySelectorAll('[data-pn]')
    if (prefersReduced()) { gsap.set(lines, { y: 0 }); gsap.set(q('[data-sub]'), { opacity: 1 }); return }

    let last = -1
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: el, start: 'top top', end: isNarrow() ? '+=330%' : '+=480%', pin: true, scrub: 0.6, anticipatePin: 1,
        onUpdate: (self) => {
          progress.current = self.progress
          const ph = phaseOf(self.progress)
          if (ph !== last) {
            last = ph
            label.textContent = PHASES[ph]
            nums.forEach((n, i) => n.classList.toggle('!text-bone', i === ph))
          }
          gsap.set(rail, { scaleY: self.progress })
        },
      },
    })
    tl.to(q('[data-hint]'), { opacity: 0, y: 20, duration: 0.06 }, 0)
      .fromTo(q('[data-bar-t]'), { yPercent: 0 }, { yPercent: -100, duration: 0.45 }, 0.04)
      .fromTo(q('[data-bar-b]'), { yPercent: 0 }, { yPercent: 100, duration: 0.45 }, 0.04)
      .fromTo(q('[data-poster]'), { filter: 'brightness(0) contrast(1.2)', scale: 1.25, xPercent: 6 },
        { filter: 'brightness(1) contrast(1)', scale: 1, xPercent: 0, duration: 0.6 }, 0.08)
      .to(lines, { y: 0, duration: 0.09, stagger: 0.035, ease: 'power3.out' }, 0.64)
      .fromTo(q('[data-sub]'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.08, ease: 'power2.out' }, 0.76)
      .to(q('[data-copy]'), { yPercent: -30, opacity: 0, duration: 0.09, ease: 'power2.in' }, 0.9)
      .to(q('[data-poster]'), { xPercent: 40, opacity: 0, duration: 0.1, ease: 'power2.in' }, 0.9)
      .to(q('[data-edge]'), { opacity: 1, duration: 0.1 }, 0.9)
      .to({}, { duration: 0 }, 1)
    return () => { progress.current = 0 }
  }, root)

  return (
    <section ref={root} aria-label="Signature reveal" className="relative h-[100svh] w-full overflow-hidden bg-ink">
      {/* Fallback / poster: used when WebGL is unavailable or reduced motion is on */}
      {!gl && (
        <div data-poster className="absolute inset-0">
          <Img photo={IMG.silver} className="h-full w-full" />
        </div>
      )}
      {gl && (
        <>
          {near && (
            <Suspense fallback={null}>
              <CarScene progress={progress} active={active} mobile={mobile} onReady={onReady} />
            </Suspense>
          )}
          <div className={`pointer-events-none absolute inset-0 bg-ink transition-opacity duration-1000 ${ready ? 'opacity-0' : 'opacity-100'}`} />
        </>
      )}

      {/* vignette + cinematic bars */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_65%_at_50%_52%,transparent_40%,rgba(8,9,11,.85))]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
      <div data-bar-t className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[11svh] bg-ink" />
      <div data-bar-b className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[11svh] bg-ink" />
      <div data-edge className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px bg-race opacity-0" />

      {/* phase HUD */}
      <div className="pad-x pointer-events-none absolute inset-x-0 top-24 z-20 flex items-start justify-between md:top-28">
        <div>
          <p className="eyebrow">The Reveal</p>
          <p data-phase className="display mt-3 text-3xl text-bone md:text-4xl" aria-hidden="true">Darkness</p>
        </div>
        <div className="hidden items-stretch gap-4 md:flex" aria-hidden="true">
          <ul className="flex flex-col justify-between py-0.5 text-right text-[0.62rem] uppercase tracking-[0.28em] text-silver/40">
            {PHASES.map((p, i) => <li key={p} data-pn className="transition-colors duration-500">0{i + 1} {p}</li>)}
          </ul>
          <div className="relative w-px bg-white/15"><div data-rail className="absolute inset-0 origin-top scale-y-0 bg-race" /></div>
        </div>
      </div>

      {/* statement */}
      <div data-copy className="pad-x absolute inset-x-0 bottom-[14svh] z-20 md:bottom-[16svh]">
        <h2 data-title className="display h-xl text-bone" style={{ fontSize: 'clamp(3.2rem, 11vw, 12.5rem)' }}>
          <span className="ln"><span>Beyond the</span></span>
          <span className="ln"><span>Ordinary<span className="text-race">.</span></span></span>
        </h2>
        <p data-sub className="lead mt-5 max-w-md opacity-0">Automotive care driven by precision and dedication.</p>
      </div>

      <div data-hint className="pad-x absolute inset-x-0 bottom-[14svh] z-20 flex items-center gap-4 text-[0.68rem] uppercase tracking-[0.3em] text-silver/70">
        <span className="h-px w-10 bg-silver/40" /> Scroll to reveal
      </div>
    </section>
  )
}
