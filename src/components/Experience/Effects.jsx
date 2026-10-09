import { Bloom, EffectComposer, N8AO, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

// El composer renderiza a texturas lineales, por eso el tone mapping va como efecto final.
// Bloom y viñeta se mantienen siempre; en móvil (medium) solo cambian MSAA y AO.
export function Effects({ quality }) {
  if (quality === 'medium') {
    return (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={1} intensity={0.7} />
        <Vignette offset={0.3} darkness={0.35} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    )
  }

  return (
    <EffectComposer multisampling={4}>
      <N8AO halfRes quality="performance" aoRadius={1.4} intensity={2.2} distanceFalloff={1} />
      <Bloom mipmapBlur luminanceThreshold={1} intensity={0.7} />
      <Vignette offset={0.3} darkness={0.35} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}
