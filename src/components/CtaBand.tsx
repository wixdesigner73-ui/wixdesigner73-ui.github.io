import { useRef, type ReactNode } from 'react'
import { Btn, Img, Lines } from './ui'
import type { Photo } from '../lib/images'
import { gsap, prefersReduced, useGsap } from '../lib/motion'

type B = { label: string; to?: string; href?: string; variant?: 'ghost' | 'red' }

export default function CtaBand({ photo, lines, text, buttons, eyebrow, tall = true }: {
  photo: Photo; lines: ReactNode[]; text?: string; buttons: B[]; eyebrow?: string; tall?: boolean
}) {
  const ref = useRef<HTMLElement>(null)

  useGsap(() => {
    if (prefersReduced()) return
    const img = ref.current!.querySelector('[data-bg]')
    const beam = ref.current!.querySelector('.beam')
    gsap.fromTo(img, { yPercent: -8, scale: 1.18 }, {
      yPercent: 8, scale: 1.04, ease: 'none',
      scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
    })
    gsap.fromTo(beam, { left: '-50%' }, {
      left: '130%', duration: 3.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.5,
      scrollTrigger: { trigger: ref.current, start: 'top 70%', toggleActions: 'play pause resume pause' },
    })
  }, ref)

  return (
    <section ref={ref} className={`grain relative isolate flex items-center overflow-hidden bg-ink ${tall ? 'min-h-[100svh]' : 'min-h-[80svh]'}`}>
      <div data-bg className="absolute inset-0 -z-10">
        <Img photo={photo} className="h-full w-full" />
      </div>
      <div className="absolute inset-0 -z-10 bg-ink/45" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_70%_at_50%_55%,transparent,rgba(8,9,11,.85))]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-1/3 bg-gradient-to-b from-ink to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-ink to-transparent" />
      <div className="beam -z-10" />

      <div className="pad-x relative w-full py-28">
        {eyebrow && <p className="eyebrow mb-8">{eyebrow}</p>}
        <Lines lines={lines} as="h2" className="h-xl max-w-[16ch] text-bone" />
        {text && <p className="lead mt-8 max-w-xl">{text}</p>}
        <div className="mt-10 flex flex-wrap gap-4">
          {buttons.map((b, i) => <Btn key={i} to={b.to} href={b.href} variant={b.variant ?? (i === 0 ? 'red' : 'ghost')}>{b.label}</Btn>)}
        </div>
      </div>
    </section>
  )
}
