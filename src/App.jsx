import { Loader } from '@react-three/drei'
import { GameCanvas } from './components/Experience/GameCanvas'
import { UIOverlay } from './components/UI/UIOverlay'

export default function App() {
  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <GameCanvas />
      <UIOverlay />
      <Loader />
    </div>
  )
}
