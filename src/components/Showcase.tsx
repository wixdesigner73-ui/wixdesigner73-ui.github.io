import { useRef } from 'react'
import { Img } from './ui'
import { IMG, type Photo } from '../lib/images'
import { gsap, isNarrow, prefersReduced, useGsap } from '../lib/motion'

type Panel = { photo: Photo; label: string; w: number; h: number; y: number; from: string }
const PANELS: Panel[] = [
  { photo: IMG.headlight, label: 'Headlights', w: 30, h: 62, y: -4, from: 'inset(0% 100% 0% 0%)' },
  { photo: IMG.rear, label: 'Metallic bodywork', w: 38, h: 46, y: 10, from: 'inset(100% 0% 0% 0%)' },
  { photo: IMG.ferrari, label: 'Wheels', w: 26, h: 70, y: -2, from: 'circle(0% at 50% 50%)' },
  { photo: IMG.interior, label: 'Interiors', w: 36, h: 54, y: -10, from: 'inset(0% 0% 0% 100%)' },
  { photo: IMG.engine2, label: 'Engine detail', w: 28, h: 64, y: 8, from: 'inset(50% 50% 50% 50%)' },
  { photo: IMG.night, label: 'After dark', w: 42, h: 58, y: 0, from: 'inset(0% 0% 100% 0%)' },
]

const WORDS = [
  { t: 'Precision.', after: 0, solid: true, speed: 0.18 },
  { t: 'Performance.', after: 2, solid: false, speed: -0.12 },
  { t: 'Confidence.', after: 4, solid: true, speed: 0.2 },
]

export default function Showcase() {
  const root = useRef<HTMLElement>(null)
  const narrow = typeof window !== 'undefined' && isNarrow()
  const k = narrow ? 2.15 : 1

  useGsap(() => {
    const el = root.current!
    const track = el.querySelector<HTMLElement>('[data-track]')!
    const bar = el.querySelector('[data-bar]')
    if (prefersReduced()) { gsap.set(el.querySelectorAll('[data-word] > span'), { yPercent: 0 }); return }

    const dist = () => track.scrollWidth - window.innerWidth
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: el, pin: true, scrub: 0.7, start: 'top top', end: () => '+=' + dist() * (narrow ? 0.9 : 1.1),
        invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (s) => { gsap.set(bar, { scaleX: s.progress }) },
      },
    })

    el.querySelectorAll<HTMLElement>('[data-panel]').forEach((p, i) => {
      const img = p.querySelector('img')!
      const frame = p.querySelector<HTMLElement>('[data-frame]')!
      gsap.fromTo(frame, { clipPath: PANELS[i].from }, {
        clipPath: PANELS[i].from.startsWith('circle') ? 'circle(75% at 50% 50%)' : 'inset(0% 0% 0% 0%)', ease: 'power2.out',
        scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 92%', end: 'left 42%', scrub: true },
      })
      gsap.fromTo(img, { xPercent: -14, scale: 1.3 }, {
        xPercent: 14, scale: 1.1, ease: 'none',
        scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
      })
      gsap.fromTo(p.querySelector('[data-cap]'), { yPercent: 120 }, {
        yPercent: 0, ease: 'power3.out',
        scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 70%', end: 'left 45%', scrub: true },
      })
    })

    el.querySelectorAll<HTMLElement>('[data-word]').forEach((w, i) => {
      gsap.fromTo(w.firstElementChild, { yPercent: 105 }, {
        yPercent: 0, ease: 'power3.out',
        scrollTrigger: { trigger: w, containerAnimation: tween, start: 'left 96%', end: 'left 55%', scrub: true },
      })
      gsap.fromTo(w, { x: -WORDS[i].speed * 600 }, {
        x: WORDS[i].speed * 600, ease: 'none',
        scrollTrigger: { trigger: w, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
      })
    })
  }, root)

  const items: React.ReactNode[] = []
  PANELS.forEach((p, i) => {
    items.push(
      <figure key={'p' + i} data-panel className="relative shrink-0"
        style={{ width: `${Math.min(p.w * k, 82)}vw`, height: `${Math.min(p.h * (narrow ? 1.0 : 1), 80)}svh`, marginTop: `${p.y}svh`, marginRight: narrow ? '8vw' : '5vw' }}>
        <div data-frame className="absolute inset-0 overflow-hidden bg-carbon">
          <Img photo={p.photo} sizes="45vw" className="absolute left-[-15%] top-0 h-full w-[130%] max-w-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/20" />
        </div>
        <figcaption className="absolute -bottom-9 left-0 flex items-center gap-3 overflow-hidden text-[0.68rem] uppercase tracking-[0.28em] text-silver">
          <span data-cap className="flex items-center gap-3"><span className="text-race">0{i + 1}</span>{p.label}</span>
        </figcaption>
      </figure>,
    )
    WORDS.forEach((w, wi) => {
      if (w.after === i) {
        items.push(
          <div key={'w' + wi} data-word className="shrink-0 overflow-hidden px-[1vw]">
            <span className={`display block ${w.solid ? 'text-bone' : 'outline-text'}`}
              style={{ fontSize: narrow ? '30vw' : '16vw', lineHeight: 0.9, paddingBottom: '0.05em' }}>
              {w.t}
            </span>
          </div>,
        )
      }
    })
  })

  return (
    <section ref={root} aria-label="Automotive photography showcase" className="relative h-[100svh] overflow-hidden bg-ink">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_30%_50%,rgba(32,35,41,.55),transparent)]" />
      <div className="pad-x absolute inset-x-0 top-24 z-10 flex items-center justify-between md:top-28">
        <p className="eyebrow">The Showcase</p>
        <p className="hidden text-[0.68rem] uppercase tracking-[0.3em] text-silver/60 sm:block">Scroll to travel →</p>
      </div>
      <div data-track className="flex h-full items-center pl-[6vw] will-change-transform" style={{ width: 'max-content' }}>
        <div className="shrink-0 pr-[6vw]" style={{ width: narrow ? '70vw' : '30vw' }}>
          <p className="lead max-w-xs">Detail, light and metal. The things we obsess over, in motion.</p>
        </div>
        {items}
        <div className="shrink-0 pl-[6vw] pr-[10vw]" />
      </div>
      <div className="pad-x absolute inset-x-0 bottom-8 z-10">
        <div className="h-px w-full bg-white/15"><div data-bar className="h-full origin-left scale-x-0 bg-race" /></div>
      </div>
    </section>
  )
}
