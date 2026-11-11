"use client";
/**
 * Carte OpenStreetMap (Leaflet) : un marqueur déplaçable ; un clic sur la carte le déplace aussi.
 * Chargée uniquement côté client (voir map-address-form.tsx → next/dynamic, ssr: false).
 */
import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type Position = { latitude: number; longitude: number };

// Marqueur en SVG (couleur de la marque) : aucune image externe à charger.
const ICONE = L.divIcon({
  className: "",
  html: `<svg width="34" height="44" viewBox="0 0 34 44" aria-hidden="true"><path d="M17 43s15-14.1 15-26A15 15 0 0 0 2 17c0 11.9 15 26 15 26Z" fill="#B8701F" stroke="#FFF6E6" stroke-width="2.5"/><circle cx="17" cy="17" r="5.5" fill="#FFF6E6"/></svg>`,
  iconSize: [34, 44],
  iconAnchor: [17, 43],
});

function SuiviPosition({ position }: { position: Position }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([position.latitude, position.longitude], Math.max(map.getZoom(), 16), { duration: 0.6 });
  }, [map, position.latitude, position.longitude]);
  return null;
}

function ClicCarte({ onPosition }: { onPosition: (p: Position) => void }) {
  useMapEvents({ click: (e) => onPosition({ latitude: e.latlng.lat, longitude: e.latlng.lng }) });
  return null;
}

export default function MapPicker({ position, onPosition }: { position: Position; onPosition: (p: Position) => void }) {
  const handlers = useMemo(
    () => ({
      dragend: (e: L.LeafletEvent) => {
        const { lat, lng } = (e.target as L.Marker).getLatLng();
        onPosition({ latitude: lat, longitude: lng });
      },
    }),
    [onPosition],
  );
  return (
    <MapContainer center={[position.latitude, position.longitude]} zoom={16} scrollWheelZoom className="size-full" attributionControl>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <Marker position={[position.latitude, position.longitude]} icon={ICONE} draggable eventHandlers={handlers} keyboard title="Point de livraison (déplacez-le)" />
      <SuiviPosition position={position} />
      <ClicCarte onPosition={onPosition} />
    </MapContainer>
  );
}
