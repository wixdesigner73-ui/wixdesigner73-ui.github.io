import { useRef } from 'react'
import PageHero from '../components/PageHero'
import CtaBand from '../components/CtaBand'
import { Btn, Img, Lines, MaskImage, Rise } from '../components/ui'
import { IMG } from '../lib/images'
import { SERVICES, type Service } from '../lib/site'
import { gsap, isCoarse, prefersReduced, useGsap, useSeo } from '../lib/motion'

function Tilt({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useGsap(() => {
    if (isCoarse() || prefersReduced()) return
    const el = ref.current!
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.9, ease: 'power3.out' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.9, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      ry(((e.clientX - r.left) / r.width - 0.5) * 9)
      rx(-((e.clientY - r.top) / r.height - 0.5) * 7)
    }
    const leave = () => { rx(0); ry(0) }
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
  }, ref)
  return <div style={{ perspective: 1200 }} className={className}><div ref={ref} style={{ transformStyle: 'preserve-3d' }}>{children}</div></div>
}

function Num({ n, className = '' }: { n: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useGsap(() => {
    if (prefersReduced()) return
    gsap.fromTo(ref.current, { yPercent: 16 }, {
      yPercent: -16, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
    })
  }, ref)
  return <span ref={ref} aria-hidden="true" className={`display pointer-events-none block select-none ${className}`} style={{ fontSize: 'clamp(7rem,20vw,22rem)' }}>{n}</span>
}

function Copy({ s }: { s: Service }) {
  return (
    <>
      <p className="eyebrow mb-6">{s.tag}</p>
      <Lines lines={s.title.split(' & ').length > 1 ? [s.title.split(' & ')[0] + ' &', s.title.split(' & ')[1]] : s.title.split(' ').length > 2 ? [s.title.split(' ').slice(0, -1).join(' '), s.title.split(' ').slice(-1)[0]] : s.title.split(' ')}
        className="h-lg" />
      <Rise delay={0.1} className="lead mt-8 max-w-md">{s.blurb}</Rise>
      <div className="mt-9"><Btn to={`/contact?service=${s.id}`}>Enquire now</Btn></div>
    </>
  )
}

function Section({ s, i }: { s: Service; i: number }) {
  const layout = i % 3
  if (layout === 2) {
    return (
      <section id={s.id} className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
        <div className="absolute inset-0 -z-10"><MaskImage photo={s.photo} dir="up" parallax={10} className="h-full w-full" sizes="100vw" /></div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/75 to-ink/20" />
        <div className="absolute inset-x-0 top-0 -z-10 h-1/4 bg-gradient-to-b from-ink to-transparent" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/4 bg-gradient-to-t from-ink to-transparent" />
        <div className="pad-x relative w-full py-24">
          <Num n={s.n} className="outline-text absolute -top-4 right-4 opacity-60 md:right-12" />
          <div className="relative max-w-xl"><Copy s={s} /></div>
        </div>
      </section>
    )
  }
  const flip = layout === 1
  return (
    <section id={s.id} className="relative overflow-hidden bg-ink py-24 md:py-36">
      <div className="pad-x relative grid items-center gap-12 md:grid-cols-12">
        <Num n={s.n} className={`outline-text absolute -top-10 md:-top-24 ${flip ? 'left-4 md:left-12' : 'right-4 md:right-12'} opacity-50`} />
        <div className={`relative md:col-span-7 ${flip ? 'md:order-2' : ''}`}>
          <Tilt>
            <MaskImage photo={s.photo} dir={flip ? 'left' : 'right'} className="aspect-[4/3] w-full shadow-[0_50px_100px_-40px_rgba(0,0,0,.9)] md:aspect-[5/4]" sizes="(min-width:768px) 58vw, 100vw" />
          </Tilt>
        </div>
        <div className={`relative md:col-span-5 ${flip ? 'md:order-1 md:pr-8' : 'md:pl-8'}`}><Copy s={s} /></div>
      </div>
    </section>
  )
}

export default function Services() {
  useSeo("Services | Neil's Express Automotive",
    "Vehicle diagnostics, routine maintenance, brake service, engine repair, suspension & steering and general automotive repair from Neil's Express Automotive.")
  return (
    <>
      <PageHero photo={IMG.showroom} eyebrow="Services" lines={['Expertise', <>in motion<span key="d" className="text-race">.</span></>]}
        text="Careful, precise work across the systems that keep your vehicle safe, dependable and performing." />
      {SERVICES.map((s, i) => <Section key={s.id} s={s} i={i} />)}
      <CtaBand photo={IMG.matte} lines={["Let's get your vehicle", 'back on track.']} buttons={[{ label: 'Contact us', to: '/contact' }]} />
    </>
  )
}

// keep Img import referenced for tree-shaking-safe future use
void Img
