import { useContext, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Camera } from 'three'
import { TilesRendererContext } from '3d-tiles-renderer/r3f'

/**
 * VR モード時に ArrayCamera の子カメラ（左右目）を
 * TilesRenderer に登録し、XR フレームバッファの解像度で LOD を計算させる。
 *
 * 非 VR 時は何もしない（TilesRenderer.jsx のデフォルト処理に任せる）。
 */
export function TilesXRCameraSync() {
  const tiles = useContext(TilesRendererContext)
  const { gl } = useThree()
  const registeredCameras = useRef<Camera[]>([])

  useFrame(() => {
    if (!tiles) return
    const t = tiles as any

    if (gl.xr.isPresenting) {
      const xrCamera = gl.xr.getCamera()

      // ArrayCamera の子カメラ（左右目）を取得
      if (xrCamera.isArrayCamera && xrCamera.cameras.length > 0) {
        const eyeCameras = xrCamera.cameras as Camera[]

        // 子カメラを登録（未登録の場合のみ）
        for (const eye of eyeCameras) {
          if (!registeredCameras.current.includes(eye)) {
            t.setCamera(eye)
            registeredCameras.current.push(eye)
          }
        }

        // XR フレームバッファの解像度を取得して設定
        const session = gl.xr.getSession()
        const baseLayer = session?.renderState.baseLayer
        if (baseLayer) {
          const w = baseLayer.framebufferWidth
          const h = baseLayer.framebufferHeight
          // 片眼分の幅（フレームバッファは左右並び）
          const eyeWidth = Math.floor(w / eyeCameras.length)
          for (const eye of eyeCameras) {
            t.setResolution(eye, eyeWidth, h)
          }
        }
      }
    } else {
      // VR 終了: 登録した子カメラを削除
      if (registeredCameras.current.length > 0) {
        for (const cam of registeredCameras.current) {
          t.deleteCamera(cam)
        }
        registeredCameras.current = []
      }
    }
  })

  return null
}
