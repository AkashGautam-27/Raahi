'use client'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import axios from 'axios'
import { AnimatePresence, motion } from 'motion/react'
import { Check, LocateFixed, MapPin, Navigation, Search, X } from 'lucide-react'

export interface LocationResult {
    address: string;
    country: string;
    lat: number;
    lng: number;
}

interface LocationPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'pickup' | 'drop';
    initialLat?: number;
    initialLng?: number;
    initialAddress?: string;
    restrictCountry?: string;
    onConfirm: (result: LocationResult) => void;
}

const pickUpIcon = new L.DivIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 6px 18px rgba(0,0,0,0.28))">
      <div style="background:#09090b;color:#fff;padding:5px 12px;border-radius:100px;font-size:10px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;white-space:nowrap;font-family:-apple-system,system-ui,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,0.3);">PICKUP</div>
      <div style="width:2px;height:8px;background:#09090b;opacity:0.5"></div>
      <div style="width:13px;height:13px;background:#09090b;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px rgba(0,0,0,0.18);"></div>
    </div>`,
    className: "",
    iconSize: [90, 56],
    iconAnchor: [45, 56]
});

const dropIcon = new L.DivIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 6px 18px rgba(0,0,0,0.28))">
      <div style="background:#059669;color:#fff;padding:5px 12px;border-radius:100px;font-size:10px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;white-space:nowrap;font-family:-apple-system,system-ui,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,0.3);">DROP</div>
      <div style="width:2px;height:8px;background:#059669;opacity:0.5"></div>
      <div style="width:13px;height:13px;background:#059669;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px rgba(5,150,105,0.25);"></div>
    </div>`,
    className: "",
    iconSize: [90, 56],
    iconAnchor: [45, 56]
});

function MapController({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.invalidateSize();
        map.flyTo(center, Math.max(map.getZoom(), 15), { duration: 0.8 });
    }, [center, map]);

    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 250);
        return () => clearTimeout(timer);
    }, [map]);

    return null;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        }
    });
    return null;
}

type SearchItem = {
    id: string;
    formatted: string;
    lat: number;
    lng: number;
    country?: string;
};

export default function LocationPickerModal({
    isOpen,
    onClose,
    type,
    initialLat,
    initialLng,
    initialAddress,
    restrictCountry,
    onConfirm
}: LocationPickerModalProps) {
    const defaultCenter: [number, number] = [28.6139, 77.2090]; // Delhi fallback
    const [position, setPosition] = useState<[number, number] | null>(
        initialLat && initialLng ? [initialLat, initialLng] : null
    );
    const [mapCenter, setMapCenter] = useState<[number, number]>(
        initialLat && initialLng ? [initialLat, initialLng] : defaultCenter
    );
    const [address, setAddress] = useState<string>(initialAddress || "");
    const [country, setCountry] = useState<string>(restrictCountry || "");
    const [loadingAddress, setLoadingAddress] = useState(false);
    const [locatingUser, setLocatingUser] = useState(false);

    // Search bar state inside map
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<SearchItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const reverseGeoCode = useCallback(async (lat: number, lon: number) => {
        setLoadingAddress(true);
        try {
            const { data } = await axios.get("https://api.geoapify.com/v1/geocode/reverse", {
                params: {
                    lat,
                    lon,
                    apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY,
                    filter: "countrycode:in"
                }
            });
            if (data?.features?.length) {
                const p = data.features[0].properties;
                const addr = [p.name, p.street, p.city, p.state, p.country].filter(Boolean).join(", ");
                setAddress(addr || `${lat.toFixed(5)}, ${lon.toFixed(5)}`);
                setCountry(p.country || "");
            } else {
                setAddress(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);
            }
        } catch (error) {
            console.error("Reverse geocoding error:", error);
            setAddress(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);
        } finally {
            setLoadingAddress(false);
        }
    }, []);

    const handleSelectCoord = useCallback((lat: number, lng: number) => {
        setPosition([lat, lng]);
        reverseGeoCode(lat, lng);
    }, [reverseGeoCode]);

    // Handle initial state setup when modal opens
    useEffect(() => {
        if (!isOpen) return;

        if (initialLat && initialLng) {
            const pos: [number, number] = [initialLat, initialLng];
            setPosition(pos);
            setMapCenter(pos);
            if (initialAddress) {
                setAddress(initialAddress);
            } else {
                reverseGeoCode(initialLat, initialLng);
            }
        } else {
            // Try to acquire current position
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    ({ coords }) => {
                        const pos: [number, number] = [coords.latitude, coords.longitude];
                        setPosition(pos);
                        setMapCenter(pos);
                        reverseGeoCode(coords.latitude, coords.longitude);
                    },
                    () => {
                        setPosition(defaultCenter);
                        setMapCenter(defaultCenter);
                        reverseGeoCode(defaultCenter[0], defaultCenter[1]);
                    },
                    { timeout: 7000 }
                );
            } else {
                setPosition(defaultCenter);
                setMapCenter(defaultCenter);
                reverseGeoCode(defaultCenter[0], defaultCenter[1]);
            }
        }
    }, [isOpen, initialLat, initialLng, initialAddress, reverseGeoCode]);

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) return;
        setLocatingUser(true);
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const pos: [number, number] = [coords.latitude, coords.longitude];
                setPosition(pos);
                setMapCenter(pos);
                reverseGeoCode(coords.latitude, coords.longitude);
                setLocatingUser(false);
            },
            (err) => {
                console.error("Geolocation error:", err);
                setLocatingUser(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSearchInput = (q: string) => {
        setSearchQuery(q);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (!q || q.trim().length < 3) {
            setSuggestions([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        searchTimeout.current = setTimeout(async () => {
            try {
                const { data } = await axios.get("https://api.geoapify.com/v1/geocode/autocomplete", {
                    params: {
                        text: q.trim(),
                        limit: 5,
                        lang: "en",
                        filter: "countrycode:in",
                        apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY
                    }
                });

                const items: SearchItem[] = (data?.features ?? []).map((f: any) => {
                    const p = f.properties;
                    return {
                        id: String(p.osm_id || Math.random()),
                        formatted: [p.name, p.city, p.state, p.country].filter(Boolean).join(", "),
                        lat: f.geometry.coordinates[1],
                        lng: f.geometry.coordinates[0],
                        country: p.country
                    };
                });
                setSuggestions(items);
            } catch (err) {
                console.error(err);
                setSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        }, 350);
    };

    const handleSelectSearchItem = (item: SearchItem) => {
        const pos: [number, number] = [item.lat, item.lng];
        setPosition(pos);
        setMapCenter(pos);
        setAddress(item.formatted);
        setCountry(item.country || "");
        setSearchQuery("");
        setSuggestions([]);
    };

    if (!isOpen) return null;

    const isPickup = type === 'pickup';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col h-[85vh] max-h-[640px]"
                >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-white z-20">
                        <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isPickup ? "bg-zinc-900 text-white" : "bg-emerald-600 text-white"
                                }`}>
                                {isPickup ? <MapPin size={16} /> : <Navigation size={16} />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-sm font-black text-zinc-900">
                                        Choose {isPickup ? "Pickup" : "Drop"} on Map
                                    </h2>
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${isPickup ? "bg-zinc-100 text-zinc-800" : "bg-emerald-50 text-emerald-700"
                                        }`}>
                                        {isPickup ? "Pickup" : "Drop"}
                                    </span>
                                </div>
                                <p className="text-[11px] text-zinc-400">
                                    Click anywhere on the map or drag the pin to set location
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors flex items-center justify-center"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Map Container & Search Overlay */}
                    <div className="flex-1 relative w-full overflow-hidden bg-zinc-100">
                        {/* Search Bar on Map */}
                        <div className="absolute top-3 left-3 right-3 sm:left-4 sm:right-4 z-[500]">
                            <div className="relative">
                                <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-2xl border border-zinc-200/80 shadow-lg px-3.5 py-2.5 focus-within:border-zinc-900 transition-all">
                                    <Search size={15} className="text-zinc-400 flex-shrink-0" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => handleSearchInput(e.target.value)}
                                        placeholder={`Search ${isPickup ? "pickup" : "drop"} area, landmark or street…`}
                                        className="w-full bg-transparent text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery("");
                                                setSuggestions([]);
                                            }}
                                            className="text-zinc-400 hover:text-zinc-600"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Autocomplete Suggestions Dropdown */}
                                {suggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden max-h-48 overflow-y-auto"
                                    >
                                        {suggestions.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => handleSelectSearchItem(item)}
                                                className="px-3.5 py-2.5 hover:bg-zinc-50 cursor-pointer flex items-center gap-2.5 border-b border-zinc-100 last:border-0 transition-colors"
                                            >
                                                <MapPin size={13} className="text-zinc-400 flex-shrink-0" />
                                                <span className="text-xs font-semibold text-zinc-800 truncate">
                                                    {item.formatted}
                                                </span>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Floating Locate Me Button */}
                        <div className="absolute right-3 bottom-4 sm:right-4 z-[500]">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                type="button"
                                onClick={handleUseCurrentLocation}
                                disabled={locatingUser}
                                title="Locate my position"
                                className="w-10 h-10 rounded-2xl bg-white border border-zinc-200 shadow-lg flex items-center justify-center hover:bg-zinc-50 transition-colors text-zinc-800"
                            >
                                <LocateFixed size={18} className={locatingUser ? "animate-spin text-zinc-900" : "text-zinc-800"} />
                            </motion.button>
                        </div>

                        {/* Leaflet Map */}
                        <MapContainer
                            center={mapCenter}
                            zoom={15}
                            zoomControl={false}
                            style={{ width: "100%", height: "100%" }}
                        >
                            <TileLayer
                                attribution='Powered by <a href="https://www.geoapify.com/">Geoapify</a> | © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`}
                                maxZoom={20}
                            />
                            <MapController center={mapCenter} />
                            <MapClickHandler onMapClick={handleSelectCoord} />

                            {position && (
                                <Marker
                                    position={position}
                                    icon={isPickup ? pickUpIcon : dropIcon}
                                    draggable={true}
                                    eventHandlers={{
                                        dragend: (e) => {
                                            const marker = e.target;
                                            const latlng = marker.getLatLng();
                                            handleSelectCoord(latlng.lat, latlng.lng);
                                        }
                                    }}
                                />
                            )}
                        </MapContainer>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="p-4 bg-white border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
                        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
                                <MapPin size={16} className={isPickup ? "text-zinc-900" : "text-emerald-600"} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    {isPickup ? "Pickup Address" : "Drop Address"}
                                </p>
                                <p className="text-xs font-bold text-zinc-900 truncate mt-0.5">
                                    {loadingAddress ? (
                                        <span className="text-zinc-400 animate-pulse">Fetching address details…</span>
                                    ) : (
                                        address || "Click on map to select location"
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={!position || loadingAddress || !address}
                                onClick={() => {
                                    if (position && address) {
                                        onConfirm({
                                            address,
                                            country,
                                            lat: position[0],
                                            lng: position[1]
                                        });
                                        onClose();
                                    }
                                }}
                                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black disabled:opacity-40 text-xs font-black text-white tracking-wide transition-all shadow-md disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                <Check size={14} />
                                <span>Confirm Location</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

