import { useRef, type CSSProperties, type ElementType, type ReactNode } from 'react'
import { gsap, EASE, isCoarse, prefersReduced, useGsap } from '../lib/motion'
import { src, type Photo } from '../lib/images'
import { TLink } from './Transition'

/* ---------- Image ---------- */
export function Img({ photo, className = '', sizes = '100vw', eager = false, style }: {
  photo: Photo; className?: string; sizes?: string; eager?: boolean; style?: CSSProperties
}) {
  return (
    <img
      src={src(photo)}
      srcSet={`${src(photo, true)} 900w, ${src(photo)} 2200w`}
      sizes={sizes}
      alt={photo.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      className={className}
      style={{ objectFit: 'cover', objectPosition: photo.pos, ...style }}
    />
  )
}

/* ---------- Line-masked headline ---------- */
export function Lines({ lines, as: Tag = 'h2', className = '', auto = true, start = 'top 88%', delay = 0 }: {
  lines: ReactNode[]; as?: ElementType; className?: string; auto?: boolean; start?: string; delay?: number
}) {
  const ref = useRef<HTMLElement>(null)
  useGsap(() => {
    if (!auto) return
    const spans = ref.current!.querySelectorAll('.ln > span')
    if (prefersReduced()) { gsap.set(spans, { y: 0 }); return }
    gsap.to(spans, {
      y: 0, duration: 1.3, ease: EASE, stagger: 0.11, delay,
      scrollTrigger: { trigger: ref.current, start, once: true },
    })
  }, ref)
  return (
    <Tag ref={ref} className={`display ${className}`}>
      {lines.map((l, i) => (
        <span className="ln" key={i}><span>{l}</span></span>
      ))}
    </Tag>
  )
}

/* ---------- Small copy reveal (blur-lift, staggered via data-r children) ---------- */
export function Rise({ children, className = '', delay = 0, as: Tag = 'div' }: {
  children: ReactNode; className?: string; delay?: number; as?: ElementType
}) {
  const ref = useRef<HTMLElement>(null)
  useGsap(() => {
    if (prefersReduced()) return
    gsap.from(ref.current, {
      y: 36, opacity: 0, filter: 'blur(8px)', duration: 1.1, ease: 'power3.out', delay,
      scrollTrigger: { trigger: ref.current, start: 'top 90%', once: true },
    })
  }, ref)
  return <Tag ref={ref} className={className}>{children}</Tag>
}

/* ---------- Masked, parallaxed photo ---------- */
export function MaskImage({ photo, dir = 'up', className = '', sizes = '(min-width:1024px) 50vw, 100vw', eager = false, parallax = 9, scale = 1.35 }: {
  photo: Photo; dir?: 'up' | 'down' | 'left' | 'right'; className?: string; sizes?: string; eager?: boolean; parallax?: number; scale?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  useGsap(() => {
    if (prefersReduced()) return
    const from = { up: 'inset(100% 0% 0% 0%)', down: 'inset(0% 0% 100% 0%)', left: 'inset(0% 100% 0% 0%)', right: 'inset(0% 0% 0% 100%)' }[dir]
    const img = ref.current!.querySelector('img')!
    gsap.fromTo(ref.current, { clipPath: from }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut',
      scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
    })
    gsap.fromTo(img, { scale }, {
      scale: 1.08, duration: 2, ease: 'expo.out',
      scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
    })
    gsap.fromTo(img, { yPercent: -parallax }, {
      yPercent: parallax, ease: 'none',
      scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
    })
  }, ref)
  return (
    <div ref={ref} className={`relative overflow-hidden bg-carbon ${className}`}>
      <Img photo={photo} sizes={sizes} eager={eager} className="absolute left-0 top-[-10%] h-[120%] w-full" />
      <div className="pointer-events-none absolute inset-0 bg-ink/20 bg-gradient-to-t from-ink/50 via-transparent to-ink/10" />
    </div>
  )
}

/* ---------- Magnetic wrapper ---------- */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  useGsap(() => {
    if (isCoarse() || prefersReduced()) return
    const el = ref.current!
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' })
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      x((e.clientX - (r.left + r.width / 2)) * strength)
      y((e.clientY - (r.top + r.height / 2)) * strength)
    }
    const leave = () => { x(0); y(0) }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
  }, ref)
  return <span ref={ref} className="inline-block">{children}</span>
}

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
)
export const ArrowIcon = Arrow

/* ---------- Button (internal route or external href) ---------- */
export function Btn({ to, href, children, variant = 'ghost', type, onClick }: {
  to?: string; href?: string; children: ReactNode; variant?: 'ghost' | 'red'; type?: 'submit' | 'button'; onClick?: () => void
}) {
  const cls = `btn ${variant === 'red' ? 'btn-red' : ''}`
  const inner = <>{children}<Arrow /></>
  return (
    <Magnetic>
      {to ? <TLink to={to} className={cls}>{inner}</TLink>
        : href ? <a href={href} className={cls}>{inner}</a>
        : <button type={type ?? 'button'} className={cls} onClick={onClick}>{inner}</button>}
    </Magnetic>
  )
}
