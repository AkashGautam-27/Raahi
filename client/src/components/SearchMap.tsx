'use client'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import "leaflet/dist/leaflet.css";
import L from "leaflet"
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import axios from 'axios'
import { AnimatePresence, motion } from 'motion/react'
import { MapPin, Navigation2 } from 'lucide-react'

type Props = {
    pickUp: string;
    drop: string;
    pickUpLat?: number;
    pickUpLon?: number;
    dropLat?: number;
    dropLon?: number;
    onChange?: (p: string, d: string, p1?: [number, number], p2?: [number, number]) => void;
    onDistance: (d: number) => void;
};

function MapRecenter({ p1, p2 }: { p1?: [number, number]; p2?: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (p1 && p2 && !isNaN(p1[0]) && !isNaN(p2[0])) {
            const timer = setTimeout(() => {
                map.invalidateSize();
                map.fitBounds([p1, p2], { padding: [70, 70], maxZoom: 15, animate: true, duration: 0.8 });
            }, 120);
            return () => clearTimeout(timer);
        } else if (p1 && !isNaN(p1[0])) {
            map.flyTo(p1, 14, { duration: 0.8 });
        }
    }, [p1, p2, map]);
    return null;
}

const pickUpIcon = new L.DivIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 6px 18px rgba(0,0,0,0.22))">
      <div style="
        background:#0a0a0a;color:#fff;
        padding:5px 14px;border-radius:100px;
        font-size:10px;font-weight:800;letter-spacing:0.14em;
        text-transform:uppercase;white-space:nowrap;
        font-family:-apple-system,system-ui,sans-serif;
        box-shadow:0 2px 12px rgba(0,0,0,0.25);
      ">PICKUP</div>
      <div style="width:2px;height:10px;background:#0a0a0a;opacity:0.4"></div>
      <div style="
        width:13px;height:13px;background:#0a0a0a;border-radius:50%;
        border:3px solid #fff;
        box-shadow:0 0 0 2px rgba(0,0,0,0.15), 0 3px 10px rgba(0,0,0,0.3);
      "></div>
    </div>`,
    className: "",
    iconSize: [90, 58],
    iconAnchor: [45, 58]
});

const dropIcon = new L.DivIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 6px 18px rgba(0,0,0,0.22))">
      <div style="
        background:#0a0a0a;color:#fff;
        padding:5px 14px;border-radius:100px;
        font-size:10px;font-weight:800;letter-spacing:0.14em;
        text-transform:uppercase;white-space:nowrap;
        font-family:-apple-system,system-ui,sans-serif;
        box-shadow:0 2px 12px rgba(0,0,0,0.25);
      ">DROP</div>
      <div style="width:2px;height:10px;background:#0a0a0a;opacity:0.4"></div>
      <div style="
        width:13px;height:13px;background:#0a0a0a;border-radius:50%;
        border:3px solid #fff;
        box-shadow:0 0 0 2px rgba(0,0,0,0.15), 0 3px 10px rgba(0,0,0,0.3);
      "></div>
    </div>`,
    className: "",
    iconSize: [90, 58],
    iconAnchor: [45, 58]
});

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c * 1.25).toFixed(2); // approximate road route ~1.25x
}

function SearchMap({ pickUp, drop, pickUpLat, pickUpLon, dropLat, dropLon, onChange, onDistance }: Props) {
    const hasValidCoords = Boolean(
        pickUpLat && pickUpLon && dropLat && dropLon &&
        !isNaN(pickUpLat) && !isNaN(pickUpLon) && !isNaN(dropLat) && !isNaN(dropLon) &&
        pickUpLat !== 0 && dropLat !== 0
    );

    const [p1, setP1] = useState<[number, number] | undefined>(
        hasValidCoords ? [pickUpLat!, pickUpLon!] : undefined
    );
    const [p2, setP2] = useState<[number, number] | undefined>(
        hasValidCoords ? [dropLat!, dropLon!] : undefined
    );
    const [route, setRoute] = useState<[number, number][]>([]);
    const [km, setKm] = useState<number | null>(null);
    const [ready, setReady] = useState(false);

    const isDraggingRef = useRef(false);

    const geoCoding = async (q: string): Promise<[number, number] | null> => {
        try {
            // First try geocode search (exact for full addresses)
            const { data } = await axios.get("https://api.geoapify.com/v1/geocode/search", {
                params: {
                    text: q.trim(),
                    limit: 1,
                    lang: "en",
                    filter: "countrycode:in",
                    apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY
                }
            });
            if (data?.features?.length) {
                const [lon, lat] = data.features[0].geometry.coordinates;
                return [lat, lon];
            }

            // Fallback to autocomplete if search yielded no results
            const autoRes = await axios.get("https://api.geoapify.com/v1/geocode/autocomplete", {
                params: {
                    text: q.trim(),
                    limit: 1,
                    lang: "en",
                    filter: "countrycode:in",
                    apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY
                }
            });
            if (autoRes.data?.features?.length) {
                const [lon, lat] = autoRes.data.features[0].geometry.coordinates;
                return [lat, lon];
            }
            return null;
        } catch (error) {
            console.error("Geocoding error:", error);
            return null;
        }
    };

    const reverseGeoCoding = async (lat: number, lon: number): Promise<string | null> => {
        try {
            const { data } = await axios.get("https://api.geoapify.com/v1/geocode/reverse", {
                params: {
                    lat,
                    lon,
                    apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY,
                    filter: "countrycode:in"
                }
            });
            if (!data?.features?.length) return null;
            const p = data.features[0].properties;
            return [p.name, p.street, p.city, p.state, p.country].filter(Boolean).join(", ");
        } catch (error) {
            console.error("Reverse geocoding error:", error);
            return null;
        }
    };

    const loadRoute = useCallback(async (p: [number, number], d: [number, number]) => {
        try {
            const { data } = await axios.get(
                `https://router.project-osrm.org/route/v1/driving/${p[1]},${p[0]};${d[1]},${d[0]}?overview=full&steps=true&geometries=geojson`
            );
            if (data?.routes?.length) {
                setRoute(data.routes[0].geometry.coordinates.map(([lon, lat]: number[]) => [lat, lon]));
                const distKm = +((data.routes[0].distance) / 1000).toFixed(2);
                setKm(distKm);
                onDistance(distKm);
                return;
            }
        } catch (error) {
            console.error("OSRM Route Error:", error);
        }

        // Fallback distance and direct line if OSRM is unavailable
        const dist = calculateHaversineDistance(p[0], p[1], d[0], d[1]);
        setRoute([p, d]);
        setKm(dist);
        onDistance(dist);
    }, [onDistance]);

    const dragPickUp = async (lat: number, lon: number) => {
        isDraggingRef.current = true;
        const newP1: [number, number] = [lat, lon];
        setP1(newP1);
        if (p2) {
            await loadRoute(newP1, p2);
        }
        const addr = await reverseGeoCoding(lat, lon);
        onChange?.(addr || pickUp, drop, newP1, p2);
    };

    const dragDrop = async (lat: number, lon: number) => {
        isDraggingRef.current = true;
        const newP2: [number, number] = [lat, lon];
        setP2(newP2);
        if (p1) {
            await loadRoute(p1, newP2);
        }
        const addr = await reverseGeoCoding(lat, lon);
        onChange?.(pickUp, addr || drop, p1, newP2);
    };

    useEffect(() => {
        // Skip re-geocoding if triggered by drag
        if (isDraggingRef.current) {
            isDraggingRef.current = false;
            return;
        }

        let isCancelled = false;

        const initializePoints = async () => {
            setReady(false);

            let pt1: [number, number] | null = null;
            let pt2: [number, number] | null = null;

            // 1. Coordinates directly provided (highest accuracy)
            if (pickUpLat && pickUpLon && !isNaN(pickUpLat) && !isNaN(pickUpLon) && pickUpLat !== 0) {
                pt1 = [pickUpLat, pickUpLon];
            } else if (pickUp && pickUp.trim()) {
                pt1 = await geoCoding(pickUp);
            }

            if (dropLat && dropLon && !isNaN(dropLat) && !isNaN(dropLon) && dropLat !== 0) {
                pt2 = [dropLat, dropLon];
            } else if (drop && drop.trim()) {
                pt2 = await geoCoding(drop);
            }

            if (isCancelled) return;

            if (pt1 && pt2) {
                setP1(pt1);
                setP2(pt2);
                await loadRoute(pt1, pt2);
                if (!isCancelled) setReady(true);
            } else if (pt1) {
                setP1(pt1);
                if (!isCancelled) setReady(true);
            } else if (pt2) {
                setP2(pt2);
                if (!isCancelled) setReady(true);
            } else {
                if (!isCancelled) setReady(true);
            }
        };

        initializePoints();

        return () => {
            isCancelled = true;
        };
    }, [pickUpLat, pickUpLon, dropLat, dropLon, pickUp, drop, loadRoute]);

    const defaultCenter: [number, number] = p1 || [28.6139, 77.2090];

    return (
        <div className='relative h-full w-full bg-zinc-100'>
            <MapContainer
                style={{ width: "100%", height: "100%" }}
                center={defaultCenter}
                zoom={13}
                zoomControl={false}
            >
                <TileLayer
                    attribution='Powered by <a href="https://www.geoapify.com/">Geoapify</a> | © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`}
                    maxZoom={20}
                />

                <MapRecenter p1={p1} p2={p2} />

                {p1 && (
                    <Marker
                        position={p1}
                        icon={pickUpIcon}
                        draggable
                        eventHandlers={{
                            dragend: e => {
                                const m = e.target.getLatLng();
                                dragPickUp(m.lat, m.lng);
                            }
                        }}
                    />
                )}

                {p2 && (
                    <Marker
                        position={p2}
                        icon={dropIcon}
                        draggable
                        eventHandlers={{
                            dragend: e => {
                                const m = e.target.getLatLng();
                                dragDrop(m.lat, m.lng);
                            }
                        }}
                    />
                )}

                {route.length > 0 && (
                    <Polyline
                        positions={route}
                        pathOptions={{ color: "#0a0a0a", weight: 4, lineCap: "round", lineJoin: "round" }}
                    />
                )}
            </MapContainer>

            <AnimatePresence>
                {!ready && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45 }}
                        className="absolute inset-0 z-[999] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center gap-4"
                    >
                        <div className='relative w-14 h-14 flex items-center justify-center'>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full border-2 border-transparent border-t-zinc-900"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-2 rounded-full border border-transparent border-t-zinc-300"
                            />
                            <MapPin size={15} className="text-zinc-800" />
                        </div>
                        <div className='text-center'>
                            <p className='text-zinc-900 text-xs font-black tracking-[0.22em] uppercase'>Loading Map</p>
                            <p className='text-zinc-400 text-[10px] font-medium tracking-wider mt-0.5'>Plotting your route…</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {ready && km !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute bottom-20 left-4 z-[500] flex items-center gap-2 bg-white border border-zinc-200 px-3.5 py-2 rounded-xl shadow-lg"
                    >
                        <Navigation2 size={13} className="text-zinc-900" />
                        <span className='text-zinc-900 text-xs font-bold'>{km} km</span>
                        <span className='w-px h-3 bg-zinc-200' />
                        <span className='text-xs text-zinc-600 font-semibold'>~{Math.max(3, Math.round((km / 25) * 60))} min</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default SearchMap;
