import type { LatLngExpression, Map as LeafletMap } from 'leaflet'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { useShallow } from 'zustand/react/shallow'
import { TRANSIT_HUB } from '../services/mockTransitService'
import {
  selectMatchingIds,
  useTransitStore,
} from '../store/useTransitStore'
import type { Delivery } from '../types'
import { DeliveryPin, pinColorForStatus } from './DeliveryPin'

import 'leaflet/dist/leaflet.css'

const HUB_CENTER: LatLngExpression = [TRANSIT_HUB.lat, TRANSIT_HUB.lng]

/** Fixed scatter used while the first fetch is in flight */
const SKELETON_OFFSETS: Array<[number, number]> = [
  [-0.035, -0.04],
  [-0.02, 0.055],
  [0.01, -0.07],
  [0.04, 0.02],
  [-0.05, 0.01],
  [0.025, -0.03],
  [0.055, 0.06],
  [-0.015, -0.02],
]

function latLngToPanePoint(map: LeafletMap, lat: number, lng: number) {
  return map.latLngToLayerPoint([lat, lng])
}

function InvalidateSize({ revision }: { revision: number }) {
  const map = useMap()
  useEffect(() => {
    const frame = requestAnimationFrame(() => map.invalidateSize())
    return () => cancelAnimationFrame(frame)
  }, [map, revision])
  return null
}

function FitDeliveries({ deliveries }: { deliveries: Delivery[] }) {
  const map = useMap()
  const fittedKey = useRef<string | null>(null)

  useEffect(() => {
    if (deliveries.length === 0) return
    // Only fit when the delivery set changes (initial load / retry), not live ticks
    const key = deliveries
      .map((d) => d.id)
      .sort()
      .join(',')
    if (fittedKey.current === key) return
    fittedKey.current = key
    const bounds = deliveries.map((d) => [d.lat, d.lng] as [number, number])
    // Bias padding downward so pins sit above the collapsed sheet
    map.fitBounds(bounds, {
      paddingTopLeft: [36, 48],
      paddingBottomRight: [36, 180],
      maxZoom: 13,
      animate: false,
    })
  }, [map, deliveries])

  return null
}

function FocusSelected({ selectedId }: { selectedId: string | null }) {
  const map = useMap()
  const deliveries = useTransitStore((s) => s.deliveries)

  useEffect(() => {
    if (!selectedId) return
    const delivery = deliveries.find((d) => d.id === selectedId)
    if (!delivery) return
    map.flyTo([delivery.lat, delivery.lng], Math.max(map.getZoom(), 13), {
      duration: 0.55,
    })
    // Only recenter when selection changes — not on every live tick
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliveries omitted on purpose
  }, [map, selectedId])

  return null
}

function MapPinOverlay({
  deliveries,
  loading,
  selectedId,
}: {
  deliveries: Delivery[]
  loading: boolean
  selectedId: string | null
}) {
  const map = useMap()
  const pingingIds = useTransitStore((s) => s.pingingIds)
  const clearPing = useTransitStore((s) => s.clearPing)
  const matchingIds = useTransitStore(useShallow(selectMatchingIds))
  const matchingIdSet = useMemo(() => new Set(matchingIds), [matchingIds])
  const [, setTick] = useState(0)

  useEffect(() => {
    const redraw = () => setTick((n) => n + 1)
    map.on('move', redraw)
    map.on('zoom', redraw)
    map.on('zoomend', redraw)
    map.on('moveend', redraw)
    map.on('viewreset', redraw)
    return () => {
      map.off('move', redraw)
      map.off('zoom', redraw)
      map.off('zoomend', redraw)
      map.off('moveend', redraw)
      map.off('viewreset', redraw)
    }
  }, [map])

  const handlePingComplete = useCallback(
    (id: string) => {
      clearPing(id)
    },
    [clearPing],
  )

  const pane = map.getPanes().overlayPane
  if (!pane) return null

  const nodes = loading
    ? SKELETON_OFFSETS.map(([dLat, dLng], index) => {
        const point = latLngToPanePoint(
          map,
          TRANSIT_HUB.lat + dLat,
          TRANSIT_HUB.lng + dLng,
        )
        return (
          <div
            key={`skeleton-${index}`}
            className="pointer-events-none absolute"
            style={{
              left: point.x,
              top: point.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <DeliveryPin color="#64748b" skeleton />
          </div>
        )
      })
    : deliveries.map((delivery) => {
        const point = latLngToPanePoint(map, delivery.lat, delivery.lng)
        const pinging = pingingIds.includes(delivery.id)
        const selected = selectedId === delivery.id
        const dimmed = !matchingIdSet.has(delivery.id)
        return (
          <div
            key={delivery.id}
            className="pointer-events-none absolute"
            style={{
              left: point.x,
              top: point.y,
              transform: 'translate(-50%, -50%)',
              zIndex: selected ? 2 : dimmed ? 0 : 1,
            }}
          >
            <DeliveryPin
              color={pinColorForStatus(delivery.status)}
              pinging={pinging}
              selected={selected}
              dimmed={dimmed}
              onPingComplete={() => handlePingComplete(delivery.id)}
            />
          </div>
        )
      })

  return createPortal(<>{nodes}</>, pane)
}

type TransitMapProps = {
  deliveries: Delivery[]
  loading: boolean
  selectedId: string | null
  /** Bumps when sheet snaps so Leaflet recalculates size */
  layoutRevision?: number
}

export function TransitMap({
  deliveries,
  loading,
  selectedId,
  layoutRevision = 0,
}: TransitMapProps) {
  return (
    <div className="transit-map relative h-full w-full overflow-hidden bg-bg">
      <MapContainer
        center={HUB_CENTER}
        zoom={11}
        className="h-full w-full bg-bg"
        zoomControl={false}
        attributionControl={false}
        dragging={!loading}
        scrollWheelZoom={false}
        doubleClickZoom={!loading}
        touchZoom={!loading}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />
        <InvalidateSize revision={layoutRevision} />
        {!loading && deliveries.length > 0 ? (
          <FitDeliveries deliveries={deliveries} />
        ) : null}
        {!loading ? <FocusSelected selectedId={selectedId} /> : null}
        <MapPinOverlay
          deliveries={deliveries}
          loading={loading}
          selectedId={selectedId}
        />
      </MapContainer>
    </div>
  )
}
