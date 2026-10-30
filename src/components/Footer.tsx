import { useRef } from 'react'
import { TLink } from './Transition'
import { LINKS } from './Nav'
import { SITE } from '../lib/site'
import { gsap, prefersReduced, useGsap } from '../lib/motion'

export default function Footer() {
  const ref = useRef<HTMLElement>(null)

  useGsap(() => {
    const wm = ref.current!.querySelector('[data-wordmark]')!
    const chars = wm.querySelectorAll('[data-c]')
    if (prefersReduced()) { gsap.set(chars, { yPercent: 0 }); return }
    gsap.fromTo(chars, { yPercent: 105 }, {
      yPercent: 0, ease: 'none', stagger: 0.04,
      scrollTrigger: { trigger: wm, start: 'top 105%', end: 'bottom 80%', scrub: 0.6 },
    })
    gsap.fromTo(wm, { xPercent: -4 }, {
      xPercent: 0, ease: 'none',
      scrollTrigger: { trigger: wm, start: 'top bottom', end: 'bottom bottom', scrub: true },
    })
  }, ref)

  const word = "NEIL'S EXPRESS"
  return (
    <footer ref={ref} className="relative overflow-hidden bg-ink pt-24">
      <div className="pad-x grid gap-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="display text-[clamp(1.8rem,3.2vw,3.2rem)] text-bone">Precision. Care. Confidence.</p>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-silver/70">
            Professional automotive care with attention to performance, reliability, and every detail.
          </p>
        </div>
        <nav aria-label="Footer" className="md:col-span-3 md:col-start-7">
          <p className="eyebrow mb-6">Navigate</p>
          <ul className="space-y-1">
            {LINKS.map((l) => (
              <li key={l.to}>
                <TLink to={l.to} className="group inline-flex items-center gap-3 py-1.5 text-lg text-bone/80 transition-all duration-500 hover:translate-x-2 hover:text-bone">
                  <span className="h-px w-0 bg-race transition-all duration-500 group-hover:w-6" />{l.label}
                </TLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <p className="eyebrow mb-6">Contact</p>
          <a href={SITE.tel} className="block py-1.5 text-lg text-bone transition-colors hover:text-race">{SITE.phone}</a>
          <a href={SITE.mailto} className="block break-all py-1.5 text-base text-silver transition-colors hover:text-bone">{SITE.email}</a>
        </div>
      </div>

      <div data-wordmark aria-hidden="true"
        className="display mt-20 select-none whitespace-nowrap pl-[2vw] text-bone"
        style={{ fontSize: '16.2vw', lineHeight: 0.85 }}>
        <span className="flex overflow-hidden pb-[0.12em]">
          {word.split('').map((c, i) => (
            <span key={i} data-c
              className="inline-block transition-[color,transform] duration-500 hover:-translate-y-[4%] hover:text-race"
              style={{ whiteSpace: 'pre' }}>{c}</span>
          ))}
        </span>
      </div>

      <div className="pad-x flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-silver/60 md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
        <p className="max-w-2xl md:text-right">
          Photography via Unsplash. Third-party vehicle names and marks shown in imagery belong to their respective owners
          and imply no affiliation with Neil&apos;s Express Automotive.
        </p>
      </div>
    </footer>
  )
}
