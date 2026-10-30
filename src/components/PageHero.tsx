import { useRef, type ReactNode } from 'react'
import { Img, Lines } from './ui'
import type { Photo } from '../lib/images'
import { gsap, prefersReduced, useGsap } from '../lib/motion'

export default function PageHero({ photo, lines, eyebrow, text, short = false }: {
  photo: Photo; lines: ReactNode[]; eyebrow: string; text?: string; short?: boolean
}) {
  const root = useRef<HTMLElement>(null)

  useGsap(() => {
    const el = root.current!
    const q = (s: string) => el.querySelector(s)
    const spans = el.querySelectorAll('h1 .ln > span')
    const fades = el.querySelectorAll('[data-in]')
    if (prefersReduced()) { gsap.set(spans, { y: 0 }); return }
    const tl = gsap.timeline({ delay: 0.9 })
    tl.set(fades, { opacity: 0, y: 20 })
      .fromTo(q('[data-bg]'), { scale: 1.3, filter: 'brightness(0)' }, { scale: 1.06, filter: 'brightness(1)', duration: 3.2, ease: 'power3.out' }, 0)
      .fromTo(q('.beam'), { left: '-50%' }, { left: '135%', duration: 2.2, ease: 'power2.inOut' }, 0.1)
      .to(spans, { y: 0, duration: 1.4, stagger: 0.13, ease: 'expo.out' }, 0.5)
      .to(fades, { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power3.out' }, 1.2)
    gsap.to(q('[data-bg]'), { yPercent: 12, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
    gsap.to(q('[data-content]'), { yPercent: -15, opacity: 0, ease: 'none', scrollTrigger: { trigger: el, start: '20% top', end: 'bottom 30%', scrub: true } })
  }, root)

  return (
    <section ref={root} className={`grain relative isolate flex items-end overflow-hidden bg-ink ${short ? 'min-h-[78svh]' : 'min-h-[100svh]'}`}>
      <div className="absolute inset-0 -z-10">
        <div data-bg className="h-full w-full will-change-transform"><Img photo={photo} eager className="h-full w-full" /></div>
      </div>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(90%_80%_at_60%_50%,transparent_30%,rgba(8,9,11,.8))]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-1/3 bg-gradient-to-b from-ink/85 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-3/5 bg-gradient-to-t from-ink via-ink/70 to-transparent" />
      <div className="beam -z-10" />
      <div data-content className="pad-x relative w-full pb-14 pt-40 md:pb-20">
        <p data-in className="eyebrow mb-6">{eyebrow}</p>
        <Lines as="h1" auto={false} lines={lines} className="h-mega text-bone" />
        {text && <p data-in className="lead mt-8 max-w-lg text-bone/75">{text}</p>}
      </div>
    </section>
  )
}
