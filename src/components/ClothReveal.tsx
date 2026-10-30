import { lazy, Suspense, useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { IMG } from '../lib/images'
import { Img } from './ui'
import { isNarrow, prefersReduced } from '../lib/motion'

const ClothScene = lazy(() => import('./ClothScene'))

const hasWebGL = () => {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false }
}
const ss = (x: number, a: number, b: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

/**
 * "Drag to reveal": a car under a cloth cover in a concrete garage.
 * Drag the handle around the ring (or use the arrow keys) and the cloth is pulled away,
 * the camera drops in low, the headlights ignite.
 */
export default function ClothReveal() {
  const root = useRef<HTMLElement>(null)
  const target = useRef(0)
  const shown = useRef(0)
  const [near, setNear] = useState(false)
  const [active, setActive] = useState(false)
  const [ready, setReady] = useState(false)
  const [gl] = useState(() => hasWebGL())
  const [box, setBox] = useState({ w: 1200, h: 800 })
  const [value, setValue] = useState(0)
  const dragging = useRef(false)
  const mobile = typeof window !== 'undefined' && isNarrow()
  const onReady = useCallback(() => setReady(true), [])

  const handle = useRef<HTMLDivElement>(null)
  const lit = useRef<SVGPathElement>(null)
  const ui = useRef<HTMLDivElement>(null)
  const hint = useRef<HTMLDivElement>(null)
  const veil = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current!
    const a = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '150% 0px' })
    const b = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: '5% 0px' })
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }))
    a.observe(el); b.observe(el); ro.observe(el)
    return () => { a.disconnect(); b.disconnect(); ro.disconnect() }
  }, [])

  const narrow = box.w < 820
  const cx = box.w * (narrow ? 0.5 : 0.44)
  const cy = box.h * (narrow ? 0.62 : 0.6)
  const R = narrow ? Math.min(box.w * 0.4, box.h * 0.26) : Math.min(box.h * 0.34, box.w * 0.27)
  const pt = (p: number) => ({ x: cx + R * Math.cos(-p * Math.PI), y: cy + R * Math.sin(-p * Math.PI) })

  // drive the DOM (handle, lit arc, copy fade) from the damped value
  useEffect(() => {
    if (!active) return
    let raf = 0
    const tick = () => {
      const reduce = prefersReduced()
      shown.current += (target.current - shown.current) * (reduce ? 1 : 0.14)
      if (Math.abs(target.current - shown.current) < 0.0005) shown.current = target.current
      const p = shown.current
      const { x, y } = pt(p)
      handle.current?.style.setProperty('transform', `translate(${x}px, ${y}px)`)
      const s = pt(0)
      lit.current?.setAttribute('d', p < 0.002 ? '' : `M ${s.x} ${s.y} A ${R} ${R} 0 ${p > 1 ? 1 : 0} 0 ${x} ${y}`)
      if (ui.current) { const o = 1 - ss(p, 0.12, 0.5); ui.current.style.opacity = String(o); ui.current.style.filter = `blur(${(1 - o) * 10}px)` }
      if (hint.current) hint.current.style.opacity = String(1 - ss(p, 0, 0.06))
      if (veil.current) veil.current.style.opacity = String(1 - ss(p, 0, 0.7))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, cx, cy, R])

  const set = (p: number) => { target.current = Math.min(1, Math.max(0, p)); setValue(Math.round(target.current * 100)) }

  const move = (e: PointerEvent) => {
    if (!dragging.current) return
    const r = root.current!.getBoundingClientRect()
    const ang = Math.atan2(e.clientY - r.top - cy, e.clientX - r.left - cx) // -PI..PI, upper half negative
    if (ang <= 0) set(-ang / Math.PI)
    else set(ang < Math.PI / 2 ? 0 : 1)
  }
  const key = (e: KeyboardEvent) => {
    const k = e.key
    if (k === 'ArrowRight' || k === 'ArrowUp') { e.preventDefault(); set(target.current + 0.06) }
    else if (k === 'ArrowLeft' || k === 'ArrowDown') { e.preventDefault(); set(target.current - 0.06) }
    else if (k === 'Home') set(0)
    else if (k === 'End') set(1)
  }

  const start = pt(0)
  return (
    <section ref={root} aria-label="Drag to reveal" className="relative isolate h-[100svh] min-h-[620px] overflow-hidden bg-[#0b0b0c] select-none">
      {gl ? (
        <>
          <div className="absolute inset-0" style={{ filter: 'grayscale(.4) contrast(1.06) brightness(1.03)' }}>
            {near && (
              <Suspense fallback={null}>
                <ClothScene progress={target} active={active} mobile={mobile} onReady={onReady} />
              </Suspense>
            )}
          </div>
          <div className={`pointer-events-none absolute inset-0 bg-[#0b0b0c] transition-opacity duration-1000 ${ready ? 'opacity-0' : 'opacity-100'}`} />
        </>
      ) : (
        <>
          <Img photo={IMG.silver} className="absolute inset-0 h-full w-full" />
          <div ref={veil} className="absolute inset-0 bg-bone/80 mix-blend-soft-light" />
        </>
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_80%_at_50%_55%,transparent_45%,rgba(8,9,11,.7))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

      {/* copy: fades away as the cloth leaves */}
      <div ref={ui} className="pointer-events-none absolute inset-0 will-change-[opacity,filter]">
        <div className="absolute text-right text-bone"
          style={{ right: narrow ? 'auto' : `${100 - 40}%`, left: narrow ? '1.4rem' : 'auto', top: narrow ? '15%' : '23%', textAlign: narrow ? 'left' : 'right', fontFamily: '"Hanken Grotesk", var(--font-sans)' }}>
          <span className="block font-extralight uppercase tracking-[-0.02em]" style={{ fontSize: 'clamp(1.9rem,3.3vw,3.6rem)', lineHeight: 1 }}>Uncover</span>
          <span className="block font-extralight tracking-[-0.02em]" style={{ fontSize: 'clamp(1.9rem,3.3vw,3.6rem)', lineHeight: 1 }}>
            the <em className="font-light uppercase">Detail</em>
          </span>
        </div>
        <p className="absolute max-w-[17rem] text-[0.78rem] leading-relaxed text-bone/70"
          style={{ right: narrow ? '1.4rem' : '12%', bottom: narrow ? '9%' : '17%', left: narrow ? '1.4rem' : 'auto', maxWidth: narrow ? 'none' : '17rem' }}>
          Every vehicle holds something worth uncovering. We bring precision, care and attention to every detail.
        </p>
        <p className="absolute bottom-[3.5%] left-[1.4rem] text-[0.62rem] uppercase tracking-[0.3em] text-bone/50 md:left-[4vw]">02 / Reveal</p>
      </div>

      {/* ring + handle */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden="true">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(245,245,243,.22)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={R + 14} fill="none" stroke="rgba(245,245,243,.07)" strokeWidth="1" />
        <path ref={lit} fill="none" stroke="rgba(245,245,243,.9)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      <div ref={hint} className="pointer-events-none absolute text-[0.62rem] uppercase tracking-[0.3em] text-bone"
        style={{ left: narrow ? Math.min(box.w - 130, Math.max(12, start.x - 44)) : start.x + 30, top: narrow ? start.y + 34 : start.y - 6, whiteSpace: "nowrap" }}>Drag to reveal</div>

      <div
        ref={handle}
        role="slider" tabIndex={0} aria-label="Drag to reveal the car" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-orientation="horizontal"
        onKeyDown={key}
        onPointerDown={(e) => { dragging.current = true; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) }}
        onPointerMove={move}
        onPointerUp={() => { dragging.current = false }}
        onPointerCancel={() => { dragging.current = false }}
        className="absolute left-0 top-0 z-10 -ml-7 -mt-7 grid h-14 w-14 cursor-grab place-items-center rounded-full outline-offset-2 active:cursor-grabbing"
        style={{ touchAction: 'none', transform: `translate(${start.x}px, ${start.y}px)` }}
      >
        <span className="absolute h-10 w-10 animate-ping rounded-full bg-bone/20 [animation-duration:2.4s]" />
        <span className="relative h-3.5 w-3.5 rounded-full bg-bone shadow-[0_0_22px_6px_rgba(245,245,243,.55)]" />
        <span className="absolute -left-2 h-2 w-2 rounded-full bg-bone/50" />
      </div>
    </section>
  )
}
