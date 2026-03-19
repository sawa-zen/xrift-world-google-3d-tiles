import { GOOGLE_API_TOKEN } from '../../constants'
import { GoogleTilesInner } from './GoogleTilesInner'

export interface GoogleTilesProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  apiToken?: string
  lat?: number
  lon?: number
  height?: number
}

export const GoogleTiles: React.FC<GoogleTilesProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  apiToken = GOOGLE_API_TOKEN,
  lat,
  lon,
  height,
}) => {
  if (!apiToken) {
    console.warn('GoogleTiles: apiToken が設定されていません。constants.ts の GOOGLE_API_TOKEN を設定してください。')
    return null
  }

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <GoogleTilesInner apiToken={apiToken} lat={lat} lon={lon} height={height} />
    </group>
  )
}
