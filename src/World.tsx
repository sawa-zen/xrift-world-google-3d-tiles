import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { SpawnPoint, Skybox } from '@xrift/world-components'
import { GoogleTiles } from './components/GoogleTiles'
import { TILES_LAT, TILES_LON, FLOOR_HEIGHT } from './constants'

function FollowCameraSkybox() {
  const ref = useRef<Group>(null)
  useFrame(({ camera }) => {
    if (ref.current) {
      ref.current.position.x = camera.position.x
      ref.current.position.z = camera.position.z
    }
  })
  return (
    <group ref={ref}>
      <Skybox />
    </group>
  )
}

export interface WorldProps {
  position?: [number, number, number]
  scale?: number
}

export const World: React.FC<WorldProps> = ({ position = [0, 0, 0], scale = 1 }) => {
  return (
    <group position={position} scale={scale}>
      <SpawnPoint position={[-20, 111, 20]} yaw={180} />
      <FollowCameraSkybox />
      <ambientLight intensity={1} />
      <RigidBody type="fixed" position={[0, FLOOR_HEIGHT, 0]}>
        <CuboidCollider args={[10000, 0.01, 10000]} />
      </RigidBody>
      <GoogleTiles lat={TILES_LAT} lon={TILES_LON} />
    </group>
  )
}
