import { useRef } from 'react'
import { Btn, Img, Lines } from './ui'
import { IMG } from '../lib/images'
import { gsap, isCoarse, prefersReduced, useGsap } from '../lib/motion'

export default function Hero() {
  const root = useRef<HTMLElement>(null)

  useGsap(() => {
    const el = root.current!
    const q = (s: string) => el.querySelector(s)
    const lines = el.querySelectorAll('h1 .ln > span')
    const bg = q('[data-bg]')
    const black = q('[data-black]')
    const beam = q('.beam')
    const nav = document.querySelector('[data-nav]')
    const fades = el.querySelectorAll('[data-in]')

    if (prefersReduced()) { gsap.set(lines, { y: 0 }); gsap.set(black, { opacity: 0 }); return }

    // Cinematic opening: black -> light beam -> car emerges -> push-in -> headline mask -> UI
    const tl = gsap.timeline({ delay: 0.15 })
    tl.set(bg, { scale: 1.24, filter: 'brightness(0) saturate(.6)' })
      .set(fades, { opacity: 0, y: 24 })
      .fromTo(beam, { left: '-50%', opacity: 1 }, { left: '135%', duration: 2.6, ease: 'power2.inOut' }, 0.3)
      .to(bg, { filter: 'brightness(1) saturate(1)', duration: 3.2, ease: 'power2.out' }, 0.7)
      .to(black, { opacity: 0, duration: 1.6, ease: 'power1.inOut' }, 0.4)
      .to(bg, { scale: 1.06, duration: 6, ease: 'power3.out' }, 0.3)
      .to(lines, { y: 0, duration: 1.5, stagger: 0.14, ease: 'expo.out' }, 1.8)
      .to(fades, { opacity: 1, y: 0, duration: 1.2, stagger: 0.12, ease: 'power3.out' }, 2.5)
    if (nav) tl.fromTo(nav, { opacity: 0, yPercent: -40 }, { opacity: 1, yPercent: 0, duration: 1.2, ease: 'power3.out' }, 2.3)

    // scroll: push the car away, content drifts up
    gsap.to(bg, { yPercent: 14, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
    gsap.to(q('[data-content]'), { yPercent: -18, opacity: 0, ease: 'none', scrollTrigger: { trigger: el, start: '15% top', end: 'bottom 20%', scrub: true } })

    // pointer-driven depth
    if (isCoarse()) return
    const rx = gsap.quickTo(q('[data-scene]'), 'rotationX', { duration: 1.2, ease: 'power3.out' })
    const ry = gsap.quickTo(q('[data-scene]'), 'rotationY', { duration: 1.2, ease: 'power3.out' })
    const bx = gsap.quickTo(q('[data-depth]'), 'x', { duration: 1.4, ease: 'power3.out' })
    const by = gsap.quickTo(q('[data-depth]'), 'y', { duration: 1.4, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5
      ry(nx * 3); rx(-ny * 2); bx(nx * -22); by(ny * -14)
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, root)

  return (
    <section ref={root} className="grain relative isolate h-[100svh] min-h-[620px] overflow-hidden bg-ink">
      <div data-scene className="absolute inset-0" style={{ perspective: 1400, transformStyle: 'preserve-3d' }}>
        <div data-depth className="absolute -inset-[5%]">
          <div data-bg className="h-full w-full will-change-transform">
            <Img photo={IMG.hero} eager className="h-full w-full" />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(90%_75%_at_55%_62%,transparent_35%,rgba(8,9,11,.82))]" />
      <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-ink/85 via-ink/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-ink via-ink/70 to-transparent" />
      <div className="beam" />
      <div data-black className="pointer-events-none absolute inset-0 z-20 bg-black" />

      <div data-content className="pad-x relative z-10 flex h-full flex-col justify-between pb-10 pt-[calc(4.5rem+5svh)] md:pb-12 md:pt-[calc(5rem+6svh)]">
        <div>
          <p data-in className="eyebrow mb-5 md:mb-7">Neil&apos;s Express Automotive</p>
          <Lines as="h1" auto={false} lines={['Precision in', <>Every detail<span className="text-race">.</span></>]} className="h-mega text-bone" />
        </div>

        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p data-in className="lead max-w-md text-bone/80">
              Professional automotive care with attention to performance, reliability, and every detail.
            </p>
            <div data-in className="mt-7 flex flex-wrap gap-3 md:gap-4">
              <Btn to="/services" variant="red">Explore Services</Btn>
              <Btn to="/contact">Contact Us</Btn>
            </div>
          </div>
          <div data-in className="hidden items-center gap-4 text-[0.68rem] uppercase tracking-[0.3em] text-silver md:flex" aria-hidden="true">
            Scroll
            <span className="relative block h-16 w-px overflow-hidden bg-white/20">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[drip_2.2s_cubic-bezier(.7,0,.3,1)_infinite] bg-race" />
            </span>
          </div>
        </div>
      </div>
      <style>{`@keyframes drip{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
    </section>
  )
}
