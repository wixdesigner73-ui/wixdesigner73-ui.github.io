import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHero from '../components/PageHero'
import { Btn, Rise } from '../components/ui'
import { IMG } from '../lib/images'
import { SERVICES, SITE } from '../lib/site'
import { useSeo } from '../lib/motion'

/**
 * Integration-ready: set VITE_FORM_ENDPOINT (e.g. a Formspree / Basin / own API URL) in .env and the form POSTs JSON there.
 * Without it, the form falls back to opening the visitor's email app addressed to the business.
 */
const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT as string | undefined

type Status = { kind: 'idle' | 'sending' | 'ok' | 'error'; msg?: string }

function Field({ id, label, type = 'text', required, autoComplete }: { id: string; label: string; type?: string; required?: boolean; autoComplete?: string }) {
  return (
    <div className="field">
      <input id={id} name={id} type={type} placeholder=" " required={required} autoComplete={autoComplete} />
      <label htmlFor={id}>{label}{required && ' *'}</label>
      <span className="bar" />
    </div>
  )
}

export default function Contact() {
  useSeo("Contact | Neil's Express Automotive",
    "Contact Neil's Express Automotive. Call (626) 284-3214 or email neilexpress@hotmail.com.")
  const [params] = useSearchParams()
  const preset = SERVICES.find((s) => s.id === params.get('service'))?.title ?? ''
  const [service, setService] = useState(preset)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    if (f.get('company')) return // honeypot
    const data = Object.fromEntries(f.entries()) as Record<string, string>
    delete data.company
    setStatus({ kind: 'sending' })
    if (ENDPOINT) {
      try {
        const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
        if (!r.ok) throw new Error()
        setStatus({ kind: 'ok', msg: 'Thank you. Your message has been sent and we will be in touch.' })
        form.reset(); setService('')
      } catch {
        setStatus({ kind: 'error', msg: `Something went wrong. Please call ${SITE.phone} or email ${SITE.email}.` })
      }
      return
    }
    const body = [
      `Name: ${data.name}`, `Email: ${data.email}`, `Phone: ${data.phone || '-'}`,
      `Vehicle: ${data.vehicle || '-'}`, `Service: ${data.service || '-'}`, '', data.message || '',
    ].join('\n')
    window.location.href = `${SITE.mailto}?subject=${encodeURIComponent(`Enquiry from ${data.name}`)}&body=${encodeURIComponent(body)}`
    setStatus({ kind: 'ok', msg: 'Opening your email app with your message ready to send.' })
  }

  return (
    <>
      <PageHero short photo={IMG.gtgrey} eyebrow="Contact" lines={["Let's talk", <>Automotive<span key="d" className="text-race">.</span></>]} />
      <section className="relative bg-ink py-20 md:py-32">
        <div className="pad-x grid gap-16 lg:grid-cols-12">
          <Rise className="lg:col-span-5">
            <p className="eyebrow mb-8">Get in touch</p>
            <h2 className="display text-[clamp(2rem,3.4vw,3.6rem)] text-bone">Neil&apos;s Express Automotive</h2>
            <dl className="mt-12 space-y-10">
              <div>
                <dt className="text-[0.68rem] uppercase tracking-[0.3em] text-silver/60">Phone</dt>
                <dd className="mt-2"><a href={SITE.tel} className="display text-[clamp(2.4rem,4.4vw,4.4rem)] text-bone transition-colors hover:text-race">{SITE.phone}</a></dd>
              </div>
              <div>
                <dt className="text-[0.68rem] uppercase tracking-[0.3em] text-silver/60">Email</dt>
                <dd className="mt-2"><a href={SITE.mailto} className="break-all text-xl text-bone underline decoration-race decoration-1 underline-offset-8 transition-colors hover:text-silver md:text-2xl">{SITE.email}</a></dd>
              </div>
            </dl>
            <p className="lead mt-12 max-w-sm">Tell us about your vehicle and what it needs. We will take it from there.</p>
          </Rise>

          <form onSubmit={onSubmit} className="lg:col-span-7" noValidate={false} aria-describedby="form-status">
            <div className="grid gap-x-10 gap-y-3 md:grid-cols-2">
              <Field id="name" label="Full Name" required autoComplete="name" />
              <Field id="email" label="Email Address" type="email" required autoComplete="email" />
              <Field id="phone" label="Phone Number" type="tel" autoComplete="tel" />
              <Field id="vehicle" label="Vehicle Make & Model" />
              <div className="field md:col-span-2">
                <select id="service" name="service" value={service} onChange={(e) => setService(e.target.value)} className={service ? 'filled' : ''}>
                  <option value="" />
                  {SERVICES.map((s) => <option key={s.id} value={s.title}>{s.title}</option>)}
                  <option value="Other / Not sure">Other / Not sure</option>
                </select>
                <label htmlFor="service">Service Required</label>
                <span className="bar" />
                <svg className="pointer-events-none absolute bottom-4 right-1 h-3 w-3 text-silver" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l5 5 5-5" /></svg>
              </div>
              <div className="field md:col-span-2">
                <textarea id="message" name="message" rows={4} placeholder=" " className="resize-none" />
                <label htmlFor="message">Message</label>
                <span className="bar" />
              </div>
            </div>
            <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Btn type="submit" variant="red">{status.kind === 'sending' ? 'Sending…' : 'Send Message'}</Btn>
              <p id="form-status" role="status" aria-live="polite" className={`text-sm ${status.kind === 'error' ? 'text-race' : 'text-silver'}`}>{status.msg}</p>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}
