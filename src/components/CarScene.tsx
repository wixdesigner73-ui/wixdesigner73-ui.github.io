import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, MeshReflectorMaterial, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * 3D model: Ferrari 458 Italia by vicent091036, distributed with the three.js examples.
 * IMPORTANT: confirm the licence for commercial use, or swap this URL for a model you own / have licensed.
 * Any glTF/GLB works; material names below are matched best-effort.
 */
export const MODEL_URL = '/models/ferrari.glb'
useGLTF.setDecoderPath('/draco/')

const { damp, lerp, smoothstep } = THREE.MathUtils
const ease = (t: number) => t * t * (3 - 2 * t)

type KF = number[] // [p, x, y, z]
function sample(p: number, kfs: KF[], out: THREE.Vector3) {
  if (p <= kfs[0][0]) return out.set(kfs[0][1], kfs[0][2], kfs[0][3])
  for (let i = 0; i < kfs.length - 1; i++) {
    const a = kfs[i], b = kfs[i + 1]
    if (p <= b[0]) {
      const t = ease((p - a[0]) / (b[0] - a[0]))
      return out.set(lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t))
    }
  }
  const l = kfs[kfs.length - 1]
  return out.set(l[1], l[2], l[3])
}

// Camera path: close on the nose -> pull back -> three-quarter. Car is centred, front facing +Z.
const CAM: KF[] = [
  [0.0, 1.5, 0.55, 5.3],
  [0.3, 2.1, 0.75, 6.0],
  [0.55, 3.9, 1.1, 6.3],
  [0.84, 5.3, 1.25, 5.1],
  [1.0, 5.4, 1.3, 4.9],
]
const LOOK: KF[] = [
  [0.0, 0.2, 0.5, 2.1],
  [0.3, 0.1, 0.55, 1.4],
  [0.55, 0, 0.3, 0.4],
  [0.84, 0, 0.3, 0.3],
  [1.0, 1.2, 0.3, 0.3],
]

function Rig({ sp }: { sp: MutableRefObject<number> }) {
  const { camera, size } = useThree()
  const pos = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ clock }) => {
    const p = sp.current
    sample(p, CAM, pos)
    sample(p, LOOK, look)
    const aspect = size.width / size.height
    const k = aspect < 1.2 ? 1 + (1.2 - aspect) * 2.3 : 1
    pos.sub(look).multiplyScalar(k).add(look)
    const t = clock.elapsedTime
    pos.x += Math.sin(t * 0.35) * 0.05
    pos.y += Math.sin(t * 0.27) * 0.03
    camera.position.copy(pos)
    camera.lookAt(look.x, look.y - (aspect < 1 ? 0.15 : 0.12), look.z)
  })
  return null
}

function Car({ sp, onReady }: { sp: MutableRefObject<number>; onReady: () => void }) {
  const { scene } = useGLTF(MODEL_URL, '/draco/')
  const group = useRef<THREE.Group>(null)
  const mats = useMemo(() => {
    const m: Record<string, THREE.MeshStandardMaterial> = {}
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh) {
        const mat = mesh.material as THREE.MeshStandardMaterial
        m[mat.name] = mat
      }
    })
    return m
  }, [scene])

  useEffect(() => {
    Object.values(mats).forEach((m) => { m.envMapIntensity = 0.55 })
    const tint = (n: string, c: string, r: number, mt?: number) => { const m = mats[n]; if (m) { m.color.set(c); m.roughness = r; if (mt !== undefined) m.metalness = mt } }
    tint("metal_gray", "#3a3d42", 0.32, 1); tint("Glass_Gray", "#050607", 0.05, 0.6); tint("Interior_light", "#16171a", 0.8, 0)
    const b = mats.Body_Color as THREE.MeshPhysicalMaterial | undefined
    if (b) {
      b.color.set('#07080a'); b.metalness = 0.92; b.roughness = 0.28
      b.clearcoat = 1; b.clearcoatRoughness = 0.04; b.envMapIntensity = 1.2
    }
    const g = mats.Projector_Glass
    if (g) { g.emissive = new THREE.Color('#e8f0ff'); g.emissiveIntensity = 0 }
    const t = mats.Turn_Signal_LED
    if (t) { t.emissive = new THREE.Color('#ff8a1f'); t.emissiveIntensity = 0 }
    const tl = mats.Taillight_Glass
    if (tl) { tl.emissive = new THREE.Color('#ff1010'); tl.emissiveIntensity = 0 }
    scene.traverse((o) => { o.frustumCulled = false })
    onReady()
  }, [mats, scene, onReady])

  useFrame(() => {
    const p = sp.current
    const on = smoothstep(p, 0.2, 0.34)
    if (mats.Projector_Glass) mats.Projector_Glass.emissiveIntensity = 7 * on
    if (mats.Turn_Signal_LED) mats.Turn_Signal_LED.emissiveIntensity = 2.5 * on
    if (mats.Taillight_Glass) mats.Taillight_Glass.emissiveIntensity = 2 * smoothstep(p, 0.5, 0.7)
    const g = group.current
    if (!g) return
    g.rotation.y = lerp(-0.18, 0.22, ease(smoothstep(p, 0.35, 0.86))) + lerp(0, 0.5, ease(smoothstep(p, 0.88, 1)))
    g.position.x = lerp(0, 12, ease(smoothstep(p, 0.88, 1)))
  })

  return (
    <group ref={group}>
      <group rotation={[0, Math.PI, 0]}><primitive object={scene} /></group>
      <Blob />
    </group>
  )
}

/** Soft baked contact shadow */
function Blob() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const x = c.getContext('2d')!
    const g = x.createRadialGradient(128, 128, 10, 128, 128, 128)
    g.addColorStop(0, 'rgba(0,0,0,.95)'); g.addColorStop(0.55, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)')
    x.fillStyle = g; x.fillRect(0, 0, 256, 256)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
      <planeGeometry args={[6.8, 3.4]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  )
}

function Lights({ sp }: { sp: MutableRefObject<number> }) {
  const scene = useThree((s) => s.scene)
  const key = useRef<THREE.SpotLight>(null)
  const target = useRef<THREE.Object3D>(null)
  const rimL = useRef<THREE.SpotLight>(null)
  const rimR = useRef<THREE.SpotLight>(null)

  useEffect(() => {
    if (key.current && target.current) key.current.target = target.current
    if (rimL.current && target.current) rimL.current.target = target.current
    if (rimR.current && target.current) rimR.current.target = target.current
  }, [])

  useFrame(() => {
    const p = sp.current
    scene.environmentIntensity = 0.03 + 1.05 * smoothstep(p, 0.4, 0.66)
    if (key.current) {
      const sweep = ease(smoothstep(p, 0.1, 0.46))
      key.current.position.set(lerp(-7.5, 7.5, sweep), 3.6, 4.2)
      key.current.intensity = 420 * smoothstep(p, 0.07, 0.15) * (1 - 0.55 * smoothstep(p, 0.42, 0.52))
    }
    const rim = 70 * smoothstep(p, 0.0, 0.07) + 90 * smoothstep(p, 0.45, 0.7)
    if (rimL.current) rimL.current.intensity = rim
    if (rimR.current) rimR.current.intensity = rim
  })

  return (
    <>
      <object3D ref={target} position={[0, 0.6, 0.8]} />
      <spotLight ref={key} angle={0.32} penumbra={1} decay={1.6} distance={26} color="#f1f5ff" position={[-7.5, 3.6, 4.2]} />
      <spotLight ref={rimL} angle={0.7} penumbra={1} decay={1.6} distance={24} color="#9db4d6" position={[-5.5, 2.6, -5.5]} />
      <spotLight ref={rimR} angle={0.7} penumbra={1} decay={1.6} distance={24} color="#c9d4e6" position={[5.5, 2.6, -5.5]} />
    </>
  )
}

function Floor({ mobile }: { mobile: boolean }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[60, 60]} />
      {mobile ? (
        <meshStandardMaterial color="#0b0c0e" metalness={0.7} roughness={0.38} />
      ) : (
        <MeshReflectorMaterial
          blur={[320, 90]} resolution={512} mixBlur={1} mixStrength={22} roughness={0.9} depthScale={1.1}
          minDepthThreshold={0.4} maxDepthThreshold={1.4} color="#08090b" metalness={0.6} mirror={0}
        />
      )}
    </mesh>
  )
}

export default function CarScene({ progress, active, mobile, onReady }: {
  progress: MutableRefObject<number>; active: boolean; mobile: boolean; onReady: () => void
}) {
  const sp = useRef(0)
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={mobile ? [1, 1.4] : [1, 1.75]}
      camera={{ fov: 30, near: 0.1, far: 60, position: [1.5, 0.55, 5.3] }}
      gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      onCreated={({ scene }) => { scene.environmentIntensity = 0.03 }}
      style={{ position: 'absolute', inset: 0 }}
      aria-label="Interactive 3D sports car"
    >
      <color attach="background" args={['#08090b']} />
      <fog attach="fog" args={['#08090b', 9, 24]} />
      <Damper progress={progress} sp={sp} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={1.4} position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[14, 5, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-7, 2, 1]} rotation={[0, Math.PI / 2, 0]} scale={[10, 2.4, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[7, 2, 1]} rotation={[0, -Math.PI / 2, 0]} scale={[10, 2.4, 1]} />
        <Lightformer form="rect" intensity={1.1} position={[0, 1.5, -8]} scale={[16, 1.6, 1]} />
      </Environment>
      <Lights sp={sp} />
      <Rig sp={sp} />
      <Floor mobile={mobile} />
      <Car sp={sp} onReady={onReady} />
    </Canvas>
  )
}

/** Smooths raw scroll progress into the value every part of the scene reads. */
function Damper({ progress, sp }: { progress: MutableRefObject<number>; sp: MutableRefObject<number> }) {
  useFrame((_, dt) => { sp.current = damp(sp.current, progress.current, 5, Math.min(dt, 0.05)) }, -1)
  return null
}
