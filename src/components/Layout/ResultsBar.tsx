/**
 * ResultsBar Component - Compact Fire Mission Display
 *
 * Features:
 * - Compact horizontal layout
 * - Lucide icons for tactical feel
 * - Monospace typography for values
 * - Color-coded status indicators
 * - Maximum height: 60-80px
 */

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Circle,
  Compass,
  ArrowUp,
  Clock,
  Ruler,
  CheckCircle,
  AlertCircle,
  Radio,
  Wind
} from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { getMaximumRange, getMinimumRange } from '../../lib/ballistics/range'

export function ResultsBar() {
  const { t } = useTranslation()
  const fireSolution = useAppStore((state) => state.fireSolution)
  const mortarConfig = useAppStore((state) => state.mortarConfig)
  const windData = useAppStore((state) => state.windData)
  const isCalculating = useAppStore((state) => state.isCalculating)
  const error = useAppStore((state) => state.error)

  // Calculate charge status - use ringCount (actual used ring), not recommendedCharge
  const chargeStatus = useMemo(() => {
    if (!fireSolution) return null

    // ringCount is the actual ring being used (either manual or auto-selected)
    const actualCharge = fireSolution.ringCount
    // recommendedCharge is the optimal ring for this distance
    const isOptimal = fireSolution.recommendedCharge === undefined ||
                      fireSolution.ringCount === fireSolution.recommendedCharge

    return {
      charge: actualCharge,
      isValid: actualCharge !== undefined && actualCharge >= 0 && actualCharge <= 4,
      isOptimal,
      inRange: fireSolution.inRange
    }
  }, [fireSolution])

  // Calculate range info for warnings
  const rangeInfo = useMemo(() => {
    if (!fireSolution) return null

    const maxRange = getMaximumRange(mortarConfig.type, mortarConfig.ammo)
    const minRange = getMinimumRange(mortarConfig.type, mortarConfig.ammo)

    return { maxRange, minRange }
  }, [mortarConfig])

  // Determine overall status
  const status = useMemo(() => {
    if (!fireSolution) return 'waiting'
    if (!fireSolution.inRange) return 'outOfRange'
    if (chargeStatus && !chargeStatus.isValid) return 'suboptimal'
    if (chargeStatus && !chargeStatus.isOptimal) return 'suboptimal'
    return 'ready'
  }, [fireSolution, chargeStatus])

  // Format numbers with military padding
  const formatMil = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '----'
    return value.toFixed(0).padStart(4, '0')
  }

  const formatTime = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '--.-'
    return value.toFixed(1)
  }

  const formatRange = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '----'
    return value.toFixed(0)
  }

  // Status colors and icons
  const getStatusIcon = () => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-accent-green" />
      case 'outOfRange':
        return <AlertCircle className="w-4 h-4 text-accent-red" />
      case 'suboptimal':
        return <AlertCircle className="w-4 h-4 text-accent-yellow" />
      default:
        return <Radio className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'ready':
        return t('results.ready', 'READY')
      case 'outOfRange':
        return t('results.outOfRange')
      case 'suboptimal':
        return t('results.suboptimal', 'SUBOPTIMAL')
      default:
        return t('results.awaiting', 'AWAITING')
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'ready':
        return 'text-accent-green border-accent-green'
      case 'outOfRange':
        return 'text-accent-red border-accent-red'
      case 'suboptimal':
        return 'text-accent-yellow border-accent-yellow'
      default:
        return 'text-muted-foreground border-border'
    }
  }

  return (
    <div className="w-full border-t-2 border-border bg-bg-secondary backdrop-blur-sm">
      {/* Out of Range Warning - Compact */}
      {status === 'outOfRange' && fireSolution && rangeInfo && (
        <div className="px-4 py-1 bg-accent-red/10 border-b border-accent-red/30">
          <div className="flex items-center justify-center gap-3 text-xs font-mono text-accent-red">
            <AlertCircle className="w-3 h-3" />
            <span className="font-bold">
              {fireSolution.distance > rangeInfo.maxRange ? t('results.targetTooFar') : t('results.targetTooClose')}
            </span>
            <span className="opacity-80">
              {t('results.tgt')}: {fireSolution.distance}m | {fireSolution.distance > rangeInfo.maxRange ? `${t('results.max')}: ${rangeInfo.maxRange}` : `${t('results.min')}: ${rangeInfo.minRange}`}m
            </span>
          </div>
        </div>
      )}

      {/* Main Fire Mission - Single Row */}
      <div className="flex items-center justify-between px-4 py-3 gap-4">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 min-w-[100px]">
          {getStatusIcon()}
          <span className={`font-mono text-xs font-bold uppercase ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {/* Fire Solution Values */}
        <div className="flex items-center gap-6 flex-1 justify-center">
          {/* Charge */}
          <div className="flex items-center gap-2">
            <Circle className={`w-4 h-4 ${chargeStatus?.isValid && status === 'ready' ? 'text-accent-blue' : 'text-muted-foreground'}`} />
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-text-secondary uppercase">RNG</span>
              <span className={`font-mono text-lg font-bold ${
                chargeStatus?.isValid && status === 'ready' ? 'text-accent-blue' : 'text-muted-foreground'
              }`}>
                {isCalculating ? '-' : chargeStatus?.charge ?? '-'}
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-border"></div>

          {/* Direction */}
          <div className="flex items-center gap-2">
            <Compass className={`w-4 h-4 ${status === 'ready' ? 'text-accent-blue' : 'text-muted-foreground'}`} />
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-text-secondary uppercase">DIR:</span>
              <span className={`font-mono text-xl font-bold ${
                status === 'ready' ? 'text-accent-blue' : 'text-muted-foreground'
              }`}>
                {isCalculating ? '----' : formatMil(
                  windData && fireSolution?.azimuthWithWind !== undefined
                    ? fireSolution.azimuthWithWind
                    : fireSolution?.azimuthMil
                )}
              </span>
              <span className="text-xs text-muted-foreground">MIL</span>
              {windData && fireSolution?.windCorrection && (
                <span className={`text-xs font-mono ml-1 ${
                  fireSolution.windCorrection.azimuthCorrection > 0 ? 'text-accent-yellow' : 'text-accent-green'
                }`}>
                  ({fireSolution.windCorrection.azimuthCorrection > 0 ? '+' : ''}{fireSolution.windCorrection.azimuthCorrection.toFixed(1)})
                </span>
              )}
            </div>
          </div>

          <div className="h-8 w-px bg-border"></div>

          {/* Elevation */}
          <div className="flex items-center gap-2">
            <ArrowUp className={`w-4 h-4 ${status === 'ready' ? 'text-accent-green' : 'text-muted-foreground'}`} />
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-text-secondary uppercase">ELEV:</span>
              <span className={`font-mono text-xl font-bold ${
                status === 'ready' ? 'text-accent-green' : 'text-muted-foreground'
              }`}>
                {isCalculating ? '----' : formatMil(
                  windData && fireSolution?.elevationWithWind !== undefined
                    ? fireSolution.elevationWithWind
                    : fireSolution?.elevationAdj
                )}
              </span>
              <span className="text-xs text-muted-foreground">MIL</span>
            </div>
          </div>

          <div className="h-8 w-px bg-border"></div>

          {/* Range */}
          <div className="flex items-center gap-2">
            <Ruler className={`w-4 h-4 ${status === 'ready' ? 'text-text-primary' : 'text-muted-foreground'}`} />
            <div className="flex items-baseline gap-1">
              <span className={`font-mono text-base font-semibold ${
                status === 'ready' ? 'text-text-primary' : 'text-muted-foreground'
              }`}>
                {formatRange(fireSolution?.distance)}m
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-border"></div>

          {/* Time of Flight */}
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${status === 'ready' ? 'text-accent-yellow' : 'text-muted-foreground'}`} />
            <div className="flex items-baseline gap-1">
              <span className={`font-mono text-base font-semibold ${
                status === 'ready' ? 'text-accent-yellow' : 'text-muted-foreground'
              }`}>
                {formatTime(fireSolution?.flightTime)}s
              </span>
            </div>
          </div>
        </div>

        {/* Wind Indicator & System Info */}
        <div className="flex items-center gap-4 min-w-[180px] justify-end">
          {windData && windData.speed > 0 && (
            <div className="flex items-center gap-1">
              <Wind className="w-3 h-3 text-accent-blue" />
              <span className="font-mono text-xs text-accent-blue font-medium">
                {windData.speed.toFixed(1)}m/s
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-secondary uppercase tracking-wider">{t('results.system')}:</span>
            <span className="font-mono text-xs text-text-primary font-medium">
              {mortarConfig.type === 'US' ? 'M252' : 'M82'}
            </span>
          </div>
        </div>
      </div>

      {/* Error Display - Compact */}
      {error && !isCalculating && status === 'waiting' && (
        <div className="px-4 pb-2 text-center">
          <span className="font-mono text-xs text-accent-yellow">{error}</span>
        </div>
      )}
    </div>
  )
}
