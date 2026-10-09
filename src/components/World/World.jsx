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
    </>
  )
}
