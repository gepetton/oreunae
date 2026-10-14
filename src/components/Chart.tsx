import { useId, useLayoutEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { formatTime, priceDirection } from '../lib/market-data'
import { assetChange, assetSeries, assetUnit, assetValue } from '../lib/detail-assets'
import type { AssetPeriod, DetailAsset } from '../lib/detail-assets'
import { usePreferences } from '../lib/preferences-context'

export function Sparkline({
  values,
  direction = 'flat',
  step = false,
  area = false,
  baseline,
}: {
  values: number[]
  direction?: 'up' | 'down' | 'flat'
  step?: boolean
  area?: boolean
  baseline?: number
}) {
  const gradient = useId()
  const min = Math.min(...values, baseline ?? Infinity),
    range = Math.max(...values, baseline ?? -Infinity) - min || 1
  const points = values.map((v, i) => [
    2 + (i / (values.length - 1)) * 108,
    37 - ((v - min) / range) * 29,
  ])
  const path = points
    .map(([x, y], i) =>
      i === 0 ? `M${x},${y}` : step ? `H${x}V${y}` : `L${x},${y}`,
    )
    .join(' ')
  return (
    <svg
      className={`sparkline market-${direction} ${area ? 'sparkline-area' : ''}`}
      viewBox="0 0 112 42"
      preserveAspectRatio={area ? 'none' : undefined}
      aria-hidden="true"
    >
      {area && (
        <>
          <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity=".16" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${path} L110,42 L2,42 Z`} fill={`url(#${gradient})`} />
          {baseline !== undefined && (
            <line x1="2" x2="110" y1={37 - ((baseline - min) / range) * 29} y2={37 - ((baseline - min) / range) * 29} className="stroke-muted/35" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
          )}
        </>
      )}
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={area ? '2' : '1.6'}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {area && <path d={`M${points.at(-1)![0]},${points.at(-1)![1]}l0,0`} stroke="currentColor" strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />}
    </svg>
  )
}
export interface ChartInspection {
  value: string
  time?: string
  index: number
  total: number
}

export function PriceChart({
  asset,
  period,
  onInspect,
}: {
  asset: DetailAsset
  period: AssetPeriod
  onInspect?: (point: ChartInspection | null) => void
}) {
  const { locale, timezone, t } = usePreferences()
  const points = assetSeries(asset, period)
  const direction = asset.macro && asset.changeUnit !== 'bp' ? 'flat' : priceDirection(asset.market && (period === '24H' || period === '1D') ? assetChange(asset) : Number(points.at(-1)!.value) - Number(points[0].value))
  const currency = asset.currency
  const unit = assetUnit(asset, locale)
  const element = useRef<HTMLDivElement>(null)
  const pointerActive = useRef(false)
  const [width, setWidth] = useState(680)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const gradient = useId().replaceAll(':', '')
  useLayoutEffect(() => {
    const node = element.current!
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  const height = width < 460 ? 244 : 286
  const left = 2,
    right = Number(asset.price) * Number(asset.rate) >= 10000 || asset.decimals === 0 ? 58 : 40,
    top = 12,
    bottom = 25
  const plotWidth = Math.max(1, width - left - right),
    plotHeight = height - top - bottom
  const values = points.map(point => Number(point.value))
  const min = Math.min(...values),
    max = Math.max(...values),
    pad = (max - min || 1) * 0.12
  const low = min - pad,
    high = max + pad
  const timed = points[0].time !== undefined
  const start = timed ? Date.parse(points[0].time!) : 0,
    end = timed ? Date.parse(points.at(-1)!.time!) : points.length - 1
  const x = (index: number) =>
    left + (((timed ? Date.parse(points[index].time!) : index) - start) / (end - start || 1)) * plotWidth
  const y = (value: string | number) =>
    top + ((high - Number(value)) / (high - low)) * plotHeight
  const path = points
    .map(
      (point, i) =>
        `${i ? asset.symbol === 'BOK' ? 'H' : 'L' : 'M'}${x(i).toFixed(2)}${i && asset.symbol === 'BOK' ? 'V' : ','}${y(point.value).toFixed(2)}`,
    )
    .join(' ')
  const index =
    activeIndex === null
      ? points.length - 1
      : Math.min(activeIndex, points.length - 1)
  const point = points[index],
    activeX = x(index),
    activeY = y(point.value)
  const endPoint = points.at(-1)!
  const currentY = y(endPoint.value)
  const valueLabel = assetValue(asset, point.value, locale)
  const valueLabelWidth = Math.max(64, valueLabel.length * 7 + 13)
  const pointLabel = point.time ? `${t('sampleData')} · ${formatTime(point.time, locale, timezone, true)}` : `${t('samplePoint')} ${index + 1}/${points.length}`
  const yTicks = 3
  const dateLabel = (time: number, tick: number) => {
    if (!timed) return String(Math.round(time) + 1)
    const intraday = period === '1D' || period === '24H' || period === '1H'
    const annual = period === '1Y' || period === 'ALL'
    if (period === '1M' || intraday && (tick === 0 || tick === 4) || annual && (tick === 0 || tick === 4)) {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: '2-digit', month: 'numeric', day: 'numeric' }).formatToParts(new Date(time))
      const part = (type: string) => parts.find(item => item.type === type)!.value
      return annual ? `${part('year')}/${part('month')}` : `${part('month')}/${part('day')}`
    }
    const options: Intl.DateTimeFormatOptions = intraday
      ? { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
      : period === '1W' ? { weekday: 'short' } : { month: 'short' }
    return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-GB', { timeZone: timezone, ...options }).format(new Date(time))
  }
  function inspectPointer(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const pointerX = Math.max(left, Math.min(width - right, event.clientX - rect.left))
    let nearest = 0
    for (let i = 1; i < points.length; i++) if (Math.abs(x(i) - pointerX) < Math.abs(x(nearest) - pointerX)) nearest = i
    selectPoint(nearest)
  }
  function selectPoint(next: number | null) {
    setActiveIndex(next)
    onInspect?.(next === null ? null : {
      value: points[next].value,
      time: points[next].time,
      index: next,
      total: points.length,
    })
  }
  return (
    <div
      className={`price-chart market-${direction}`}
      data-period={period}
      data-mode="line"
      data-point-count={points.length}
      data-start={points[0].time}
      data-end={endPoint.time}
      data-currency={currency}
    >
      <div
        ref={element}
        className="chart-interactive w-full touch-pan-y cursor-crosshair rounded"
        role="slider"
        tabIndex={0}
        aria-label={`${asset.name[locale]} · ${asset.symbol} · ${t('chartHistory')} · ${period === 'sample' ? t('sampleRange') : period} · ${unit}`}
        aria-valuemin={0}
        aria-valuemax={points.length - 1}
        aria-valuenow={index}
        aria-valuetext={`${valueLabel} ${unit} · ${pointLabel}`}
        aria-describedby="chart-instructions"
        onPointerMove={event => { if (pointerActive.current) inspectPointer(event) }}
        onPointerDown={event => {
          pointerActive.current = true
          event.currentTarget.setPointerCapture(event.pointerId)
          inspectPointer(event)
        }}
        onPointerUp={() => { pointerActive.current = false; selectPoint(null) }}
        onPointerCancel={() => { pointerActive.current = false; selectPoint(null) }}
        onPointerLeave={() => { if (!pointerActive.current) selectPoint(null) }}
        onBlur={() => selectPoint(null)}
        onFocus={() => { if (activeIndex === null) selectPoint(points.length - 1) }}
        onKeyDown={(event) => {
          const movement = {
            ArrowLeft: -1,
            ArrowRight: 1,
            ArrowDown: -1,
            ArrowUp: 1,
          }[event.key]
          if (
            movement !== undefined ||
            event.key === 'Home' ||
            event.key === 'End'
          ) {
            event.preventDefault()
            selectPoint(
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? points.length - 1
                  : Math.max(0, Math.min(points.length - 1, index + movement!)),
            )
          }
        }}
      >
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity=".06" />
              <stop
                offset="100%"
                stopColor="currentColor"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          {Array.from({ length: yTicks }, (_, i) => {
            const v = min + ((max - min) * i) / (yTicks - 1)
            return (
              <g key={i}>
                <line
                  x1={left}
                  x2={width - right}
                  y1={y(v)}
                  y2={y(v)}
                  className="chart-grid"
                />
                <text x={width - right + 5} y={y(v) + 3} className="chart-axis-label">{(v * Number(asset.rate)).toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US', { notation: Math.abs(v * Number(asset.rate)) >= 10000 ? 'compact' : 'standard', maximumFractionDigits: asset.decimals === 0 ? 0 : 2 })}</text>
              </g>
            )
          })}
          <path d={`${path} L${x(points.length - 1)},${top + plotHeight} L${left},${top + plotHeight}Z`} fill={`url(#${gradient})`} />
          <path d={path} className="chart-line" fill="none" strokeWidth="1.85" strokeLinejoin="round" strokeLinecap="round" />
          <line x1={left} x2={width - right} y1={currentY} y2={currentY} className="chart-current-line" />
          <g transform={`translate(${width - valueLabelWidth},${Math.max(top, Math.min(top + plotHeight - 23, currentY - 11))})`}>
            <rect width={valueLabelWidth} height="22" rx="6" className="chart-current-bg" />
            <text x={valueLabelWidth / 2} y="15" textAnchor="middle" className="chart-current-value">{assetValue(asset, endPoint.value, locale)}</text>
          </g>
          {Array.from({ length: 5 }, (_, i) => {
            const time = start + ((end - start) * i) / 4
            return (
              <text
                key={i}
                x={left + (plotWidth * i) / 4}
                y={height - 6}
                textAnchor={i === 0 ? 'start' : i === 4 ? 'end' : 'middle'}
                className="chart-label fill-muted font-sans tabular-nums text-[10px]"
              >
                {dateLabel(time, i)}
              </text>
            )
          })}
          {activeIndex !== null && (
            <line
              x1={activeX}
              x2={activeX}
              y1={top}
              y2={height - bottom}
              className="chart-crosshair"
            />
          )}
          <circle cx={activeX} cy={activeY} r={activeIndex === null ? 3 : 4} className="chart-dot" />
          {activeIndex !== null && <g transform={`translate(${Math.max(left, Math.min(width - right - 132, activeX - 66))},${top + 6})`} className="chart-point-tooltip">
            <rect width="132" height="43" rx="9" />
            <text x="9" y="16">{point.time ? dateLabel(Date.parse(point.time), 2) : `${index + 1}/${points.length}`}</text>
            <text x="9" y="34">{valueLabel} {unit}</text>
          </g>}
        </svg>
      </div>
      <div className="chart-caption flex justify-end text-muted text-[10px] px-0.5 min-h-4"><span className="mono">{unit}</span></div>
      <span className="sr-only" id="chart-instructions">
        {t('chartInstructions')}
      </span>
    </div>
  )
}
