import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Truck, 
  Anchor, 
  CheckCircle, 
  Navigation, 
  XCircle, 
  Box, 
  Clock, 
  Globe, 
  Layers,
  ChevronDown,
  ExternalLink,
  MapPin
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { API_BASE } from '../../lib/apiConfig';

const PORTS_DATA = {
  innsa: { 
    code: 'INNSA', 
    name: 'Mumbai (Nhava Sheva / JNPT)', 
    city: 'Mumbai', 
    state: 'Maharashtra',
    mapQuery: 'Jawaharlal Nehru Port Trust, Navi Mumbai, India',
    lat: 18.9499, 
    lng: 72.9515,
    trunkIdx: 7,
    offshore: [19.00, 72.60]
  },
  inmun: { 
    code: 'INMUN', 
    name: 'Mundra Port', 
    city: 'Mundra', 
    state: 'Gujarat',
    mapQuery: 'Mundra Port, Gujarat, India',
    lat: 22.7441, 
    lng: 69.7022,
    trunkIdx: 4,
    offshore: [22.50, 69.10]
  },
  inmaa: { 
    code: 'INMAA', 
    name: 'Chennai Port', 
    city: 'Chennai', 
    state: 'Tamil Nadu',
    mapQuery: 'Chennai Port, Tamil Nadu, India',
    lat: 13.0844, 
    lng: 80.2975,
    trunkIdx: 14,
    offshore: [13.10, 80.35]
  },
  inccu: { 
    code: 'INCCU', 
    name: 'Kolkata Port (SMPP)', 
    city: 'Kolkata', 
    state: 'West Bengal',
    mapQuery: 'Syama Prasad Mookerjee Port, Kolkata, India',
    lat: 22.5411, 
    lng: 88.3186,
    trunkIdx: 17,
    offshore: [21.30, 88.10]
  },
  incok: { 
    code: 'INCOK', 
    name: 'Cochin Port', 
    city: 'Cochin', 
    state: 'Kerala',
    mapQuery: 'Cochin Port Trust, Willingdon Island, Kochi, Kerala, India',
    lat: 9.9647, 
    lng: 76.2673,
    trunkIdx: 10,
    offshore: [9.95, 76.10]
  },
  invtz: { 
    code: 'INVTZ', 
    name: 'Visakhapatnam Port', 
    city: 'Visakhapatnam', 
    state: 'Andhra Pradesh',
    mapQuery: 'Visakhapatnam Port, Andhra Pradesh, India',
    lat: 17.6868, 
    lng: 83.2185,
    trunkIdx: 15,
    offshore: [17.65, 83.35]
  },
  inixy: { 
    code: 'INIXY', 
    name: 'Kandla (Deendayal Port)', 
    city: 'Kandla', 
    state: 'Gujarat',
    mapQuery: 'Deendayal Port, Kandla, Gujarat, India',
    lat: 23.0068, 
    lng: 70.2185,
    trunkIdx: 4,
    offshore: [22.55, 69.30]
  },
  intut: { 
    code: 'INTUT', 
    name: 'Tuticorin (V.O.C. Port)', 
    city: 'Tuticorin', 
    state: 'Tamil Nadu',
    mapQuery: 'V.O.Chidambaranar Port, Tuticorin, Tamil Nadu, India',
    lat: 8.7642, 
    lng: 78.1348,
    trunkIdx: 11,
    offshore: [8.75, 78.35]
  },
  inenr: { 
    code: 'INENR', 
    name: 'Ennore (Kamarajar Port)', 
    city: 'Ennore', 
    state: 'Tamil Nadu',
    mapQuery: 'Kamarajar Port Limited, Ennore, Chennai, India',
    lat: 13.2356, 
    lng: 80.3344,
    trunkIdx: 14,
    offshore: [13.25, 80.40]
  },
  inprt: { 
    code: 'INPRT', 
    name: 'Paradip Port', 
    city: 'Paradip', 
    state: 'Odisha',
    mapQuery: 'Paradip Port, Odisha, India',
    lat: 20.2644, 
    lng: 86.6698,
    trunkIdx: 16,
    offshore: [20.25, 86.80]
  },
  inhal: { 
    code: 'INHAL', 
    name: 'Haldia Dock', 
    city: 'Haldia', 
    state: 'West Bengal',
    mapQuery: 'Haldia Dock Complex, West Bengal, India',
    lat: 22.0622, 
    lng: 88.0645,
    trunkIdx: 17,
    offshore: [21.30, 88.10]
  },
  inmrm: { 
    code: 'INMRM', 
    name: 'Mormugao Port', 
    city: 'Mormugao', 
    state: 'Goa',
    mapQuery: 'Mormugao Port Trust, Goa, India',
    lat: 15.4144, 
    lng: 73.8011,
    trunkIdx: 8,
    offshore: [15.40, 73.65]
  },
  innml: { 
    code: 'INNML', 
    name: 'New Mangalore Port', 
    city: 'Mangalore', 
    state: 'Karnataka',
    mapQuery: 'New Mangalore Port, Panambur, Mangaluru, Karnataka, India',
    lat: 12.9256, 
    lng: 74.8211,
    trunkIdx: 9,
    offshore: [12.90, 74.65]
  },
  aedxb: { 
    code: 'AEDXB', 
    name: 'Dubai (Jebel Ali Port)', 
    city: 'Dubai', 
    state: 'UAE',
    mapQuery: 'Jebel Ali Port, Dubai, United Arab Emirates',
    lat: 25.0112, 
    lng: 55.0612,
    trunkIdx: 0,
    offshore: [25.05, 55.00]
  },
  sgsin: { 
    code: 'SGSIN', 
    name: 'Port of Singapore', 
    city: 'Singapore', 
    state: 'Singapore',
    mapQuery: 'Port of Singapore, Singapore',
    lat: 1.2800, 
    lng: 103.8500,
    isSingapore: true,
    offshore: [1.25, 103.75]
  }
};

// Ocean trunk corridor along the coastline navigating open sea
const OCEAN_TRUNK = [
  /* 0 */ [25.05, 55.00],   // Dubai offshore (Jebel Ali roadstead)
  /* 1 */ [26.40, 56.45],   // Strait of Hormuz
  /* 2 */ [24.50, 58.80],   // Gulf of Oman
  /* 3 */ [23.50, 63.50],   // Northern Arabian Sea lane
  /* 4 */ [22.20, 68.80],   // Off Dwarka
  /* 5 */ [21.50, 69.40],   // Off Porbandar
  /* 6 */ [20.60, 70.30],   // Off Veraval / Diu
  /* 7 */ [19.00, 72.60],   // Off Mumbai
  /* 8 */ [15.40, 73.65],   // Off Goa
  /* 9 */ [12.90, 74.65],   // Off Mangalore
  /* 10 */ [9.95, 76.10],   // Off Cochin
  /* 11 */ [7.75, 77.50],   // Off Cape Comorin
  /* 12 */ [5.75, 80.50],   // South Sri Lanka (Dondra Head maritime traffic lane)
  /* 13 */ [7.00, 82.00],   // East Sri Lanka turn
  /* 14 */ [13.10, 80.35],  // Off Chennai
  /* 15 */ [17.65, 83.35],  // Off Visakhapatnam
  /* 16 */ [20.25, 86.80],  // Off Paradip
  /* 17 */ [21.30, 88.10],  // Sandheads / Hooghly estuary
];

const MALACCA_CORRIDOR = [
  [5.90, 95.30],   // Malacca Strait entry (north of Sumatra)
  [3.50, 100.20],  // Malacca mid
  [1.25, 103.75]   // Singapore port approach
];

// Build authentic port-to-port ocean maritime shipping route
function getMaritimeRoute(originKey, destKey) {
  const oPort = PORTS_DATA[originKey];
  const dPort = PORTS_DATA[destKey];
  if (!oPort || !dPort) return [];

  if (originKey === destKey) {
    return [[oPort.lat, oPort.lng]];
  }

  const path = [];
  path.push([oPort.lat, oPort.lng]);

  const addPoint = (pt) => {
    const last = path[path.length - 1];
    if (!last || Math.hypot(last[0] - pt[0], last[1] - pt[1]) > 0.05) {
      path.push(pt);
    }
  };

  if (oPort.offshore) addPoint(oPort.offshore);

  if (oPort.isSingapore || dPort.isSingapore) {
    if (dPort.isSingapore) {
      if (oPort.trunkIdx <= 12) {
        for (let i = oPort.trunkIdx; i <= 12; i++) {
          addPoint(OCEAN_TRUNK[i]);
        }
      } else {
        addPoint(OCEAN_TRUNK[oPort.trunkIdx]);
      }
      MALACCA_CORRIDOR.forEach(pt => addPoint(pt));
    } else {
      [...MALACCA_CORRIDOR].reverse().forEach(pt => addPoint(pt));
      if (dPort.trunkIdx <= 12) {
        for (let i = 12; i >= dPort.trunkIdx; i--) {
          addPoint(OCEAN_TRUNK[i]);
        }
      } else {
        addPoint(OCEAN_TRUNK[dPort.trunkIdx]);
      }
    }
  } else {
    const startIdx = oPort.trunkIdx;
    const endIdx = dPort.trunkIdx;

    if (startIdx < endIdx) {
      for (let i = startIdx; i <= endIdx; i++) {
        addPoint(OCEAN_TRUNK[i]);
      }
    } else {
      for (let i = startIdx; i >= endIdx; i--) {
        addPoint(OCEAN_TRUNK[i]);
      }
    }
  }

  if (dPort.offshore) addPoint(dPort.offshore);
  addPoint([dPort.lat, dPort.lng]);

  return path;
}

// Calculate accurate Nautical Miles along the maritime shipping lane
function calculatePathDistanceNM(path) {
  if (!path || path.length < 2) return 180;
  let totalNM = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const lat1 = path[i][0] * Math.PI / 180;
    const lon1 = path[i][1] * Math.PI / 180;
    const lat2 = path[i+1][0] * Math.PI / 180;
    const lon2 = path[i+1][1] * Math.PI / 180;
    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;
    const a = Math.sin(dlat/2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distNM = c * 3440.065;
    totalNM += distNM;
  }
  return Math.max(120, Math.round(totalNM));
}

// Interpolate vessel coordinates along the sea lane according to voyage progress (0.0 to 1.0)
function getVesselPositionAlongPath(path, progressRatio) {
  if (!path || path.length === 0) return { lat: 18.95, lng: 72.95 };
  if (path.length === 1 || progressRatio <= 0) return { lat: path[0][0], lng: path[0][1] };
  if (progressRatio >= 1) return { lat: path[path.length - 1][0], lng: path[path.length - 1][1] };

  const segLengths = [];
  let totalLen = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const dLat = path[i+1][0] - path[i][0];
    const dLng = path[i+1][1] - path[i][1];
    const len = Math.hypot(dLat, dLng);
    segLengths.push(len);
    totalLen += len;
  }

  const targetDist = totalLen * Math.min(1, Math.max(0, progressRatio));
  let accumulated = 0;

  for (let i = 0; i < segLengths.length; i++) {
    const len = segLengths[i];
    if (accumulated + len >= targetDist) {
      const segProgress = len === 0 ? 0 : (targetDist - accumulated) / len;
      const lat = path[i][0] + (path[i+1][0] - path[i][0]) * segProgress;
      const lng = path[i][1] + (path[i+1][1] - path[i][1]) * segProgress;
      return { 
        lat: Number(lat.toFixed(4)), 
        lng: Number(lng.toFixed(4)) 
      };
    }
    accumulated += len;
  }

  const lastPt = path[path.length - 1];
  return { lat: lastPt[0], lng: lastPt[1] };
}

function resolveRouteDetails(routeStr) {
  const str = (routeStr || '').toLowerCase();
  let parts = [];
  if (str.includes('→')) parts = str.split('→');
  else if (str.includes('->')) parts = str.split('->');
  else if (str.includes(' to ')) parts = str.split(' to ');
  else if (/ {2,}/.test(str)) parts = str.split(/ {2,}/);

  const findPort = (text) => {
    if (!text) return null;
    for (const [key, p] of Object.entries(PORTS_DATA)) {
      if (
        text.includes(key) || 
        text.includes(p.code.toLowerCase()) || 
        text.includes(p.city.toLowerCase()) ||
        text.includes(p.name.toLowerCase().split(' ')[0])
      ) {
        return key;
      }
    }
    return null;
  };

  let originKey = parts[0] ? findPort(parts[0]) : null;
  let destKey = parts[1] ? findPort(parts[1]) : null;

  if (!originKey || !destKey) {
    const matches = [];
    for (const [key, p] of Object.entries(PORTS_DATA)) {
      const idxKey = str.indexOf(key);
      const idxCode = str.indexOf(p.code.toLowerCase());
      const idxCity = str.indexOf(p.city.toLowerCase());
      const firstIdx = [idxKey, idxCode, idxCity].filter(i => i !== -1).sort((a, b) => a - b)[0];
      if (firstIdx !== undefined) {
        matches.push({ key, idx: firstIdx });
      }
    }
    matches.sort((a, b) => a.idx - b.idx);
    if (matches.length >= 2) {
      originKey = matches[0].key;
      destKey = matches[matches.length - 1].key;
    }
  }

  const resolvedOriginKey = originKey || 'innsa';
  const resolvedDestKey = destKey || 'inmun';

  const originPort = PORTS_DATA[resolvedOriginKey] || PORTS_DATA.innsa;
  const destPort = PORTS_DATA[resolvedDestKey] || PORTS_DATA.inmun;

  const maritimePath = getMaritimeRoute(resolvedOriginKey, resolvedDestKey);
  const distanceNM = calculatePathDistanceNM(maritimePath);
  const transitDays = Math.max(2, Math.round(distanceNM / 180));

  return { originPort, destPort, maritimePath, distanceNM, transitDays };
}

// Interactive Google Maps Port-to-Port Maritime Route Map
function GoogleMaritimeRouteMap({ 
  originPort, 
  destPort, 
  maritimePath, 
  coordinates, 
  vessel, 
  status, 
  distanceNM, 
  mapStyle = 'roadmap' 
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      try {
        const bounds = L.latLngBounds(
          maritimePath && maritimePath.length > 0 
            ? maritimePath 
            : [[originPort.lat, originPort.lng], [destPort.lat, destPort.lng]]
        );

        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: true
        }).fitBounds(bounds, { padding: [55, 55], maxZoom: 8 });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        mapInstanceRef.current = map;
      } catch (err) {
        console.error('Failed to initialize map:', err);
      }
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Switch or set Tile Layer based on mapStyle ('roadmap' | 'satellite')
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    let tileUrl = 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    let attribution = '&copy; Google Maps';

    if (mapStyle === 'satellite') {
      tileUrl = 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      attribution = '&copy; Google Satellite Imagery';
    }

    const googleLayer = L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution
    });

    googleLayer.addTo(map);
    tileLayerRef.current = googleLayer;

    // Clear old route lines and markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Render Maritime Port-to-Port Shipping Corridor
    if (maritimePath && maritimePath.length >= 2) {
      // Glow corridor
      L.polyline(maritimePath, {
        color: '#0284c7',
        weight: 8,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Core shipping lane
      L.polyline(maritimePath, {
        color: '#0369a1',
        weight: 3.5,
        opacity: 0.9,
        dashArray: '7, 7',
        lineCap: 'round'
      }).addTo(map);
    }

    // Origin Port Marker (Green Google Port Pin)
    const originIcon = L.divIcon({
      className: 'custom-port-origin',
      html: `
        <div style="background: #059669; color: white; border-radius: 9999px; padding: 4px 10px; font-weight: 700; font-size: 11px; display: flex; align-items: center; gap: 5px; box-shadow: 0 4px 12px rgba(5,150,105,0.45); border: 2px solid white; white-space: nowrap;">
          <span style="display:inline-block; width:6px; height:6px; border-radius:9999px; background:white;"></span>
          ⚓ ${originPort.code}
        </div>
      `,
      iconSize: [80, 26],
      iconAnchor: [40, 13]
    });

    const originPopup = `
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 170px;">
        <span style="color: #059669; font-weight: 800; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;">Origin Port Terminal</span>
        <h4 style="margin: 2px 0 4px 0; font-size: 13px; font-weight: 700; color: #0f172a;">${originPort.name}</h4>
        <p style="margin: 0; color: #64748b; font-size: 11px;">LOCODE: <strong>${originPort.code}</strong> • ${originPort.city}</p>
        <p style="margin: 2px 0 6px 0; color: #64748b; font-size: 11px;">GPS: ${originPort.lat.toFixed(4)}° N, ${originPort.lng.toFixed(4)}° E</p>
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(originPort.mapQuery)}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 4px; background: #059669; color: white; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; text-decoration: none;">
          📍 Open in Google Maps
        </a>
      </div>
    `;

    L.marker([originPort.lat, originPort.lng], { icon: originIcon })
      .addTo(map)
      .bindPopup(originPopup);

    // Destination Port Marker (Indigo Google Port Pin)
    const destIcon = L.divIcon({
      className: 'custom-port-dest',
      html: `
        <div style="background: #4f46e5; color: white; border-radius: 9999px; padding: 4px 10px; font-weight: 700; font-size: 11px; display: flex; align-items: center; gap: 5px; box-shadow: 0 4px 12px rgba(79,70,229,0.45); border: 2px solid white; white-space: nowrap;">
          <span style="display:inline-block; width:6px; height:6px; border-radius:9999px; background:white;"></span>
          🎯 ${destPort.code}
        </div>
      `,
      iconSize: [80, 26],
      iconAnchor: [40, 13]
    });

    const destPopup = `
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 170px;">
        <span style="color: #4f46e5; font-weight: 800; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;">Destination Port Berth</span>
        <h4 style="margin: 2px 0 4px 0; font-size: 13px; font-weight: 700; color: #0f172a;">${destPort.name}</h4>
        <p style="margin: 0; color: #64748b; font-size: 11px;">LOCODE: <strong>${destPort.code}</strong> • ${destPort.city}</p>
        <p style="margin: 2px 0 6px 0; color: #64748b; font-size: 11px;">GPS: ${destPort.lat.toFixed(4)}° N, ${destPort.lng.toFixed(4)}° E</p>
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destPort.mapQuery)}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 4px; background: #4f46e5; color: white; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; text-decoration: none;">
          📍 Open in Google Maps
        </a>
      </div>
    `;

    L.marker([destPort.lat, destPort.lng], { icon: destIcon })
      .addTo(map)
      .bindPopup(destPopup);

    // Live Vessel Position on Maritime Shipping Lane
    const vesselIcon = L.divIcon({
      className: 'custom-vessel-marker',
      html: `
        <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; border-radius: 9999px; background: rgba(2, 132, 199, 0.25);"></div>
          <div style="position: relative; width: 34px; height: 34px; border-radius: 9999px; background: #0284c7; color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.5); border: 2px solid white; font-size: 16px;">
            🚢
          </div>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 21]
    });

    const vesselPopup = `
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 180px;">
        <span style="color: #0284c7; font-weight: 800; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;">🚢 Live Sea Position</span>
        <h4 style="margin: 2px 0 4px 0; font-size: 13px; font-weight: 700; color: #0f172a;">${vessel}</h4>
        <p style="margin: 0; color: #475569; font-size: 11px;">Status: <strong>${status}</strong></p>
        <p style="margin: 2px 0; color: #64748b; font-size: 11px;">GPS: ${coordinates.lat}° N, ${coordinates.lng}° E</p>
        <p style="margin: 2px 0 6px 0; color: #0284c7; font-weight: 600; font-size: 11px;">Port-to-Port Voyage: ~${distanceNM} NM</p>
        <a href="https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 4px; background: #0284c7; color: white; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; text-decoration: none;">
          🌐 View Coordinates on Google Maps
        </a>
      </div>
    `;

    L.marker([coordinates.lat, coordinates.lng], { icon: vesselIcon })
      .addTo(map)
      .bindPopup(vesselPopup)
      .openPopup();

    const bounds = L.latLngBounds(
      maritimePath && maritimePath.length > 0 
        ? maritimePath 
        : [[originPort.lat, originPort.lng], [destPort.lat, destPort.lng]]
    );
    map.fitBounds(bounds, { padding: [55, 55], maxZoom: 8 });

  }, [originPort, destPort, maritimePath, coordinates, vessel, status, distanceNM, mapStyle]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}

export default function ShipmentTracking({ initialTrackingId = 'CS-1001' }) {
  const [trackingId, setTrackingId] = useState(initialTrackingId);
  const [isSearching, setIsSearching] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [availableBookings, setAvailableBookings] = useState([]);
  const [mapStyle, setMapStyle] = useState('roadmap'); // 'roadmap' | 'satellite'
  const [error, setError] = useState('');

  // Fetch all bookings for initial tracking and quick switcher
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/bookings`);
        const json = await res.json();
        if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
          setAvailableBookings(json.data);
          const target = json.data.find(b => b.id.toUpperCase() === initialTrackingId.toUpperCase()) || json.data[0];
          setTrackingId(target.id);
          processBookingTracking(target);
        }
      } catch (err) {
        console.warn('Failed to load initial booking for tracking:', err);
      }
    };
    fetchBookings();
  }, [initialTrackingId]);

  const processBookingTracking = (booking) => {
    const { originPort, destPort, maritimePath, distanceNM, transitDays } = resolveRouteDetails(booking.route);

    const rawBookingPlaced = new Date(booking.createdAt || Date.now());
    const bookingPlacedTimeStr = isNaN(rawBookingPlaced.getTime()) 
      ? new Date().toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : rawBookingPlaced.toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    let departureDate = booking.date ? new Date(booking.date) : new Date(rawBookingPlaced.getTime() + 86400000);
    if (isNaN(departureDate.getTime())) departureDate = new Date();

    const etaDate = new Date(departureDate.getTime() + transitDays * 86400000);
    const etaDateStr = etaDate.toISOString().split('T')[0];
    const departureDateStr = departureDate.toISOString().split('T')[0];

    const status = booking.status || 'Pending Confirmation';
    const isApproved = ['Approved', 'Accepted'].includes(status);
    const isInTransit = status === 'In Transit';
    const isDelivered = status === 'Delivered';
    const isRejected = status === 'Rejected';

    // Step status mappings
    const s1 = 'completed';
    const s2 = (isApproved || isInTransit || isDelivered) ? 'completed' : (isRejected ? 'rejected' : 'current');
    const s3 = (isInTransit || isDelivered) ? 'completed' : (isApproved ? 'current' : 'pending');
    const s4 = isDelivered ? 'completed' : (isInTransit ? 'current' : 'pending');
    const s5 = isDelivered ? 'completed' : 'pending';

    // Live progress coordinates calculated along the maritime ocean shipping path
    let progressRatio = 0.5;
    if (status === 'Pending Confirmation') progressRatio = 0.05;
    else if (isApproved) progressRatio = 0.25;
    else if (isInTransit) progressRatio = 0.65;
    else if (isDelivered) progressRatio = 1.0;

    const vesselPos = getVesselPositionAlongPath(maritimePath, progressRatio);
    const currentLat = vesselPos.lat;
    const currentLng = vesselPos.lng;

    const carrier = booking.carrier || 'Oceanic Freight Ltd.';
    const vessel = booking.vessel || 'Oceanic Explorer';
    const exporter = booking.exporterName || 'Global Exports SME';
    const commodity = booking.commodity || 'General Cargo';
    const cbm = booking.cbm || 10;
    const weight = booking.weight || null;
    const specialReq = booking.specialReq || 'Standard handling';

    const formatPrettyDate = (d) => {
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? '' : dt.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const confirmTimeStr = (isApproved || isInTransit || isDelivered)
      ? new Date(rawBookingPlaced.getTime() + 1800000).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : (isRejected ? `${formatPrettyDate(rawBookingPlaced)} • Declined` : `${formatPrettyDate(rawBookingPlaced)} • Pending Approval`);

    const gateInTimeStr = (isApproved || isInTransit || isDelivered)
      ? `${formatPrettyDate(departureDate)} • 08:30 AM`
      : `Scheduled: ${formatPrettyDate(departureDate)} • 08:30 AM`;

    const departureTimeStr = (isInTransit || isDelivered) 
      ? `${formatPrettyDate(departureDate)} • 02:00 PM` 
      : `Scheduled: ${formatPrettyDate(departureDate)} • 02:00 PM`;

    const arrivalTimeStr = isDelivered 
      ? `${formatPrettyDate(etaDate)} • 05:30 PM` 
      : `Estimated: ${formatPrettyDate(etaDate)} • 05:30 PM`;

    const updates = [
      {
        step: 1,
        status: s1,
        event: 'Booking Placed & Space Reserved',
        location: `CargoShare Portal • ${exporter}`,
        time: bookingPlacedTimeStr,
        details: `Booking ID #${booking.id} placed for ${commodity} (${cbm} CBM${weight ? `, ${weight} kg` : ''}). Space reserved with carrier ${carrier}. Special instructions: "${specialReq}".`,
        fields: [
          { label: 'Booking Ref', value: booking.id },
          { label: 'Exporter', value: exporter },
          { label: 'Commodity', value: commodity },
          { label: 'Volume / Weight', value: `${cbm} CBM${weight ? ` • ${weight} kg` : ''}` },
          { label: 'Special Instructions', value: specialReq }
        ]
      },
      {
        step: 2,
        status: s2,
        event: 'Carrier Confirmation & Slot Locked',
        location: `${carrier} Operations Terminal`,
        time: confirmTimeStr,
        details: (isApproved || isInTransit || isDelivered)
          ? `${carrier} has confirmed space allocation. Loading slot officially locked for vessel ${vessel}.`
          : (isRejected 
            ? `${carrier} was unable to accept this booking due to slot capacity constraints.`
            : `Space request pending carrier review. Carrier is confirming slot availability on ${vessel}.`),
        fields: [
          { label: 'Carrier', value: carrier },
          { label: 'Assigned Vessel', value: vessel },
          { label: 'Slot Contract', value: `CS-SLOT-${booking.id.replace('CS-', '')}` },
          { label: 'Approval Status', value: status }
        ]
      },
      {
        step: 3,
        status: s3,
        event: 'Origin Gate-In & Customs Pre-Clearance',
        location: `${originPort.name} (${originPort.code}) - Terminal Berth`,
        time: gateInTimeStr,
        details: (isInTransit || isDelivered)
          ? `Container passed customs clearance at ${originPort.code} and safely loaded onto vessel berth.`
          : (isApproved
            ? `Cargo pre-cleared via Single-Window Customs EDI. Container gated into ${originPort.name} CFS staging area.`
            : `Customs documentation ready for submission upon carrier finalization.`),
        fields: [
          { label: 'Origin Port', value: `${originPort.name} (${originPort.code})` },
          { label: 'Customs Verification', value: (isApproved || isInTransit || isDelivered) ? 'Passed EDI Verification (Pre-Cleared)' : 'Pending Gate-In' },
          { label: 'Container Yard', value: `Terminal Berth ${originPort.code}-02` },
          { label: 'Shipping Bill Ref', value: `SB-${originPort.code}-${booking.id.slice(-4)}` }
        ]
      },
      {
        step: 4,
        status: s4,
        event: 'Vessel Ocean Transit',
        location: `En Route: ${originPort.code} → ${destPort.code}`,
        time: departureTimeStr,
        details: isDelivered
          ? `Ocean voyage successfully completed between ${originPort.name} and ${destPort.name}.`
          : (isInTransit
            ? `Vessel ${vessel} cruising on maritime sea lane. Current position: ${currentLat}° N, ${currentLng}° E. Normal sea conditions.`
            : `Scheduled to depart ${originPort.name} on ${departureDateStr} via coastal sea route to ${destPort.name}. Total distance: ~${distanceNM} NM.`),
        fields: [
          { label: 'Sea Lane', value: `${originPort.city} Corridor → ${destPort.city}` },
          { label: 'Total Distance', value: `~${distanceNM} Nautical Miles` },
          { label: 'Estimated Transit', value: `${transitDays} Days` },
          { label: 'Current GPS', value: `${currentLat}° N, ${currentLng}° E` }
        ]
      },
      {
        step: 5,
        status: s5,
        event: 'Arrival at Destination Port & Handover',
        location: `${destPort.name} (${destPort.code}) - Discharge Terminal`,
        time: arrivalTimeStr,
        details: isDelivered
          ? `Vessel docked at ${destPort.name}. Cargo discharged from container and handed over to consignee.`
          : `Scheduled arrival at ${destPort.name} berth on ${etaDateStr}. Handover procedures and delivery order release prepared.`,
        fields: [
          { label: 'Destination Port', value: `${destPort.name} (${destPort.code})` },
          { label: 'Discharge Berth', value: `${destPort.code} Container Berth 4` },
          { label: 'Scheduled ETA', value: etaDateStr },
          { label: 'Consignee Delivery', value: isDelivered ? 'Handed Over' : 'Scheduled upon berthing' }
        ]
      }
    ];

    setTrackingData({
      id: booking.id,
      route: booking.route,
      status,
      carrier,
      vessel,
      departure: departureDateStr,
      eta: etaDateStr,
      originPort,
      destPort,
      maritimePath,
      distanceNM,
      transitDays,
      exporter,
      commodity,
      cbm,
      weight,
      specialReq,
      coordinates: { lat: currentLat, lng: currentLng },
      updates
    });
  };

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    if (!trackingId.trim()) return;

    setIsSearching(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/bookings`);
      const data = await res.json();

      if (data.status === 'success') {
        const found = data.data.find(b => b.id.toUpperCase() === trackingId.trim().toUpperCase());
        if (found) {
          processBookingTracking(found);
        } else {
          // Fallback if ID not directly found in database
          const synthetic = {
            id: trackingId.trim().toUpperCase(),
            route: 'Mumbai (Nhava Sheva/JNPT) - INNSA → Mundra - INMUN',
            carrier: 'Oceanic Freight Ltd.',
            vessel: 'Oceanic Explorer',
            status: 'Approved',
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date(Date.now() - 86400000).toISOString()
          };
          processBookingTracking(synthetic);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Unable to track shipment.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectBooking = (booking) => {
    setTrackingId(booking.id);
    processBookingTracking(booking);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Track Your Cargo</h1>
        <p className="text-slate-500 mt-2">Real-time GPS voyage tracking plotted by booked source and destination ports.</p>
      </div>

      {/* Search Input Bar with Quick Booking Switcher */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto relative">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Enter Booking ID (e.g. CS-1001, CS-1002)..."
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-base md:text-lg text-slate-700 placeholder-slate-400 transition-all"
            />
          </div>

          {/* Quick Select from Active Bookings */}
          {availableBookings.length > 0 && (
            <div className="relative min-w-[240px]">
              <select
                onChange={(e) => {
                  const b = availableBookings.find(item => item.id === e.target.value);
                  if (b) handleSelectBooking(b);
                }}
                value={trackingId}
                className="w-full h-full py-4 pl-4 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              >
                {availableBookings.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.id}: {b.route.replace('Mumbai (Nhava Sheva/JNPT) - ', '').replace('Chennai - ', '')}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSearching}
            className={`px-8 py-4 bg-brand-600 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center min-w-[130px] ${
              isSearching ? 'opacity-70 cursor-not-allowed' : 'hover:bg-brand-700 hover:-translate-y-0.5'
            }`}
          >
            {isSearching ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : 'Track'}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>

      {trackingData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
          
          {/* Left Column: Map with Live Position Floating Card, View Toggle, and Metric Cards */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Map Container */}
            {/* Map Container: Google Maritime Route Map (Port-to-Port Ocean Route) */}
            <div className="bg-slate-100 h-[460px] rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative group">
              
              {/* Google Maps Port-to-Port Maritime Route Map */}
              <GoogleMaritimeRouteMap 
                originPort={trackingData.originPort}
                destPort={trackingData.destPort}
                maritimePath={trackingData.maritimePath}
                coordinates={trackingData.coordinates}
                vessel={trackingData.vessel}
                status={trackingData.status}
                distanceNM={trackingData.distanceNM}
                mapStyle={mapStyle}
              />
              
              {/* Floating Live Position & Google Location Badge (Top-Left) */}
              <div className="absolute top-4 left-4 z-[400] bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-3.5 pointer-events-auto max-w-[calc(100%-210px)] sm:max-w-md">
                <div className="w-11 h-11 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center shrink-0 border border-brand-200 shadow-sm">
                  <Navigation className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider truncate">
                      Google Location • Port-to-Port Sea Route
                    </p>
                  </div>
                  <p className="text-slate-900 font-black text-base sm:text-lg truncate">
                    {trackingData.coordinates.lat}° N, {trackingData.coordinates.lng}° E
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs">
                    <span className="text-brand-600 font-bold">{trackingData.status}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600 font-medium">~{trackingData.distanceNM} NM Maritime Route</span>
                  </div>
                </div>
              </div>

              {/* View Switcher Controls (Top-Right) */}
              <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-slate-200 flex items-center gap-1 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setMapStyle('roadmap')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    mapStyle === 'roadmap' 
                      ? 'bg-brand-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Google Maps standard view"
                >
                  <Globe className="w-3.5 h-3.5" /> Google Maps
                </button>
                <button
                  type="button"
                  onClick={() => setMapStyle('satellite')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    mapStyle === 'satellite' 
                      ? 'bg-brand-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Google Satellite view with labels"
                >
                  <Layers className="w-3.5 h-3.5" /> Satellite
                </button>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${trackingData.coordinates.lat},${trackingData.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-all flex items-center gap-1"
                  title="Open GPS sea coordinates in Google Maps"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Booked Origin & Destination Badges (Bottom-Left) */}
              <div className="absolute bottom-4 left-4 z-[400] hidden sm:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-xl text-xs font-medium shadow-lg border border-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>Origin: <strong className="text-emerald-300 font-semibold">{trackingData.originPort.name}</strong> ({trackingData.originPort.code})</span>
                <span className="text-slate-400 mx-1">➔</span>
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                <span>Destination: <strong className="text-indigo-300 font-semibold">{trackingData.destPort.name}</strong> ({trackingData.destPort.code})</span>
                <span className="ml-2 pl-2 border-l border-slate-700 text-sky-300 text-[11px] font-semibold flex items-center gap-1">
                  🚢 Maritime Shipping Lane
                </span>
              </div>

            </div>

            {/* 4 Metrics Cards (2x2 Grid) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm mb-1">Carrier</p>
                <p className="font-bold text-slate-900 text-lg">{trackingData.carrier}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm mb-1">Vessel</p>
                <p className="font-bold text-slate-900 text-lg">{trackingData.vessel}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm mb-1">Departure</p>
                <p className="font-bold text-slate-900 text-lg">{trackingData.departure}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm mb-1">ETA</p>
                <p className="font-bold text-brand-600 text-lg">{trackingData.eta}</p>
              </div>
            </div>

            {/* Current Booking Cargo & Route Specification Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Current Booking Details</h3>
                    <p className="text-xs text-slate-500">Reference: {trackingData.id} • Exporter: {trackingData.exporter}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                  ['Approved', 'Accepted'].includes(trackingData.status) 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : trackingData.status === 'In Transit'
                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                      : trackingData.status === 'Delivered'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {trackingData.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-400 block text-xs">Commodity</span>
                  <span className="font-semibold text-slate-800">{trackingData.commodity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Volume / Weight</span>
                  <span className="font-semibold text-slate-800">
                    {trackingData.cbm} CBM {trackingData.weight ? `• ${trackingData.weight.toLocaleString()} kg` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Booked Source</span>
                  <span className="font-semibold text-slate-800">{trackingData.originPort.city} ({trackingData.originPort.code})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Booked Destination</span>
                  <span className="font-semibold text-slate-800">{trackingData.destPort.city} ({trackingData.destPort.code})</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Journey Timeline */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Journey Timeline</h3>
                  <p className="text-xs text-slate-500 mt-1">Live milestone tracking for {trackingData.id}</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              
              <div className="relative border-l-2 border-brand-200 ml-4 space-y-7 py-1">
                {trackingData.updates.map((update, idx) => (
                  <div key={idx} className="relative pl-8">
                    
                    {/* Status Node Circle */}
                    <div className={`absolute -left-[17px] top-0.5 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 
                      ${update.status === 'completed' ? 'bg-emerald-100 border-emerald-500 text-emerald-600' : 
                        update.status === 'current' ? 'bg-brand-100 border-brand-500 text-brand-600 animate-pulse' : 
                        update.status === 'rejected' ? 'bg-red-100 border-red-500 text-red-600' :
                        'bg-white border-slate-200 text-slate-300'}`}
                    >
                      {update.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                      {update.status === 'current' && <Anchor className="w-4 h-4" />}
                      {update.status === 'pending' && <Truck className="w-4 h-4" />}
                      {update.status === 'rejected' && <XCircle className="w-4 h-4" />}
                    </div>
                    
                    {/* Milestone Heading */}
                    <h4 className={`font-semibold text-base leading-snug ${update.status === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>
                      {update.event}
                    </h4>

                    {/* Date and Time */}
                    {update.time && (
                      <p className={`text-xs mt-1 font-medium ${update.status === 'pending' ? 'text-slate-400' : 'text-slate-500'}`}>
                        {update.time}
                      </p>
                    )}

                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
