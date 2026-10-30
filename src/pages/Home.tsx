import { useRef } from 'react'
import Hero from '../components/Hero'
import CarReveal from '../components/CarReveal'
import ClothReveal from '../components/ClothReveal'
import ServicesList from '../components/ServicesList'
import Showcase from '../components/Showcase'
import CtaBand from '../components/CtaBand'
import { Btn, Lines, MaskImage, Rise } from '../components/ui'
import { IMG } from '../lib/images'
import { SITE } from '../lib/site'
import { gsap, prefersReduced, useGsap, useSeo } from '../lib/motion'

function AboutPreview() {
  const ref = useRef<HTMLElement>(null)
  useGsap(() => {
    if (prefersReduced()) return
    const el = ref.current!
    gsap.fromTo(el.querySelector('[data-ghost]'), { xPercent: 8 }, {
      xPercent: -30, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    })
    gsap.fromTo(el.querySelector('[data-inset]'), { yPercent: 18 }, {
      yPercent: -22, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    })
  }, ref)
  return (
    <section ref={ref} className="relative overflow-hidden bg-ink py-24 md:py-0">
      <div data-ghost aria-hidden="true" className="display outline-text pointer-events-none absolute left-0 top-[8%] select-none whitespace-nowrap opacity-30" style={{ fontSize: '30vw' }}>
        Neil&apos;s Express
      </div>
      <div className="relative grid items-center gap-14 md:min-h-[110svh] md:grid-cols-2 md:gap-0">
        <div className="relative pr-0 md:pr-[3vw]">
          <MaskImage photo={IMG.amg2} dir="right" parallax={10} className="h-[70svh] w-full md:h-[88svh]" sizes="(min-width:768px) 50vw, 100vw" />
          <div data-inset className="absolute -bottom-12 right-4 z-10 hidden w-[34%] md:block">
            <MaskImage photo={IMG.headlight2} dir="up" parallax={6} className="aspect-[4/5] w-full border-4 border-ink shadow-2xl" sizes="20vw" />
          </div>
        </div>
        <div className="pad-x md:pl-[6vw] md:pr-[5vw]">
          <p className="eyebrow mb-8">About</p>
          <Lines lines={['Automotive care.', 'Redefined.']} className="h-xl" />
          <Rise delay={0.1} className="lead mt-10 max-w-lg">
            At Neil&apos;s Express Automotive, we believe every vehicle deserves careful attention and dependable service.
            Our approach focuses on quality, precision, and customer confidence.
          </Rise>
          <div className="mt-10"><Btn to="/about">Discover Our Story</Btn></div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  useSeo("Neil's Express Automotive | Precision in Every Detail",
    'Professional automotive care with attention to performance, reliability, and every detail. Diagnostics, maintenance, brakes, engine, suspension and general repair. Call (626) 284-3214.')
  return (
    <>
      <Hero />
      <CarReveal />
      <ClothReveal />
      <AboutPreview />
      <ServicesList />
      <Showcase />
      <CtaBand
        photo={IMG.silver}
        eyebrow="Contact"
        lines={['Your vehicle', 'deserves better.']}
        text="Connect with Neil's Express Automotive for professional automotive care."
        buttons={[{ label: 'Get in touch', to: '/contact' }, { label: `Call ${SITE.phone}`, href: SITE.tel, variant: 'ghost' }]}
      />
    </>
  )
}
