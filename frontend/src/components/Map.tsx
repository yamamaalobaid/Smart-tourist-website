import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// Try to support both Google Maps (if key provided) and Leaflet (fallback)
const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

type MarkerItem = { lat: number; lng: number; title?: string; id?: number };

interface MapProps {
  latitude?: number;
  longitude?: number;
  markers?: MarkerItem[];
  zoom?: number;
  height?: string;
}

// Lazy-load Leaflet components to avoid bundler issues when Google Maps used
async function loadLeafletHelpers() {
  const L = await import('leaflet');
  const comps = await import('react-leaflet');
  // Fix default icon paths
  try {
    delete (L.Icon.Default as any).prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: (await import('leaflet/dist/images/marker-icon-2x.png')).default,
      iconUrl: (await import('leaflet/dist/images/marker-icon.png')).default,
      shadowUrl: (await import('leaflet/dist/images/marker-shadow.png')).default,
    });
  } catch (e) {
    // ignore in some bundlers
  }
  return { L, ...comps } as any;
}

export default function Map({ latitude, longitude, markers = [], zoom = 13, height = '300px' }: MapProps) {
  const center: [number, number] = latitude && longitude ? [latitude, longitude] : markers.length > 0 ? [markers[0].lat, markers[0].lng] : [33.5138, 36.2765];

  // If Google Maps key is provided, render Google Map (uses @react-google-maps/api)
  if (googleApiKey) {
    // dynamic import to keep startup light
    const [GoogleMapComp, setGoogleMapComp] = useState<any>(null);

    useEffect(() => {
      let mounted = true;
      (async () => {
        const mod = await import('@react-google-maps/api');
        if (!mounted) return;
        setGoogleMapComp(mod);
      })();
      return () => { mounted = false; };
    }, []);

    if (!GoogleMapComp) return <div style={{ height }} />;

    const { LoadScript, GoogleMap, Marker } = GoogleMapComp;

    return (
      <div style={{ height }}>
        <LoadScript googleMapsApiKey={googleApiKey}>
          <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={{ lat: center[0], lng: center[1] }} zoom={zoom}>
            {latitude && longitude && <Marker position={{ lat: latitude, lng: longitude }} />}
            {markers.map((m) => (
              <Marker key={m.id || `${m.lat}-${m.lng}`} position={{ lat: m.lat, lng: m.lng }} />
            ))}
          </GoogleMap>
        </LoadScript>
      </div>
    );
  }

  // Fallback to Leaflet
  const [leaflet, setLeaflet] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    loadLeafletHelpers().then((helpers) => {
      if (!mounted) return;
      setLeaflet(helpers);
    });
    return () => { mounted = false; };
  }, []);

  if (!leaflet) return <div style={{ height }} />;

  const { MapContainer, TileLayer, Marker, Popup, useMap } = leaflet;

  function Recenter({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    // smooth pan to new center
    map.setView([lat, lng], map.getZoom(), { animate: true });
    return null;
  }

  return (
    <div style={{ height }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {latitude && longitude && <Marker position={[latitude, longitude]} />}
        {markers.map((m) => (
          <Marker key={m.id || `${m.lat}-${m.lng}`} position={[m.lat, m.lng]}>
            <Popup>{m.title}</Popup>
          </Marker>
        ))}

        {latitude && longitude && <Recenter lat={latitude} lng={longitude} />}
      </MapContainer>
    </div>
  );
}
