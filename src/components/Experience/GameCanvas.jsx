import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { ACESFilmicToneMapping } from 'three'
import { WORLD } from '../../config/gameConfig'
import { useGameStore } from '../../store/useGameStore'
import { Player } from '../Player/Player'
import { NO_SHADOW_LAYER } from '../../utils/instancing'
import { World } from '../World/World'
import { CameraRig } from './CameraRig'
import { Effects } from './Effects'
import { GameLoop } from './GameLoop'
import { Lighting } from './Lighting'

const DPR = { high: [1, 2], medium: [1, 1.5] }

// Sin shadow map direccional: las sombras de la zona de juego las da ContactShadows (ver World).
export function GameCanvas() {
  const quality = useGameStore((s) => s.quality)
  const degradeQuality = useGameStore((s) => s.degradeQuality)

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={DPR[quality]}
        camera={{ fov: 58, near: 0.1, far: 230, position: [0, 3.4, 6.5] }}
        gl={{
          antialias: false,
          stencil: false,
          powerPreference: 'high-performance',
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.18,
        }}
        onCreated={({ camera }) => camera.layers.enable(NO_SHADOW_LAYER)}
      >
        <fogExp2 attach="fog" args={[WORLD.fogColor, WORLD.fogDensity]} />
        <PerformanceMonitor onDecline={degradeQuality} flipflops={3} />

        <GameLoop />
        <CameraRig />

        <Suspense fallback={null}>
          <Lighting />
          <World />
          <Player />
        </Suspense>

        <Effects quality={quality} />
      </Canvas>
    </div>
  )
}
