import { useContext, useLayoutEffect, useMemo, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Matrix4, Quaternion, Vector2, Vector3 } from 'three'
import { TilesRenderer, TilesPlugin, TilesAttributionOverlay, TilesRendererContext } from '3d-tiles-renderer/r3f'
import { GLTFExtensionsPlugin } from '3d-tiles-renderer/three/plugins'
import { WGS84_ELLIPSOID } from '3d-tiles-renderer/three'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { TilesXRCameraSync } from './TilesXRCameraSync'

export interface GoogleTilesInnerProps {
  apiToken: string
  lat?: number
  lon?: number
  height?: number
}

const DEG2RAD = Math.PI / 180

const TILES_ROOT_URL = 'https://tile.googleapis.com/v1/3dtiles/root.json'

/**
 * API トークンごとのセッションキャッシュ。
 * TilesPlugin の再レンダリングでプラグインインスタンスが再生成されても
 * セッショントークンを引き継げるようにする。
 */
const sessionCache = new Map<string, string>()

/**
 * GoogleCloudAuthPlugin の代替。
 * Module Federation 環境でセッショントークンの抽出が正しく動作しない問題を回避するため、
 * セッション管理を自前で行う。
 */
class GoogleTilesAuthPlugin {
  name = 'GOOGLE_TILES_AUTH_PLUGIN'
  apiToken: string
  sessionToken: string | null = null
  private _sessionReady: Promise<void> | null = null
  private _resolveSession: (() => void) | null = null

  constructor({ apiToken }: { apiToken: string }) {
    this.apiToken = apiToken
    // キャッシュ済みセッションがあれば即座に使用
    const cached = sessionCache.get(apiToken)
    if (cached) {
      this.sessionToken = cached
      this._sessionReady = null
    } else {
      this._sessionReady = new Promise<void>((resolve) => {
        this._resolveSession = resolve
      })
    }
  }

  init(tiles: any) {
    tiles.rootURL = TILES_ROOT_URL
    tiles.errorTarget = 6
    tiles.downloadQueue.maxJobs = 12
    tiles.parseQueue.maxJobs = 4
  }

  async fetchData(uri: string, options: RequestInit) {
    const url = new URL(uri)
    const isRootRequest = url.pathname.endsWith('/root.json')

    if (isRootRequest) {
      url.searchParams.set('key', this.apiToken)
      const res = await fetch(url.toString(), options)

      if (res.ok && !this.sessionToken) {
        const json = await res.json()
        this.sessionToken = this._extractSession(json.root)
        if (this.sessionToken) {
          sessionCache.set(this.apiToken, this.sessionToken)
        }
        this._resolveSession?.()
        this._sessionReady = null
        return json
      }

      return res
    }

    // タイルリクエスト: セッション準備完了を待つ
    if (this._sessionReady) {
      // 他のインスタンスがキャッシュに書き込んだかチェック
      const cached = sessionCache.get(this.apiToken)
      if (cached) {
        this.sessionToken = cached
        this._sessionReady = null
      } else {
        await this._sessionReady
      }
    }

    url.searchParams.set('key', this.apiToken)
    if (this.sessionToken) {
      url.searchParams.set('session', this.sessionToken)
    }

    const res = await fetch(url.toString(), options)
    if (!res.ok) {
      console.warn(`[GoogleTiles] tile request failed: ${res.status} ${url.pathname}`)
    }
    return res
  }

  private _extractSession(root: any): string | null {
    const stack = [root]
    while (stack.length > 0) {
      const tile = stack.pop()
      if (tile.content?.uri) {
        const queryStr = tile.content.uri.split('?')[1]
        if (queryStr) {
          return new URLSearchParams(queryStr).get('session')
        }
      }
      if (tile.children) {
        for (const child of tile.children) {
          stack.push(child)
        }
      }
    }
    return null
  }
}

const _debugVec2 = new Vector2()

function TilesDebugLogger() {
  const tiles = useContext(TilesRendererContext)
  const { camera, gl } = useThree()
  const lastLog = useRef(0)

  useFrame(() => {
    if (!tiles) return
    const now = Date.now()
    if (now - lastLog.current < 3000) return
    lastLog.current = now

    const t = tiles as any
    const stats = t.stats
    const cameraRes = t.cameraMap?.get(camera)
    const resolution = cameraRes ? `${cameraRes.width}x${cameraRes.height}` : 'no-camera'

    let glSize = 'unknown'
    try {
      gl.getSize(_debugVec2)
      glSize = `${_debugVec2.x}x${_debugVec2.y}`
    } catch { /* ignore */ }

    console.log(
      `[GoogleTiles]`,
      `cache=${stats.inCache}`,
      `queued=${stats.queued}`,
      `dl=${stats.downloading}`,
      `parse=${stats.parsing}`,
      `fail=${stats.failed}`,
      `| res=${resolution}`,
      `| gl=${glSize}`,
      `| errTarget=${t.errorTarget}`,
      `| cams=${t.cameras?.length ?? 0}`,
      `| root=${t.rootLoadingState}`,
    )
  })

  return null
}

function PositionAtLatLon({ lat = 35.6812, lon = 139.7671, height = 0 }: { lat?: number; lon?: number; height?: number }) {
  const tiles = useContext(TilesRendererContext)

  useLayoutEffect(() => {
    if (!tiles) return

    const mat = new Matrix4()
    WGS84_ELLIPSOID.getEastNorthUpFrame(lat * DEG2RAD, lon * DEG2RAD, height, mat)
    mat.invert()

    // ENU座標系(Z-up)をThree.js(Y-up)に変換: X軸で-90度回転
    const zUpToYUp = new Matrix4().makeRotationX(-Math.PI / 2)
    mat.premultiply(zUpToYUp)

    const pos = new Vector3()
    const quat = new Quaternion()
    const scl = new Vector3()
    mat.decompose(pos, quat, scl)

    tiles.group.position.copy(pos)
    tiles.group.quaternion.copy(quat)
    tiles.group.scale.copy(scl)
    tiles.group.updateMatrixWorld(true)
  }, [tiles, lat, lon, height])

  return null
}

export const GoogleTilesInner: React.FC<GoogleTilesInnerProps> = ({
  apiToken,
  lat,
  lon,
  height,
}) => {
  const dracoLoader = useMemo(() => {
    const loader = new DRACOLoader()
    loader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
    return loader
  }, [])

  const authArgs = useMemo((): any[] => [{ apiToken }], [apiToken])
  const gltfArgs = useMemo((): any[] => [{ dracoLoader }], [dracoLoader])

  return (
    <TilesRenderer key={apiToken}>
      <TilesPlugin plugin={GoogleTilesAuthPlugin} args={authArgs} />
      <TilesPlugin plugin={GLTFExtensionsPlugin} args={gltfArgs} />
      <PositionAtLatLon lat={lat} lon={lon} height={height} />
      <TilesXRCameraSync />
      <TilesDebugLogger />
      <TilesAttributionOverlay />
    </TilesRenderer>
  )
}

export default GoogleTilesInner
