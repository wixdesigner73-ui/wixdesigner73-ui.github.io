import { useEffect, useRef, useState } from 'react'
import { SERVICES } from '../lib/site'
import { Btn, ArrowIcon, Img, Lines } from './ui'
import { TLink } from './Transition'
import { gsap, isCoarse, prefersReduced, useGsap } from '../lib/motion'

function useDesktop() {
  const q = '(min-width:1024px) and (hover:hover)'
  const [d, setD] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(q).matches)
  useEffect(() => {
    const m = matchMedia(q)
    const on = () => setD(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return d
}

export default function ServicesList() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const desktop = useDesktop()
  const first = useRef(true)
  const z = useRef(1)

  // image swap: wipe-up reveal with depth
  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (!stage.current || prefersReduced()) return
    const imgs = stage.current.querySelectorAll<HTMLElement>('[data-sv]')
    const el = imgs[active]
    z.current += 1
    gsap.killTweensOf(el)
    gsap.set(el, { zIndex: z.current })
    gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.out' })
    gsap.fromTo(el.querySelector('img'), { scale: 1.35, yPercent: 6 }, { scale: 1.08, yPercent: 0, duration: 1.4, ease: 'expo.out' })
  }, [active])

  useGsap(() => {
    const el = root.current!
    if (prefersReduced()) return
    gsap.from(el.querySelectorAll('[data-row]'), {
      yPercent: 40, opacity: 0, duration: 1.1, stagger: 0.08, ease: 'power4.out',
      scrollTrigger: { trigger: el.querySelector('[data-list]'), start: 'top 80%', once: true },
    })
    if (isCoarse()) return
    // pointer light + 3D tilt
    const tx = gsap.quickTo(stage.current!, 'rotationY', { duration: 1, ease: 'power3.out' })
    const ty = gsap.quickTo(stage.current!, 'rotationX', { duration: 1, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height
      el.style.setProperty('--mx', `${nx * 100}%`)
      el.style.setProperty('--my', `${ny * 100}%`)
      tx((nx - 0.5) * -14); ty((ny - 0.5) * 10)
    }
    el.addEventListener('pointermove', move)
    return () => el.removeEventListener('pointermove', move)
  }, root)

  return (
    <section ref={root} className="relative overflow-hidden bg-ink py-28 md:py-40" style={{ ['--mx' as string]: '70%', ['--my' as string]: '40%' }}>
      <div className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{ background: 'radial-gradient(38rem 30rem at var(--mx) var(--my), rgba(200,205,210,.09), transparent 70%)' }} />
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-race/10 blur-[140px]" />

      <div className="pad-x relative">
        <p className="eyebrow mb-8">Services</p>
        <Lines lines={['Expert care.', 'Every mile.']} className="h-xl max-w-[12ch]" />

        <div className="mt-16 grid gap-10 lg:mt-24 lg:grid-cols-12">
          <ul data-list className="lg:col-span-7" onPointerLeave={() => {}}>
            {SERVICES.map((s, i) => {
              const on = active === i
              const inner = (
                <>
                  <span className={`w-10 shrink-0 pt-2 text-xs tracking-[0.3em] transition-colors duration-500 ${on ? 'text-race' : 'text-silver/50'}`}>{s.n}</span>
                  <span className="min-w-0 flex-1">
                    <span className={`display block text-[clamp(2.1rem,5.2vw,5.6rem)] transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)] ${
                      on ? 'translate-x-3 text-bone' : 'text-bone/35 lg:hover:text-bone/70'}`} style={{ lineHeight: 0.95 }}>
                      {s.title}
                    </span>
                    <span className={`mt-2 block text-[0.7rem] uppercase tracking-[0.28em] transition-all duration-700 ${on ? 'translate-x-3 text-silver opacity-100' : 'translate-x-0 text-silver/0 opacity-0'}`}>{s.tag}</span>
                  </span>
                  <span className={`mt-2 grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-all duration-700 ${
                    on ? 'rotate-[-45deg] border-race bg-race text-white' : 'border-white/20 text-bone/50'}`}>
                    <span className="block h-5 w-5"><ArrowIcon /></span>
                  </span>
                </>
              )
              return (
                <li key={s.id} data-row className="relative border-b border-white/10">
                  <span className={`absolute bottom-[-1px] left-0 h-px w-full origin-left bg-race transition-transform duration-700 ${on ? 'scale-x-100' : 'scale-x-0'}`} />
                  {desktop ? (
                    <TLink to="/services" className="flex items-start gap-4 py-6 xl:py-7"
                      onClick={undefined}>
                      <span className="contents" onPointerEnter={() => setActive(i)} onFocus={() => setActive(i)}>{inner}</span>
                    </TLink>
                  ) : (
                    <>
                      <button className="flex w-full items-start gap-4 py-6 text-left" aria-expanded={on} onClick={() => setActive(on ? -1 : i)}>
                        {inner}
                      </button>
                      <div className="grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(.2,.8,.2,1)]" style={{ gridTemplateRows: on ? '1fr' : '0fr' }}>
                        <div className="overflow-hidden">
                          <div className="relative mb-4 aspect-[16/10] overflow-hidden bg-carbon">
                            <Img photo={s.photo} sizes="100vw" className="h-full w-full" />
                            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                          </div>
                          <p className="lead mb-6 max-w-lg">{s.blurb}</p>
                          <TLink to="/services" className="mb-8 inline-flex min-h-12 items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-bone">
                            View service <span className="block h-4 w-4"><ArrowIcon /></span>
                          </TLink>
                        </div>
                      </div>
                    </>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-28" style={{ perspective: 1200 }}>
              <div ref={stage} className="relative aspect-[4/5] w-full" style={{ transformStyle: 'preserve-3d' }}>
                {SERVICES.map((s, i) => (
                  <div key={s.id} data-sv aria-hidden={active !== i} className="absolute inset-0 overflow-hidden bg-carbon shadow-[0_40px_90px_-30px_rgba(0,0,0,.9)]"
                    style={{ zIndex: i === 0 ? 1 : 0, clipPath: i === 0 ? 'inset(0)' : 'inset(100% 0 0 0)' }}>
                    <Img photo={s.photo} sizes="40vw" className="h-full w-full scale-[1.08]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/20" />
                    <div className="absolute inset-x-6 bottom-6 flex items-end justify-between">
                      <p className="max-w-[18rem] text-sm leading-relaxed text-bone/85">{s.blurb}</p>
                      <span className="display text-6xl text-bone/20">{s.n}</span>
                    </div>
                  </div>
                ))}
                <div className="pointer-events-none absolute -inset-px border border-white/10" style={{ transform: 'translateZ(40px)' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14"><Btn to="/services">Explore All Services</Btn></div>
      </div>
    </section>
  )
}
