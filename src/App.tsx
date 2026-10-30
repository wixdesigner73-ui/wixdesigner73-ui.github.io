import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { gsap, lenisRef, prefersReduced, ScrollTrigger } from './lib/motion'
import { TransitionProvider } from './components/Transition'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Home from './pages/Home'

const About = lazy(() => import('./pages/About'))
const Services = lazy(() => import('./pages/Services'))
const Contact = lazy(() => import('./pages/Contact'))

function SmoothScroll() {
  useEffect(() => {
    if (prefersReduced()) { document.documentElement.classList.add('static-motion'); return }
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    return () => {
      window.removeEventListener('load', refresh)
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => { requestAnimationFrame(() => ScrollTrigger.refresh()) }, [pathname])
  return (
    <TransitionProvider>
      <SmoothScroll />
      <a href="#main" className="fixed left-4 top-4 z-[100] -translate-y-20 bg-bone px-4 py-3 text-xs font-bold uppercase tracking-widest text-ink focus:translate-y-0">Skip to content</a>
      <Nav />
      <main id="main">
        <Suspense fallback={<div className="min-h-screen bg-ink" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </TransitionProvider>
  )
}
