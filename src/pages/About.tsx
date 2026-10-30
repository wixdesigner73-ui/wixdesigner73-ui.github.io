import { useRef } from 'react'
import PageHero from '../components/PageHero'
import CtaBand from '../components/CtaBand'
import { Img, Lines, MaskImage, Rise } from '../components/ui'
import { IMG } from '../lib/images'
import { gsap, prefersReduced, useGsap, useSeo } from '../lib/motion'

const STEPS = [
  { n: '01', t: 'Understand', d: 'We listen first. Your concerns, your driving, and your expectations shape how we look at your vehicle.', img: IMG.mech },
  { n: '02', t: 'Recommend', d: 'Clear, honest recommendations, explained plainly, so you can make confident decisions about your vehicle.', img: IMG.cockpit },
  { n: '03', t: 'Care', d: 'Careful, precise work carried out with attention to every detail, from the first check to the final one.', img: IMG.wheel },
]

function Philosophy() {
  const ref = useRef<HTMLElement>(null)
  useGsap(() => {
    if (prefersReduced()) return
    const el = ref.current!
    gsap.fromTo(el.querySelector('[data-bg]'), { yPercent: -12, scale: 1.2 }, {
      yPercent: 12, scale: 1.05, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    })
  }, ref)
  return (
    <section ref={ref} className="relative isolate flex min-h-[110svh] items-center overflow-hidden bg-ink">
      <div data-bg className="absolute inset-0 -z-10"><Img photo={IMG.bmwFront} className="h-full w-full" /></div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
      <div className="absolute inset-x-0 top-0 -z-10 h-1/4 bg-gradient-to-b from-ink to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/4 bg-gradient-to-t from-ink to-transparent" />
      <div className="pad-x w-full py-28">
        <p className="eyebrow mb-8">Our Philosophy</p>
        <Lines lines={['Precision', 'is our', 'standard.']} className="h-xl" />
        <div className="mt-12 grid max-w-3xl gap-6 md:grid-cols-2 md:gap-10">
          <Rise className="lead">Quality is not a finishing touch. It is how we begin, from the first inspection to the final check.</Rise>
          <Rise delay={0.1} className="lead">Attention to detail and responsible, honest service are what we offer every vehicle that comes through our doors.</Rise>
        </div>
      </div>
    </section>
  )
}

function Approach() {
  const ref = useRef<HTMLElement>(null)
  useGsap(() => {
    if (prefersReduced()) return
    const el = ref.current!
    el.querySelectorAll<HTMLElement>('[data-step]').forEach((s, i) => {
      gsap.from(s.querySelector('[data-num]'), {
        yPercent: 60, opacity: 0, duration: 1.4, ease: 'expo.out',
        scrollTrigger: { trigger: s, start: 'top 80%', once: true },
      })
      gsap.fromTo(s.querySelector('[data-num]'), { xPercent: i % 2 ? 6 : -6 }, {
        xPercent: i % 2 ? -6 : 6, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'bottom top', scrub: true },
      })
      gsap.from(s.querySelector('[data-line]'), {
        scaleX: 0, transformOrigin: 'left', duration: 1.6, ease: 'expo.inOut',
        scrollTrigger: { trigger: s, start: 'top 80%', once: true },
      })
    })
  }, ref)
  return (
    <section ref={ref} className="bg-ink py-24 md:py-40">
      <div className="pad-x">
        <p className="eyebrow mb-8">Our Approach</p>
        <Lines lines={['Three steps.', 'One standard.']} className="h-lg mb-16 md:mb-28" />
      </div>
      {STEPS.map((s, i) => (
        <div key={s.n} data-step className="pad-x relative mb-20 last:mb-0 md:mb-32">
          <div data-line className="mb-10 h-px w-full bg-white/15" />
          <div className={`grid items-center gap-10 md:grid-cols-12 ${i % 2 ? 'md:[&>*:first-child]:order-2' : ''}`}>
            <div className="relative md:col-span-6">
              <span data-num className="display pointer-events-none absolute -top-10 z-10 select-none text-race mix-blend-normal md:-top-20"
                style={{ fontSize: 'clamp(7rem,18vw,18rem)', [i % 2 ? 'right' : 'left']: '-0.04em' } as React.CSSProperties}>{s.n}</span>
              <MaskImage photo={s.img} dir={i % 2 ? 'left' : 'right'} className="aspect-[4/3] w-full" sizes="(min-width:768px) 50vw, 100vw" />
            </div>
            <div className="md:col-span-5 md:col-start-8">
              <Lines lines={[s.t]} className="h-lg" />
              <Rise delay={0.1} className="lead mt-8 max-w-md">{s.d}</Rise>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}

export default function About() {
  useSeo("About | Neil's Express Automotive",
    "Neil's Express Automotive is an automotive service business committed to careful, dependable vehicle care. Learn about our approach.")
  return (
    <>
      <PageHero photo={IMG.amg} eyebrow="About us" lines={['Driven by', <>Dedication<span key="d" className="text-race">.</span></>]} />
      <section className="bg-ink py-24 md:py-40">
        <div className="pad-x grid items-center gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="eyebrow mb-8">Who we are</p>
            <Lines lines={['Careful care.', 'Dependable', 'service.']} className="h-lg" />
            <Rise delay={0.1} className="lead mt-10 max-w-md">
              Neil&apos;s Express Automotive is an automotive service business committed to careful, dependable vehicle care.
              We treat every vehicle with the attention it deserves, and every customer with respect for their time and trust.
            </Rise>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <MaskImage photo={IMG.hero2} dir="up" className="aspect-[4/3] w-full" sizes="(min-width:768px) 50vw, 100vw" />
          </div>
        </div>
      </section>
      <Philosophy />
      <Approach />
      <CtaBand photo={IMG.night} lines={['Built on trust.', 'Driven by care.']} buttons={[{ label: 'Contact us', to: '/contact' }]} />
    </>
  )
}
