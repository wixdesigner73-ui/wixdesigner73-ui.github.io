import { IMG, type Photo } from './images'

export const SITE = {
  name: "Neil's Express Automotive",
  phone: '(626) 284-3214',
  tel: 'tel:+16262843214',
  email: 'neilexpress@hotmail.com',
  mailto: 'mailto:neilexpress@hotmail.com',
}

/** Provisional services. Edit here until the business confirms its real list. */
export type Service = { id: string; n: string; title: string; blurb: string; photo: Photo; tag: string }
export const SERVICES: Service[] = [
  { id: 'diagnostics', n: '01', title: 'Vehicle Diagnostics', tag: 'Find it first', photo: IMG.mech,
    blurb: 'Careful inspection and testing to understand what your vehicle is telling us, so every recommendation starts from facts.' },
  { id: 'maintenance', n: '02', title: 'Routine Maintenance', tag: 'Stay ahead', photo: IMG.workshop2,
    blurb: 'Regular, thorough care that keeps your vehicle dependable and helps prevent small issues from becoming big ones.' },
  { id: 'brakes', n: '03', title: 'Brake Service', tag: 'Stop with confidence', photo: IMG.caliper,
    blurb: 'Inspection and service of the components that matter most when you need them most.' },
  { id: 'engine', n: '04', title: 'Engine Repair', tag: 'Power, restored', photo: IMG.engine,
    blurb: 'Precise, methodical engine work focused on restoring performance and reliability.' },
  { id: 'suspension', n: '05', title: 'Suspension & Steering', tag: 'Control in every corner', photo: IMG.wheel2,
    blurb: 'Service for the systems that shape ride quality, handling and how your vehicle feels on the road.' },
  { id: 'general', n: '06', title: 'General Automotive Repair', tag: 'Whatever it needs', photo: IMG.workshop,
    blurb: 'Dependable repair across a wide range of vehicle concerns, with clear communication throughout.' },
]
