export type Photo = { name: string; alt: string; pos?: string }

const p = (name: string, alt: string, pos = '50% 50%'): Photo => ({ name, alt, pos })

/** All photography is from Unsplash (https://unsplash.com/license), downloaded and optimised into /public/img. */
export const IMG = {
  hero: p('hero', 'Black Porsche 911 GT3 RS parked in a dark industrial setting', '38% 60%'),
  hero2: p('hero2', 'Black sports car in profile against a pale concrete wall'),
  amg: p('amg', 'Matte black Mercedes-AMG GT on a harbour quay'),
  amg2: p('amg2', 'Black Mercedes-AMG GT parked in front of a dark building', '50% 60%'),
  gtgrey: p('gtgrey', 'Dark grey Mercedes-AMG GT parked outdoors'),
  matte: p('mattebl', 'Matte black Lamborghini covered in rain droplets', '40% 50%'),
  silver: p('silver', 'Silver sports car in a black studio', '50% 55%'),
  showroom: p('showroom', 'Grey sports car in a dark premium showroom'),
  night: p('night', 'Dark sports car speeding through a blurred city at night'),
  ferrari: p('ferrari', 'Black supercar and alloy wheel', '45% 55%'),
  bmwFront: p('bmw', 'Black BMW with illuminated headlight', '30% 45%'),
  headlight: p('headlight', 'Close-up of glowing angel-eye headlights'),
  headlight2: p('headlight2', 'Close-up of a premium LED headlight on an orange car'),
  yellowLights: p('yellowlts', 'Black BMW front with yellow daytime running lights'),
  rear: p('rear', 'Close-up of AMG badge and tail light on black bodywork'),
  wheel: p('wheel', 'Close-up of a polished alloy wheel and brake disc'),
  wheel2: p('wheel2', 'Close-up of a multi-spoke alloy wheel at sunset'),
  caliper: p('caliper', 'Black alloy wheel with red brake caliper'),
  interior: p('interior', 'Carbon fibre luxury car interior and gear selector'),
  cockpit: p('wheelint', 'Luxury car cockpit and steering wheel'),
  engine: p('engine', 'Detail of a modern engine bay'),
  engine2: p('engine2', 'Chrome engine with blue detailing'),
  diag: p('diag', 'Technician inspecting an engine bay'),
  mech: p('mech', 'Technician working under the hood of a luxury car', '60% 50%'),
  workshop: p('workshop', 'Vehicles being serviced in a professional workshop'),
  workshop2: p('workshop2', 'Bright, spacious automotive workshop'),
} satisfies Record<string, Photo>

export const src = (ph: Photo, mobile = false) => `/img/${ph.name}${mobile ? '-m' : ''}.webp`
