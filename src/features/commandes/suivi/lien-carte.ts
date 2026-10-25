/** Lien OpenStreetMap vers le point de livraison choisi sur la carte. */
export function lienCarte(p: { latitude: number; longitude: number }) {
  const lat = p.latitude.toFixed(6);
  const lng = p.longitude.toFixed(6);
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;
}
