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
      <pointLight position={[-1.2, 4.6, -3]} intensity={140} distance={26} decay={1.6} color="#dfe8ff" />
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
    if (key.current) key.current.intensity = 20 + 190 * smoothstep(r.current, 0.35, 0.85)
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

/* ---------- the cloth ---------- */
const PROFILE: [number, number][] = [[-3.4, 0], [-2.8, 0.5], [-2.3, 0.97], [-1.2, 1.17], [-0.3, 1.44], [0.7, 1.37], [1.4, 1.14], [1.9, 0.8]]
const prof = (z: number) => {
  for (let i = 0; i < PROFILE.length - 1; i++) {
    const [z0, y0] = PROFILE[i], [z1, y1] = PROFILE[i + 1]
    if (z <= z1) { const t = clamp((z - z0) / (z1 - z0), 0, 1); return lerp(y0, y1, t * t * (3 - 2 * t)) }
  }
  return PROFILE[PROFILE.length - 1][1]
}

function Cloth({ r }: { r: MutableRefObject<number> }) {
  const W = 80, H = 100
  const { geo, base } = useMemo(() => {
    const n = (W + 1) * (H + 1)
    const pos = new Float32Array(n * 3)
    const base = new Float32Array(n * 3)
    let k = 0
    for (let i = 0; i <= H; i++) for (let j = 0; j <= W; j++) {
      const x = -2.7 + (5.4 * j) / W
      let z = -3.4 + (5.3 * i) / H
      if (i === H) z += 0.1 * Math.sin(x * 7)
      const s = smoothstep(1.5 - Math.abs(x), 0, 0.62)
      const folds = 0.05 * Math.sin(x * 7 + z * 1.6) * (s * (1 - s) * 4) + 0.025 * Math.sin(x * 13 - z * 4)
      const ground = 0.025 * (1 + Math.sin(x * 5 + z * 3)) * (1 - s)
      const y = 0.035 + prof(z) * Math.pow(s, 0.75) + folds + ground + (i === H ? -0.12 * Math.abs(Math.sin(x * 5)) : 0)
      base[k] = x; base[k + 1] = y; base[k + 2] = z
      pos[k] = x; pos[k + 1] = y; pos[k + 2] = z
      k += 3
    }
    const idx: number[] = []
    for (let i = 0; i < H; i++) for (let j = 0; j < W; j++) {
      const a = i * (W + 1) + j, b = a + 1, c = a + W + 1, d = c + 1
      idx.push(a, c, b, b, c, d)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setIndex(idx)
    g.computeVertexNormals()
    return { geo: g, base }
  }, [])
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  const mesh = useRef<THREE.Mesh>(null)
  const last = useRef(-1)

  useFrame(({ clock }) => {
    const rv = r.current
    const m = mesh.current!
    m.visible = rv < 0.975
    if (!m.visible) return
    if (rv <= 0.0005 && last.current === 0) return
    last.current = rv <= 0.0005 ? 0 : 1
    const t = clock.elapsedTime
    const p = geo.attributes.position.array as Float32Array
    for (let k = 0; k < p.length; k += 3) {
      const x = base[k], y = base[k + 1], z = base[k + 2]
      const a = (1.9 - z) / 5.3
      const pv = clamp((rv * 1.6 - a * 0.8) / 0.75, 0, 1)
      const e = pv * pv * (3 - 2 * pv)
      const fl = Math.sin(z * 2.2 + t * 5 + x * 1.5) * 0.2 * Math.sin(pv * Math.PI)
      p[k] = x + e * (2.8 + 1.5 * a) + fl * 0.6
      p[k + 1] = y + e * (4.6 + 3 * a) + fl
      p[k + 2] = z - e * (8 + 4 * a)
    }
    geo.attributes.position.needsUpdate = true
    geo.computeVertexNormals()
    if (mat.current) mat.current.opacity = 1 - smoothstep(rv, 0.82, 0.97)
  })

  return (
    <mesh ref={mesh} geometry={geo} frustumCulled={false}>
      <meshStandardMaterial ref={mat} color="#d9d9d4" roughness={0.92} metalness={0} side={THREE.DoubleSide} transparent polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
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
      <Cloth r={r} />
      <Sparkles count={mobile ? 30 : 70} scale={[12, 6, 14]} position={[0, 3, -1]} size={2.2} speed={0.25} opacity={0.5} color="#ffffff" />
      <Rig r={r} />
    </Canvas>
  )
}
