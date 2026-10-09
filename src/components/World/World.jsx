import { ContactShadows } from '@react-three/drei'
import { Buildings } from './Buildings'
import { Collectibles } from './Collectibles'
import { Landmarks } from './Landmarks'
import { Obstacles } from './Obstacles'
import { Road } from './Road'
import { SkyDome } from './SkyDome'
import { Streetlights } from './Streetlights'

export function World() {
  return (
    <>
      <SkyDome />
      <Landmarks />
      <Road />
      <Buildings />
      <Streetlights />
      <Obstacles />
      <Collectibles />

      {/*
        Una sola sombra de contacto para toda la zona de juego (jugador, vallas, esferas).
        - y = 0.02: el asfalto (y = 0) y las calcomanías de bache quedan fuera de su cámara.
        - 8.2 m de ancho: cubre los 3 carriles sin capturar los bordillos ni los postes.
        - Halos y conos de luz están en NO_SHADOW_LAYER y no proyectan sombra.
      */}
      <ContactShadows
        position={[0, 0.02, -7]}
        scale={[8.2, 28]}
        resolution={512}
        blur={2.4}
        far={2.6}
        opacity={0.75}
        color="#1c0f1f"
        frames={Infinity}
      />
    </>
  )
}
