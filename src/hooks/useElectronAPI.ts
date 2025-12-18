/**
 * React Hook für Type-Safe Electron API Zugriff
 *
 * Beispiel-Nutzung:
 *
 * ```tsx
 * const MyComponent = () => {
 *   const api = useElectronAPI()
 *
 *   const handleSave = async () => {
 *     await api.saveMission(mission)
 *   }
 *
 *   return <button onClick={handleSave}>Save</button>
 * }
 * ```
 */

import { useEffect, useState } from 'react'
import type { ElectronAPI } from '../types'

/**
 * Prüft ob die Electron API verfügbar ist
 */
export const isElectronAPI = (): boolean => {
  return typeof window !== 'undefined' && 'api' in window
}

/**
 * Hook für sicheren Zugriff auf Electron API
 *
 * @throws Error wenn API nicht verfügbar (z.B. im Browser)
 */
export const useElectronAPI = (): ElectronAPI => {
  if (!isElectronAPI()) {
    throw new Error(
      'Electron API nicht verfügbar. Läuft die App im Electron-Kontext?'
    )
  }

  return window.api
}

/**
 * Hook zum Laden von Daten mit Loading/Error State
 *
 * @example
 * ```tsx
 * const { data: missions, loading, error } = useElectronData(
 *   (api) => api.loadMissions()
 * )
 * ```
 */
export const useElectronData = <T>(
  fetcher: (api: ElectronAPI) => Promise<T>,
  deps: unknown[] = []
) => {
  const api = useElectronAPI()
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await fetcher(api)

        if (!cancelled) {
          setData(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, reload: () => fetcher(api) }
}
