import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';
import { vendorAPI } from '../services/api';
import { useLocation } from '../context/LocationContext';
import { formatRating, getRatingColor } from '../utils/helpers';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom orange marker for vendors
const vendorIcon = L.divIcon({
    html: `<div style="
    width:36px;height:36px;border-radius:50% 50% 50% 0;
    background:var(--color-brand);
    border:3px solid white;
    box-shadow:0 4px 12px rgba(239,79,95,0.4);
    transform:rotate(-45deg);
    display:flex;align-items:center;justify-content:center;
  "><span style="transform:rotate(45deg);font-size:14px;">🥘</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
    className: '',
});

const userIcon = L.divIcon({
    html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:#3b82f6;border:3px solid white;
    box-shadow:0 4px 12px rgba(59,130,246,0.5);
  "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    className: '',
});

function RecenterMap({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, 14);
    }, [center, map]);
    return null;
}

function VendorPopup({ vendor }) {
    const rating = parseFloat(vendor.avg_rating || 0);
    return (
        <div className="w-52 p-0">
            {vendor.cover_image && (
                <img src={vendor.cover_image} alt={vendor.name} className="w-full h-28 object-cover" onError={e => e.target.style.display = 'none'} />
            )}
            <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{vendor.name}</h3>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-lg ${vendor.is_open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {vendor.is_open ? 'Open' : 'Closed'}
                    </span>
                </div>
                <p className="text-xs text-gray-400 mb-1">{vendor.category}</p>
                <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                    <span className="font-medium" style={{ color: getRatingColor(rating) }}>★ {formatRating(rating)}</span>
                    <span className="text-gray-300">·</span>
                    <span>{vendor.total_reviews || 0} reviews</span>
                </div>
                <Link to={`/vendors/${vendor.id}`} className="block w-full text-center text-[13px] font-bold text-white py-2 rounded-lg bg-brand hover:bg-brand-dark transition-colors shadow-sm">
                    View Vendor
                </Link>
            </div>
        </div>
    );
}

export default function MapView() {
    const { location, detectLocation, locationLoading } = useLocation();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [center, setCenter] = useState([20.5937, 78.9629]); // India center

    useEffect(() => {
        vendorAPI.getAll({ limit: 100 })
            .then(({ data }) => setVendors(data.vendors))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (location) {
            setTimeout(() => setCenter([location.lat, location.lng]), 0);
        }
    }, [location]);

    return (
        <div className="h-[calc(100vh-72px)] flex flex-col pt-0">
            {/* Top bar */}
            <div className="bg-white z-10 px-4 py-3 flex items-center justify-between gap-4 border-b border-gray-200 shadow-sm relative relative-z-layer">
                <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-brand" />
                    <span className="font-bold text-gray-900 text-[15px]">
                        {loading ? 'Loading vendors...' : `${vendors.length} places to explore`}
                    </span>
                </div>
                <button
                    onClick={detectLocation}
                    className="flex items-center gap-2 text-white text-[14px] font-bold px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark transition-colors shadow-sm"
                >
                    <Navigation size={16} />
                    {locationLoading ? 'Locating...' : 'Find Near Me'}
                </button>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
                <MapContainer
                    center={center}
                    zoom={location ? 13 : 5}
                    className="w-full h-full"
                    zoomControl={true}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                    />
                    <RecenterMap center={location ? [location.lat, location.lng] : null} />

                    {/* User location */}
                    {location && (
                        <>
                            <Marker position={[location.lat, location.lng]} icon={userIcon}>
                                <Popup>📍 You are here</Popup>
                            </Marker>
                            <Circle
                                center={[location.lat, location.lng]}
                                radius={2000}
                                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.08, weight: 1, dashArray: '5,5' }}
                            />
                        </>
                    )}

                    {/* Vendor markers */}
                    {vendors.map(vendor => (
                        vendor.latitude && vendor.longitude ? (
                            <Marker
                                key={vendor.id}
                                position={[parseFloat(vendor.latitude), parseFloat(vendor.longitude)]}
                                icon={vendorIcon}
                            >
                                <Popup minWidth={208} maxWidth={208} className="vendor-popup">
                                    <VendorPopup vendor={vendor} />
                                </Popup>
                            </Marker>
                        ) : null
                    ))}
                </MapContainer>

                {/* Legend */}
                <div className="absolute bottom-6 left-4 glass rounded-xl px-4 py-3 text-xs space-y-1.5 z-10 shadow-lg">
                    <p className="font-semibold text-gray-700 mb-2">Legend</p>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500" /> Vendor</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /> Your Location</div>
                </div>
            </div>
        </div>
    );
}
