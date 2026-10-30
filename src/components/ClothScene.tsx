import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, MeshReflectorMaterial, Sparkles, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { MODEL_URL } from './CarScene'

const { damp, lerp, smoothstep, clamp } = THREE.MathUtils

/* ---------- procedural concrete ---------- */
function concreteTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 512
  const x = c.getContext('2d')!
  x.fillStyle = '#2b2b2d'; x.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 90; i++) {
    const g = x.createRadialGradient(Math.random() * 512, Math.random() * 512, 0, Math.random() * 512, Math.random() * 512, 40 + Math.random() * 140)
    const v = Math.random() > 0.5 ? '255,255,255' : '0,0,0'
    g.addColorStop(0, `rgba(${v},${0.04 + Math.random() * 0.05})`); g.addColorStop(1, `rgba(${v},0)`)
    x.fillStyle = g; x.fillRect(0, 0, 512, 512)
  }
  const img = x.getImageData(0, 0, 512, 512)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 26
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n
  }
  x.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function glowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const x = c.getContext('2d')!
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(0.25, 'rgba(255,255,255,.25)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g; x.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

/* ---------- garage ---------- */
const TUBES: { p: [number, number, number]; rz: number; ry: number; len: number }[] = [
  { p: [-1.6, 5.2, -4.6], rz: 0.95, ry: 0.2, len: 5.2 },
  { p: [-0.4, 5.7, -5.2], rz: -0.22, ry: 0.15, len: 6.2 },
  { p: [-2.3, 5.0, -3.8], rz: -1.0, ry: -0.2, len: 4.2 },
  { p: [0.3, 4.5, -4.2], rz: 0.62, ry: 0.35, len: 4.6 },
  { p: [-1.2, 6.1, -5.8], rz: 1.45, ry: 0, len: 4 },
]

function Garage({ mobile }: { mobile: boolean }) {
  const concrete = useMemo(() => { const t = concreteTexture(); t.repeat.set(4, 2); return t }, [])
  const floorTex = useMemo(() => { const t = concreteTexture(); t.repeat.set(8, 8); return t }, [])
  const glow = useMemo(() => glowTexture(), [])
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        {mobile ? (
          <meshStandardMaterial map={floorTex} color="#1b1b1d" roughness={0.8} metalness={0.1} envMapIntensity={0.3} />
        ) : (
          <MeshReflectorMaterial map={floorTex} color="#2a2a2c" blur={[260, 80]} resolution={512} mixBlur={1.2} mixStrength={14}
            roughness={0.85} depthScale={0.9} minDepthThreshold={0.4} maxDepthThreshold={1.4} metalness={0.4} mirror={0} />
        )}
      </mesh>
      <mesh position={[0, 7, -11]}><planeGeometry args={[34, 14]} /><meshStandardMaterial map={concrete} color="#4a4a4d" roughness={0.95} /></mesh>
      <mesh position={[-9, 7, -2]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[28, 14]} /><meshStandardMaterial map={concrete} color="#38383a" roughness={0.95} /></mesh>
      <mesh position={[9, 7, -2]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[28, 14]} /><meshStandardMaterial map={concrete} color="#38383a" roughness={0.95} /></mesh>
      <mesh position={[0, 11, -2]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[34, 28]} /><meshStandardMaterial color="#111112" roughness={1} /></mesh>
      {/* diagonal concrete slab, upper right */}
      <mesh position={[6, 5.4, -6]} rotation={[0, -0.25, 0.42]}>
        <boxGeometry args={[16, 0.8, 9]} />
        <meshStandardMaterial map={concrete} color="#3c3c3f" roughness={0.95} />
      </mesh>
      {/* warm wall glow, left */}
      <mesh position={[-8.9, 2.6, -3]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[5, 3]} />
        <meshBasicMaterial color="#8a6a45" toneMapped={false} transparent opacity={0.55} />
      </mesh>
      {TUBES.map((t, i) => (
        <group key={i} position={t.p} rotation={[0, t.ry, t.rz]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, t.len, 10]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
          <sprite scale={[t.len * 0.9, 1.6, 1]}>
            <spriteMaterial map={glow} transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </sprite>
        </group>
      ))}
      <pointLight position={[-1.2, 4.6, -3]} intensity={95} distance={26} decay={1.6} color="#dfe8ff" />
      <pointLight position={[-7.5, 2.4, -2]} intensity={26} distance={14} decay={1.8} color="#d6a566" />
    </group>
  )
}

/* ---------- the car (own clone: materials are modified independently of the other scene) ---------- */
function Car({ r, onReady, mobile }: { r: MutableRefObject<number>; onReady: () => void; mobile: boolean }) {
  const { scene } = useGLTF(MODEL_URL, '/draco/')
  const car = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) { m.material = (m.material as THREE.Material).clone(); m.frustumCulled = false }
    })
    return c
  }, [scene])
  const mats = useMemo(() => {
    const m: Record<string, THREE.MeshStandardMaterial> = {}
    car.traverse((o) => { const mesh = o as THREE.Mesh; if (mesh.isMesh) { const x = mesh.material as THREE.MeshStandardMaterial; m[x.name] = x } })
    return m
  }, [car])

  const spots = useMemo(() => [-0.72, 0.72].map((x) => {
    const s = new THREE.SpotLight('#ffd7a0', 0, 18, 0.7, 1, 1.4)
    s.position.set(x, 0.7, 2.1)
    s.target.position.set(x * 1.6, 0, 8)
    return s
  }), [])

  useEffect(() => {
    Object.values(mats).forEach((m) => { m.envMapIntensity = 0.7 })
    const tint = (n: string, c: string, ro: number, mt?: number) => { const m = mats[n]; if (m) { m.color.set(c); m.roughness = ro; if (mt !== undefined) m.metalness = mt } }
    tint('metal_gray', '#3a3d42', 0.32, 1); tint('Glass_Gray', '#050607', 0.05, 0.6); tint('Interior_light', '#16171a', 0.8, 0)
    const b = mats.Body_Color as THREE.MeshPhysicalMaterial | undefined
    if (b) { b.color.set('#08090b'); b.metalness = 0.9; b.roughness = 0.3; b.clearcoat = 1; b.clearcoatRoughness = 0.05 }
    const g = mats.Projector_Glass; if (g) { g.emissive = new THREE.Color('#ffe0a8'); g.emissiveIntensity = 0 }
    const t = mats.Turn_Signal_LED; if (t) { t.emissive = new THREE.Color('#ff3b12'); t.emissiveIntensity = 0 }
    onReady()
  }, [mats, onReady])

  const glowMap = useMemo(() => glowTexture(), [])
  const key = useRef<THREE.PointLight>(null)
  const flares = useRef<THREE.Group>(null)
  useFrame(() => {
    const on = smoothstep(r.current, 0.35, 0.6)
    if (key.current) key.current.intensity = 70 + 150 * smoothstep(r.current, 0.35, 0.85)
    flares.current?.children.forEach((c) => ((c as THREE.Sprite).material.opacity = 0.95 * on))
    if (mats.Projector_Glass) mats.Projector_Glass.emissiveIntensity = 9 * on
    if (mats.Turn_Signal_LED) mats.Turn_Signal_LED.emissiveIntensity = 3.5 * on
    spots.forEach((s) => { s.intensity = (mobile ? 130 : 330) * on })
  })

  return (
    <group rotation={[0, Math.PI, 0]}>
      {/* rotate model so its nose faces +Z; spotlights live outside this flip */}
      <primitive object={car} />
      <group rotation={[0, Math.PI, 0]}>
        {spots.map((s, i) => (<group key={i}><primitive object={s} /><primitive object={s.target} /></group>))}
        <group ref={flares}>
          {[-0.74, 0.74].map((x) => (
            <sprite key={x} position={[x, 0.66, 2.08]} scale={[0.6, 0.6, 1]}>
              <spriteMaterial map={glowMap} color="#ffcf8f" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
            </sprite>
          ))}
        </group>
        <pointLight ref={key} position={[-3.2, 2.4, 5.5]} color="#d6dcef" distance={16} decay={1.5} />
      </group>
    </group>
  )
}

/* ---------- the cloth: position-based dynamics (verlet + distance constraints) ---------- */
type P = [number, number][]
const interp = (pts: P, z: number) => {
  if (z <= pts[0][0] || z >= pts[pts.length - 1][0]) return 0
  for (let i = 0; i < pts.length - 1; i++) {
    const [z0, y0] = pts[i], [z1, y1] = pts[i + 1]
    if (z <= z1) { const t = (z - z0) / (z1 - z0); return y0 + (y1 - y0) * t * t * (3 - 2 * t) }
  }
  return 0
}
const CAR_H: P = [[-2.4, 0], [-2.32, 0.45], [-2.1, 0.9], [-1.3, 1.0], [-0.6, 1.12], [-0.1, 1.22], [0.5, 1.16], [1.1, 0.98], [1.7, 0.82], [2.1, 0.62], [2.28, 0.3], [2.36, 0]]
const carW = (z: number) => 0.95 - 0.2 * smoothstep(Math.abs(z), 1.3, 2.3)

class ClothSim {
  W: number; H: number; n: number
  pos: Float32Array; prev: Float32Array
  pinned: Uint8Array
  a: Int32Array; b: Int32Array; rest: Float32Array; k: Float32Array
  front: number[] = []; rest0: Float32Array = new Float32Array(0)
  iters: number
  anchored = false

  constructor(W: number, H: number, iters: number) {
    this.W = W; this.H = H; this.iters = iters
    const n = (this.n = (W + 1) * (H + 1))
    this.pos = new Float32Array(n * 3); this.prev = new Float32Array(n * 3); this.pinned = new Uint8Array(n)
    for (let i = 0; i <= H; i++) for (let j = 0; j <= W; j++) {
      const id = (i * (W + 1) + j) * 3
      const x = -1.6 + (3.2 * j) / W, z = -3.4 + (5.35 * i) / H
      const jitter = (Math.sin(j * 12.9898 + i * 78.233) * 43758.5453) % 1
      // tailored cover: starts already draped over the car, rest lengths come from this shape
      const side = 1 - smoothstep(Math.abs(x), carW(z) + 0.04, carW(z) + 0.42)
      const y = 0.03 + (interp(CAR_H, z) + 0.06) * Math.pow(side, 0.85) + 0.012 * jitter
      this.pos[id] = x
      this.pos[id + 1] = y
      this.pos[id + 2] = z
    }
    this.prev.set(this.pos)
    const A: number[] = [], B: number[] = [], K: number[] = []
    const add = (i0: number, j0: number, i1: number, j1: number, w: number) => {
      if (i1 > H || j1 > W || j1 < 0) return
      A.push(i0 * (W + 1) + j0); B.push(i1 * (W + 1) + j1); K.push(w)
    }
    for (let i = 0; i <= H; i++) for (let j = 0; j <= W; j++) {
      add(i, j, i, j + 1, 1); add(i, j, i + 1, j, 1)
      add(i, j, i + 1, j + 1, 0.7); add(i, j, i + 1, j - 1, 0.7)
      add(i, j, i, j + 2, 0.22); add(i, j, i + 2, j, 0.22)
    }
    this.a = Int32Array.from(A); this.b = Int32Array.from(B); this.k = Float32Array.from(K)
    this.rest = new Float32Array(A.length)
    for (let c = 0; c < A.length; c++) {
      const p = this.a[c] * 3, q = this.b[c] * 3
      this.rest[c] = Math.hypot(this.pos[p] - this.pos[q], this.pos[p + 1] - this.pos[q + 1], this.pos[p + 2] - this.pos[q + 2]) * 1.004
    }
    for (let row = H; row >= H - 2; row--) for (let j = 0; j <= W; j++) this.front.push(row * (W + 1) + j)
  }

  collide() {
    const p = this.pos, pr = this.prev
    for (let v = 0; v < this.n; v++) {
      if (this.pinned[v]) continue
      const o = v * 3
      let x = p[o], y = p[o + 1]
      const z = p[o + 2]
      if (y < 0.012) { y = 0.012; pr[o] += (x - pr[o]) * 0.25; pr[o + 2] += (z - pr[o + 2]) * 0.25 }
      const h = interp(CAR_H, z)
      if (h > 0.05) {
        const hx = carW(z) + 0.035, hy = h + 0.035
        const ax = Math.abs(x) / hx, ay = y / hy
        const f = ax * ax * ax * ax + ay * ay * ay * ay
        if (f < 1) {
          const s = Math.sqrt(Math.sqrt(f))
          if (s < 1e-3) { y = hy } else { x /= s; y /= s }
          pr[o] += (x - pr[o]) * 0.2; pr[o + 1] += (y - pr[o + 1]) * 0.2; pr[o + 2] += (z - pr[o + 2]) * 0.2
        }
      }
      p[o] = x; p[o + 1] = y
    }
  }

  step(dt: number) {
    const p = this.pos, pr = this.prev, n3 = this.n * 3
    const g = -9.8 * dt * dt
    for (let o = 0; o < n3; o += 3) {
      if (this.pinned[o / 3]) continue
      const vx = (p[o] - pr[o]) * 0.985, vy = (p[o + 1] - pr[o + 1]) * 0.985, vz = (p[o + 2] - pr[o + 2]) * 0.985
      pr[o] = p[o]; pr[o + 1] = p[o + 1]; pr[o + 2] = p[o + 2]
      p[o] += vx; p[o + 1] += vy + g; p[o + 2] += vz
    }
    const { a, b, rest, k } = this
    for (let it = 0; it < this.iters; it++) {
      for (let c = 0; c < a.length; c++) {
        const i = a[c] * 3, j = b[c] * 3
        const dx = p[j] - p[i], dy = p[j + 1] - p[i + 1], dz = p[j + 2] - p[i + 2]
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6
        const diff = ((d - rest[c]) / d) * k[c]
        const pa = this.pinned[a[c]], pb = this.pinned[b[c]]
        if (pa && pb) continue
        const wa = pa ? 0 : pb ? 1 : 0.5, wb = pb ? 0 : pa ? 1 : 0.5
        p[i] += dx * diff * wa; p[i + 1] += dy * diff * wa; p[i + 2] += dz * diff * wa
        p[j] -= dx * diff * wb; p[j + 1] -= dy * diff * wb; p[j + 2] -= dz * diff * wb
      }
    }
    this.collide()
  }

  settle(frames = 140) {
    for (let f = 0; f < frames; f++) this.step(1 / 60)
    this.rest0 = Float32Array.from(this.front.flatMap((v) => [this.pos[v * 3], this.pos[v * 3 + 1], this.pos[v * 3 + 2]]))
  }

  /** grip the front hem and drag it up, back and away as r goes 0 -> 1 */
  anchor(r: number, on: boolean) {
    if (!on) {
      if (this.anchored) { this.anchored = false; this.front.forEach((v) => (this.pinned[v] = 0)) }
      return
    }
    this.anchored = true
    const t1 = smoothstep(r, 0, 0.3), t2 = smoothstep(r, 0.25, 0.7), t3 = smoothstep(r, 0.65, 1)
    const gather = 0.38 * smoothstep(r, 0.02, 0.55)
    const dy = 1.5 * t1 + 0.5 * t2 + 2.6 * t3
    const dz = -1.2 * t1 - 5 * t2 - 4.2 * t3
    const dx = 1.0 * t2 + 3.6 * t3
    this.front.forEach((v, idx) => {
      const x0 = this.rest0[idx * 3], y0 = this.rest0[idx * 3 + 1], z0 = this.rest0[idx * 3 + 2]
      const o = v * 3
      this.pos[o] = x0 * (1 - gather) + dx
      this.pos[o + 1] = y0 + dy
      this.pos[o + 2] = z0 + dz
      this.prev[o] = this.pos[o]; this.prev[o + 1] = this.pos[o + 1]; this.prev[o + 2] = this.pos[o + 2]
      this.pinned[v] = 1
    })
  }
}

function weaveTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const x = c.getContext('2d')!
  x.fillStyle = '#808080'; x.fillRect(0, 0, 64, 64)
  for (let i = 0; i < 64; i += 4) {
    x.fillStyle = '#9a9a9a'; x.fillRect(i, 0, 2, 64)
    x.fillStyle = '#6a6a6a'; x.fillRect(0, i, 64, 2)
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

function Cloth({ r, mobile }: { r: MutableRefObject<number>; mobile: boolean }) {
  const { sim, geo } = useMemo(() => {
    const sim = new ClothSim(mobile ? 44 : 60, mobile ? 44 : 64, mobile ? 4 : 6)
    sim.settle()
    const W = sim.W, H = sim.H
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(sim.pos.slice(), 3))
    const uv = new Float32Array(sim.n * 2)
    for (let i = 0; i <= H; i++) for (let j = 0; j <= W; j++) { const o = (i * (W + 1) + j) * 2; uv[o] = (j / W) * 34; uv[o + 1] = (i / H) * 33 }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    const idx: number[] = []
    for (let i = 0; i < H; i++) for (let j = 0; j < W; j++) {
      const a = i * (W + 1) + j, b = a + 1, c = a + W + 1, d = c + 1
      idx.push(a, c, b, b, c, d)
    }
    g.setIndex(idx)
    g.computeVertexNormals()
    return { sim, geo: g }
  }, [mobile])
  const weave = useMemo(() => weaveTexture(), [])
  const mat = useRef<THREE.MeshPhysicalMaterial>(null)
  const mesh = useRef<THREE.Mesh>(null)
  const idle = useRef(0)

  useFrame(() => {
    const rv = r.current
    const m = mesh.current!
    const live = rv > 0.001
    if (live) idle.current = 0
    else idle.current++
    if (live || idle.current < 180) {
      sim.anchor(rv, live)
      sim.step(1 / 60); sim.step(1 / 60)
      sim.anchor(rv, live)
      ;(geo.attributes.position.array as Float32Array).set(sim.pos)
      geo.attributes.position.needsUpdate = true
      geo.computeVertexNormals()
    }
    m.visible = rv < 0.99
    if (mat.current) mat.current.opacity = 1 - smoothstep(rv, 0.9, 0.99)
  })

  return (
    <mesh ref={mesh} geometry={geo} frustumCulled={false}>
      <meshPhysicalMaterial ref={mat} color="#c4c2bb" roughness={0.9} metalness={0} side={THREE.DoubleSide} transparent
        bumpMap={weave} bumpScale={0.35} sheen={0.8} sheenRoughness={0.55} sheenColor="#ffffff" />
    </mesh>
  )
}


/* ---------- camera ---------- */
function Rig({ r }: { r: MutableRefObject<number> }) {
  const { camera, size } = useThree()
  const pos = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ clock }) => {
    const aspect = size.width / size.height
    const t = smoothstep(r.current, 0.04, 0.96)
    const e = t * t * (3 - 2 * t)
    pos.set(lerp(0.7, -3.3, e), lerp(1.45, 0.55, e), lerp(8.4, 5.5, e))
    look.set(lerp(0, 0.1, e), lerp(0.7, 0.7, e), lerp(0.2, 1.4, e))
    const k = aspect < 1.2 ? 1 + (1.2 - aspect) * 1.6 : 1
    pos.sub(look).multiplyScalar(k).add(look)
    pos.x += Math.sin(clock.elapsedTime * 0.3) * 0.04
    camera.position.copy(pos)
    const roll = lerp(0, -0.13, e)
    camera.up.set(Math.sin(roll), Math.cos(roll), 0)
    camera.lookAt(look)
  })
  return null
}

function Damper({ progress, r }: { progress: MutableRefObject<number>; r: MutableRefObject<number> }) {
  useFrame((_, dt) => { r.current = damp(r.current, progress.current, 4, Math.min(dt, 0.05)) }, -1)
  return null
}

export default function ClothScene({ progress, active, mobile, onReady }: {
  progress: MutableRefObject<number>; active: boolean; mobile: boolean; onReady: () => void
}) {
  const r = useRef(0)
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={mobile ? [1, 1.3] : [1, 1.6]}
      camera={{ fov: 32, near: 0.1, far: 80, position: [0.7, 1.45, 9.8] }}
      gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.35 }}
      onCreated={({ scene }) => { scene.environmentIntensity = 0.9 }}
      style={{ position: 'absolute', inset: 0 }}
      aria-label="3D car under a cloth cover that is pulled away"
    >
      <color attach="background" args={['#0b0b0c']} />
      <fog attach="fog" args={['#0b0b0c', 14, 30]} />
      <Damper progress={progress} r={r} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} position={[-1.5, 6, -4]} rotation={[Math.PI / 2, 0, 0.6]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-7, 2, 0]} rotation={[0, Math.PI / 2, 0]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={0.9} position={[6, 3, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 3, 1]} />
      </Environment>
      <Garage mobile={mobile} />
      <Car r={r} onReady={onReady} mobile={mobile} />
      <Cloth r={r} mobile={mobile} />
      <Sparkles count={mobile ? 30 : 70} scale={[12, 6, 14]} position={[0, 3, -1]} size={2.2} speed={0.25} opacity={0.5} color="#ffffff" />
      <Rig r={r} />
    </Canvas>
  )
}
