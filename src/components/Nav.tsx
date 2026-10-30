import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { TLink } from './Transition'
import { lenisRef } from '../lib/motion'
import { SITE } from '../lib/site'

export const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact' },
]

export default function Nav() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 48)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    if (open) lenisRef.current?.stop()
    else lenisRef.current?.start()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <header
        data-nav
        className={`fixed inset-x-0 top-0 z-50 transition-[background,backdrop-filter,border-color] duration-500 ${
          scrolled && !open ? 'border-b border-white/10 bg-ink/70 backdrop-blur-xl' : 'border-b border-transparent'
        }`}
      >
        <nav aria-label="Primary" className="pad-x flex h-[4.5rem] items-center justify-between md:h-20">
          <TLink to="/" className="group relative z-[60] flex items-center gap-3" aria-label="Neil's Express Automotive, home">
            <span className="grid h-9 w-9 place-items-center border border-bone/40 font-display text-lg font-black leading-none transition-colors group-hover:border-race group-hover:bg-race">N</span>
            <span className="display text-[1.05rem] leading-none tracking-[0.08em] md:text-[1.2rem]" style={{ lineHeight: 1 }}>
              Neil&apos;s Express <span className="text-silver">Automotive</span>
            </span>
          </TLink>

          <ul className="hidden items-center gap-10 md:flex">
            {LINKS.map((l) => {
              const active = l.to === pathname
              return (
                <li key={l.to}>
                  <TLink to={l.to} aria-current={active ? 'page' : undefined}
                    className="group relative block py-2 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-bone/80 transition-colors hover:text-bone">
                    {l.label}
                    <span className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-race transition-transform duration-500 ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                  </TLink>
                </li>
              )
            })}
          </ul>

          <button
            className="relative z-[60] grid h-12 w-12 place-items-center md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className={`absolute h-px w-7 bg-bone transition-transform duration-500 ${open ? 'rotate-45' : '-translate-y-1.5'}`} />
            <span className={`absolute h-px w-7 bg-bone transition-transform duration-500 ${open ? '-rotate-45' : 'translate-y-1.5'}`} />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu"
            className="fixed inset-0 z-[55] flex flex-col justify-between bg-ink pad-x pb-10 pt-28 md:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_80%_10%,rgba(215,25,32,.16),transparent)]" />
            <ul className="relative">
              {LINKS.map((l, i) => (
                <li key={l.to} className="overflow-hidden border-b border-white/10">
                  <motion.div initial={{ y: '110%' }} animate={{ y: 0 }} exit={{ y: '110%' }}
                    transition={{ duration: 0.8, delay: 0.25 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}>
                    <TLink to={l.to} onClick={() => setOpen(false)} className="flex items-baseline gap-4 py-4">
                      <span className="text-xs tracking-[0.3em] text-race">0{i + 1}</span>
                      <span className={`display text-[4.2rem] ${l.to === pathname ? 'text-bone' : 'text-bone/70'}`}>{l.label}</span>
                    </TLink>
                  </motion.div>
                </li>
              ))}
            </ul>
            <motion.div className="relative space-y-2 text-sm text-silver"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.6 }}>
              <a href={SITE.tel} className="block py-2 text-xl text-bone">{SITE.phone}</a>
              <a href={SITE.mailto} className="block py-1">{SITE.email}</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
