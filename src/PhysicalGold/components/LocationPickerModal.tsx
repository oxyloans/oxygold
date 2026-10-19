import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, Search, X, MapPin, Loader2, Crosshair, Navigation, Plus, Minus, ArrowRight } from "lucide-react";
import { FaLocationCrosshairs } from "react-icons/fa6";

// Fix for Leaflet default marker icons in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface LocationPickerResult {
    latitude: string;
    longitude: string;
    title: string;
    fullAddress: string;
    flatNo: string;
    landMark: string;
    city: string;
    state: string;
    pinCode: string;
}

interface LocationPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (result: LocationPickerResult) => void;
    initialLat?: number | string;
    initialLng?: number | string;
    initialAddress?: string;
    googleApiKey?: string;
}

// Fallback coordinates (Faridabad NIT / Delhi NCR matching reference screenshot)
const DEFAULT_LAT = 28.3846;
const DEFAULT_LNG = 77.3069;
const GOOGLE_API_KEY_DEFAULT = "AIzaSyAM29otTWBIAefQe6mb7f617BbnXTHtN0M";

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    initialLat,
    initialLng,
    initialAddress,
    googleApiKey = GOOGLE_API_KEY_DEFAULT,
}) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    const [isMapLoading, setIsMapLoading] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);

    // Current coordinates of map center
    const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
        lat: Number(initialLat) || DEFAULT_LAT,
        lng: Number(initialLng) || DEFAULT_LNG,
    });

    // Resolved address details
    const [selectedAddress, setSelectedAddress] = useState<{
        title: string;
        fullAddress: string;
        flatNo: string;
        landMark: string;
        city: string;
        state: string;
        pinCode: string;
    }>({
        title: initialAddress ? initialAddress.split(",")[0] : "Locating delivery area...",
        fullAddress: initialAddress || "Move pin to set your exact location",
        flatNo: "",
        landMark: "",
        city: "",
        state: "",
        pinCode: "",
    });

    // Search input state
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [suggestions, setSuggestions] = useState<
        {
            title: string;
            subtitle: string;
            lat: number;
            lng: number;
            addressDetails?: {
                title: string;
                fullAddress: string;
                flatNo: string;
                landMark: string;
                city: string;
                state: string;
                pinCode: string;
            };
        }[]
    >([]);
    const [isSearching, setIsSearching] = useState(false);

    const geocodeAbortRef = useRef<AbortController | null>(null);
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const moveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /* ── Parse Google Geocode API Result ── */
    const parseGoogleGeocode = (result: any) => {
        const components: any[] = result.address_components || [];
        const getAll = (type: string) =>
            components.filter((c) => c.types.includes(type)).map((c) => c.long_name);
        const get = (type: string) => getAll(type)[0] || "";

        const premise = getAll("premise");
        const subpremise = get("subpremise");
        const streetNumber = get("street_number");
        const route = get("route");
        const sublocality2 = get("sublocality_level_2");
        const sublocality1 = get("sublocality_level_1");
        const neighborhood = get("neighborhood");
        const locality = get("locality");
        const district = get("administrative_area_level_2");
        const city = locality || district || "";
        const state = get("administrative_area_level_1");
        const pinCode = get("postal_code");

        const titleParts = [premise[0], subpremise ? `Flat ${subpremise}` : "", sublocality2, sublocality1, neighborhood, route, city].filter(Boolean);
        const title = titleParts[0] || city || "Selected Location";
        const flatNo = [subpremise ? `Flat ${subpremise}` : "", premise.join(", "), streetNumber].filter(Boolean).join(", ");
        const landMark = [route, sublocality2 || sublocality1 || neighborhood].filter(Boolean).join(", ");
        const fullAddress = (result.formatted_address || "").replace(/,?\s*India$/, "").trim();

        return {
            title,
            fullAddress: fullAddress || [flatNo, landMark, city, state, pinCode].filter(Boolean).join(", "),
            flatNo,
            landMark,
            city,
            state,
            pinCode,
        };
    };

    /* ── Reverse Geocode Coordinates ── */
    const reverseGeocode = useCallback(
        async (lat: number, lng: number) => {
            if (geocodeAbortRef.current) geocodeAbortRef.current.abort();
            geocodeAbortRef.current = new AbortController();
            const signal = geocodeAbortRef.current.signal;

            setIsGeocoding(true);

            // 1. Try Google Geocoding API if key provided
            if (googleApiKey) {
                try {
                    const res = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`,
                        { signal }
                    );
                    if (res.ok) {
                        const data = await res.json();
                        if (data.status === "OK" && data.results?.[0]) {
                            const parsed = parseGoogleGeocode(data.results[0]);
                            setSelectedAddress(parsed);
                            setIsGeocoding(false);
                            return;
                        }
                    }
                } catch (err: any) {
                    if (err.name === "AbortError") return;
                }
            }

            // 2. OpenStreetMap Nominatim reverse geocode (accurate & reliable for India)
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                    {
                        signal,
                        headers: { "Accept-Language": "en-IN,en;q=0.9" },
                    }
                );
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.address) {
                        const a = data.address;
                        const building = a.building || a.house_name || a.amenity || a.office || a.shop || "";
                        const houseNumber = a.house_number || "";
                        const road = a.road || a.street || a.footway || "";
                        const neighborhood = a.suburb || a.neighbourhood || a.residential || a.subdistrict || "";
                        const locality = a.city_district || a.city || a.town || a.village || a.county || "";
                        const state = a.state || "";
                        const pinCode = a.postcode || "";

                        const titleParts = [building, houseNumber ? `House ${houseNumber}` : "", road, neighborhood].filter(Boolean);
                        const title = titleParts[0] || neighborhood || locality || "Selected Location";
                        const flatNo = [building, houseNumber].filter(Boolean).join(", ");
                        const landMark = road || neighborhood || "";
                        const fullAddress = data.display_name
                            ? data.display_name.replace(/, India$/, "").trim()
                            : [flatNo, landMark, neighborhood, locality, state, pinCode].filter(Boolean).join(", ");

                        setSelectedAddress({
                            title,
                            fullAddress,
                            flatNo,
                            landMark,
                            city: locality,
                            state,
                            pinCode,
                        });
                        setIsGeocoding(false);
                        return;
                    }
                }
            } catch (err: any) {
                if (err.name === "AbortError") return;
            }

            // 3. BigDataCloud Fallback
            try {
                const res = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
                    { signal }
                );
                if (res.ok) {
                    const data = await res.json();
                    const locality = data.locality || data.city || "";
                    const state = data.principalSubdivision || "";
                    const pinCode = data.postcode || "";
                    const title = locality || state || "Selected Location";
                    const fullAddress = [data.localityInfo?.informative?.[0]?.name, locality, state, pinCode]
                        .filter(Boolean)
                        .join(", ");

                    setSelectedAddress({
                        title,
                        fullAddress: fullAddress || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
                        flatNo: "",
                        landMark: locality,
                        city: locality,
                        state,
                        pinCode,
                    });
                    setIsGeocoding(false);
                    return;
                }
            } catch (err: any) {
                if (err.name === "AbortError") return;
            }

            // Fallback: Display coordinates
            setSelectedAddress({
                title: "Selected Location",
                fullAddress: `Location at ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
                flatNo: "",
                landMark: "",
                city: "",
                state: "",
                pinCode: "",
            });
            setIsGeocoding(false);
        },
        [googleApiKey]
    );

    /* ── Initialize Leaflet Map ── */
    useEffect(() => {
        if (!isOpen || !mapContainerRef.current) return;

        // Clean up previous map if exists
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        const startLat = Number(initialLat) || DEFAULT_LAT;
        const startLng = Number(initialLng) || DEFAULT_LNG;

        // Create Leaflet Map Instance
        const map = L.map(mapContainerRef.current, {
            center: [startLat, startLng],
            zoom: 16,
            zoomControl: false,
            attributionControl: false,
        });

        mapInstanceRef.current = map;

        // Google Maps Street Map Tiles (Zero watermark, real Google streets, landmarks, and roads)
        const tileLayer = L.tileLayer("https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
            maxZoom: 20,
            subdomains: ["0", "1", "2", "3"],
            attribution: "",
        });

        // OpenStreetMap Standard Tiles fallback if Google tile has error
        const osmFallback = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "",
        });

        tileLayer.on("tileerror", () => {
            if (map && !map.hasLayer(osmFallback)) {
                osmFallback.addTo(map);
            }
        });

        tileLayer.addTo(map);

        // Force map size invalidation so tiles render fully and crisply immediately
        const timer1 = setTimeout(() => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.invalidateSize();
                setIsMapLoading(false);
            }
        }, 120);

        const timer2 = setTimeout(() => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.invalidateSize();
            }
        }, 350);

        // Initial Reverse Geocoding
        reverseGeocode(startLat, startLng);

        // Map movement & tap events
        map.on("click", (e: L.LeafletMouseEvent) => {
            map.panTo(e.latlng, { animate: true });
        });

        map.on("movestart", () => {
            setIsDragging(true);
        });

        map.on("move", () => {
            const center = map.getCenter();
            setCurrentCoords({ lat: center.lat, lng: center.lng });
        });

        map.on("moveend", () => {
            setIsDragging(false);
            const center = map.getCenter();
            setCurrentCoords({ lat: center.lat, lng: center.lng });

            if (moveDebounceRef.current) clearTimeout(moveDebounceRef.current);
            moveDebounceRef.current = setTimeout(() => {
                reverseGeocode(center.lat, center.lng);
            }, 300);
        });

        // Auto-center to user's real GPS location on first open if no coordinates passed
        if (!initialLat && !initialLng && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([pos.coords.latitude, pos.coords.longitude], 17, { animate: true });
                    }
                },
                () => {},
                { enableHighAccuracy: true, timeout: 6000 }
            );
        }

        const handleResize = () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.invalidateSize();
            }
        };
        window.addEventListener("resize", handleResize);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            window.removeEventListener("resize", handleResize);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
            if (moveDebounceRef.current) clearTimeout(moveDebounceRef.current);
            if (geocodeAbortRef.current) geocodeAbortRef.current.abort();
        };
    }, [isOpen, initialLat, initialLng, reverseGeocode]);

    /* ── Move Map to Coordinates ── */
    const panToLocation = (lat: number, lng: number, zoom = 17) => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
        }
        setCurrentCoords({ lat, lng });
    };

    /* ── Locate Me (GPS) Handler ── */
    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setIsLocating(false);
                const { latitude, longitude } = pos.coords;
                panToLocation(latitude, longitude, 17);
            },
            (error) => {
                setIsLocating(false);
                alert("Could not fetch device location. Please enable location permissions.");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    /* ── Zoom Controls ── */
    const handleZoomIn = () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.zoomIn();
        }
    };

    const handleZoomOut = () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.zoomOut();
        }
    };

    /* ── Place Search Autocomplete (Google Geocode + OSM Multi-Provider) ── */
    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

        const trimmed = val.trim();
        if (!trimmed || trimmed.length < 2) {
            setSuggestions([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        searchDebounceRef.current = setTimeout(async () => {
            // 1. Google Geocoding Search (High-accuracy for India areas, buildings, pincodes)
            if (googleApiKey) {
                try {
                    const res = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                            trimmed
                        )}&components=country:IN&key=${googleApiKey}`
                    );
                    if (res.ok) {
                        const data = await res.json();
                        if (data.status === "OK" && Array.isArray(data.results) && data.results.length > 0) {
                            const parsed = data.results.slice(0, 6).map((item: any) => {
                                const details = parseGoogleGeocode(item);
                                const subtitleParts = (item.formatted_address || "")
                                    .replace(/,?\s*India$/, "")
                                    .split(",")
                                    .map((s: string) => s.trim());
                                const title = subtitleParts[0] || details.title;
                                const subtitle = subtitleParts.slice(1).join(", ") || details.fullAddress;
                                return {
                                    title,
                                    subtitle,
                                    lat: item.geometry.location.lat,
                                    lng: item.geometry.location.lng,
                                    addressDetails: details,
                                };
                            });
                            setSuggestions(parsed);
                            setIsSearching(false);
                            return;
                        }
                    }
                } catch {
                    // Fall through to Nominatim
                }
            }

            // 2. OpenStreetMap Nominatim Search (India-specific)
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                        trimmed
                    )}&countrycodes=in&addressdetails=1&limit=6`
                );
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        const parsed = data.map((item: any) => {
                            const parts = (item.display_name || "").split(",").map((s: string) => s.trim());
                            const title = parts[0] || item.name || "Location";
                            const subtitle = parts.slice(1).join(", ");
                            const addr = item.address || {};
                            return {
                                title,
                                subtitle,
                                lat: parseFloat(item.lat),
                                lng: parseFloat(item.lon),
                                addressDetails: {
                                    title,
                                    fullAddress: item.display_name || "",
                                    flatNo: addr.house_number || "",
                                    landMark: addr.road || addr.suburb || "",
                                    city: addr.city || addr.town || addr.village || addr.county || "",
                                    state: addr.state || "",
                                    pinCode: addr.postcode || "",
                                },
                            };
                        });
                        setSuggestions(parsed);
                        setIsSearching(false);
                        return;
                    }
                }
            } catch {
                // Fall through to Photon
            }

            // 3. Photon Komoot API with map center coordinate bias
            try {
                const res = await fetch(
                    `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&lat=${currentCoords.lat}&lon=${currentCoords.lng}&limit=6`
                );
                if (res.ok) {
                    const data = await res.json();
                    if (data.features && data.features.length > 0) {
                        const parsed = data.features.map((f: any) => {
                            const p = f.properties || {};
                            const title = p.name || p.street || p.city || "Place";
                            const subtitle = [p.district, p.city, p.state, p.country].filter(Boolean).join(", ");
                            return {
                                title,
                                subtitle,
                                lat: f.geometry.coordinates[1],
                                lng: f.geometry.coordinates[0],
                            };
                        });
                        setSuggestions(parsed);
                        setIsSearching(false);
                        return;
                    }
                }
            } catch {
                // Done
            }

            setSuggestions([]);
            setIsSearching(false);
        }, 280);
    };

    const handleSelectSuggestion = (item: {
        title: string;
        subtitle: string;
        lat: number;
        lng: number;
        addressDetails?: any;
    }) => {
        setSearchQuery(item.title);
        setSuggestions([]);
        setIsSearchFocused(false);
        if (item.addressDetails) {
            setSelectedAddress(item.addressDetails);
        }
        panToLocation(item.lat, item.lng, 17);
    };

    /* ── Confirm Location ── */
    const handleConfirm = () => {
        onConfirm({
            latitude: String(currentCoords.lat),
            longitude: String(currentCoords.lng),
            title: selectedAddress.title,
            fullAddress: selectedAddress.fullAddress,
            flatNo: selectedAddress.flatNo,
            landMark: selectedAddress.landMark,
            city: selectedAddress.city,
            state: selectedAddress.state,
            pinCode: selectedAddress.pinCode,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
            {/* Main Responsive Container: Fullscreen on mobile, centered modal on tablet & desktop */}
            <div className="relative w-full h-full sm:h-[88vh] sm:max-h-[780px] sm:max-w-xl md:max-w-2xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col font-sans transition-all">
                <style>{`
                    .leaflet-control-attribution {
                        display: none !important;
                    }
                    .leaflet-container {
                        font-family: inherit;
                        outline: none;
                    }
                `}</style>
                
                {/* ── TOP HEADER / SEARCH BAR (FLOATING) ── */}
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-[1010] flex items-center gap-2 sm:gap-2.5">
                    {/* Back Button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition-all shrink-0 cursor-pointer"
                        aria-label="Back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    {/* Search Input Box */}
                    <div className="flex-1 relative">
                        <div className="flex items-center gap-2.5 bg-white rounded-2xl shadow-md border border-gray-100 px-3.5 py-2.5 h-10 sm:h-11">
                            <Search className="w-4 h-4 text-gray-400 shrink-0" />
                            <input
                                type="text"
                                value={searchQuery}
                                onFocus={() => setIsSearchFocused(true)}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Search for building, street or area, pincode"
                                className="w-full bg-transparent text-[13px] sm:text-[14px] text-gray-800 placeholder-gray-400 outline-none"
                            />
                            {isSearching ? (
                                <Loader2 className="w-4 h-4 animate-spin text-gray-400 shrink-0" />
                            ) : searchQuery ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSuggestions([]);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            ) : null}
                        </div>

                        {/* Search Dropdown with Autocomplete Suggestions (Like Swiggy, Zomato, Google Maps) */}
                        {isSearchFocused && searchQuery.trim().length >= 2 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[1020] max-h-72 overflow-y-auto divide-y divide-gray-100 animate-in fade-in slide-in-from-top-1 duration-150">
                                {isSearching ? (
                                    <div className="px-4 py-3.5 text-[12px] text-gray-500 flex items-center gap-2.5 bg-[#FAF7F0]/50">
                                        <Loader2 className="w-4 h-4 animate-spin text-[#8B6914] shrink-0" />
                                        <span>Searching places for &quot;{searchQuery}&quot;...</span>
                                    </div>
                                ) : suggestions.length > 0 ? (
                                    suggestions.map((item, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => handleSelectSuggestion(item)}
                                            className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-[#FAF7F0] active:bg-[#F5EDD6]/60 transition cursor-pointer group"
                                        >
                                            <div className="w-7 h-7 rounded-full bg-[#F5EDD6] border border-[#E8E0D5] flex items-center justify-center shrink-0 mt-0.5 text-[#8B6914] group-hover:scale-105 transition-transform">
                                                <MapPin className="w-3.5 h-3.5 text-[#8B6914]" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[13px] font-bold text-gray-900 group-hover:text-[#8B6914] truncate transition-colors">
                                                    {item.title}
                                                </p>
                                                <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5 leading-relaxed">
                                                    {item.subtitle}
                                                </p>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-4 text-center bg-gray-50/50">
                                        <p className="text-[12px] font-semibold text-gray-700">
                                            No locations found for &quot;{searchQuery}&quot;
                                        </p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                            Try searching with area, street, landmark or pincode
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── MAP CONTAINER ── */}
                <div
                    className="relative flex-1 w-full bg-[#f4f3f0] overflow-hidden min-h-[380px] sm:min-h-[440px]"
                    onClick={() => setIsSearchFocused(false)}
                >
                    {/* Leaflet map DOM node with explicit styling */}
                    <div
                        ref={mapContainerRef}
                        className="w-full h-full"
                        style={{ minHeight: "380px", height: "100%", width: "100%", zIndex: 1 }}
                    />

                    {isMapLoading && (
                        <div className="absolute inset-0 bg-[#f8f7f4] flex flex-col items-center justify-center gap-3 z-[900]">
                            <Loader2 className="w-8 h-8 animate-spin text-[#8B6914]" />
                            <p className="text-[13px] text-gray-600 font-medium">Loading interactive map...</p>
                        </div>
                    )}

                    {/* ── GROUND SHADOW & RADAR TARGET (EXACT MAP CENTER) ── */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[999] flex items-center justify-center">
                        {/* Radar Target Pulse Wave */}
                        <div
                            className={`w-9 h-9 rounded-full bg-[#8B6914]/15 border border-[#8B6914]/30 transition-all duration-300 ${
                                isDragging ? "scale-125 opacity-30 animate-pulse" : "scale-100 opacity-60"
                            }`}
                        />
                        {/* Ground Shadow */}
                        <div
                            className={`absolute w-4 h-1.5 bg-black/40 rounded-full blur-[1px] transition-all duration-200 ${
                                isDragging ? "scale-50 opacity-20" : "scale-100 opacity-70"
                            }`}
                        />
                    </div>

                    {/* ── SWIGGY / ZOMATO STYLE TEARDROP PIN WITH "DELIVER HERE" BADGE ── */}
                    <div
                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 pointer-events-none z-[1000] flex flex-col items-center transition-transform duration-200 ease-out ${
                            isDragging ? "-translate-y-[calc(100%+10px)] scale-105" : "-translate-y-full scale-100"
                        }`}
                    >
                        {/* Floating "Order will be delivered here" Badge */}
                        <div className="flex flex-col items-center mb-1">
                            <div
                                className={`px-2.5 py-1 rounded-full bg-slate-900/95 text-white shadow-xl border border-white/15 backdrop-blur-xs flex items-center gap-1.5 transition-all duration-200 ${
                                    isDragging ? "opacity-90 scale-95" : "opacity-100 scale-100"
                                }`}
                            >
                                <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                        isDragging ? "bg-amber-400 animate-ping" : "bg-emerald-400"
                                    }`}
                                />
                                <span className="text-[10px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap">
                                    {isDragging ? "Release to set location" : "Order will be delivered here"}
                                </span>
                            </div>
                            {/* Downward Pointer Beak */}
                            <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900/95 -mt-px" />
                        </div>

                        {/* Classic Teardrop Location Pin (Theme Gold) */}
                        <svg
                            width="36"
                            height="46"
                            viewBox="0 0 38 48"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="drop-shadow-lg"
                        >
                            <path
                                d="M19 0C8.50659 0 0 8.50659 0 19C0 30.2 16.5 46.5 17.8 47.7C18.4 48.3 19.6 48.3 20.2 47.7C21.5 46.5 38 30.2 38 19C38 8.50659 29.4934 0 19 0Z"
                                fill="#8B6914"
                            />
                            <circle cx="19" cy="18" r="7" fill="white" />
                            <circle cx="19" cy="18" r="3.5" fill="#8B6914" />
                        </svg>
                    </div>

                    {/* ── DESKTOP/TABLET ZOOM CONTROLS (+ / -) ── */}
                    <div className="hidden sm:flex absolute right-4 bottom-18 z-[1000] flex-col rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden divide-y divide-gray-100">
                        <button
                            type="button"
                            onClick={handleZoomIn}
                            className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition cursor-pointer"
                            title="Zoom In"
                            aria-label="Zoom in"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={handleZoomOut}
                            className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition cursor-pointer"
                            title="Zoom Out"
                            aria-label="Zoom out"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* ── FLOATING "USE MY CURRENT LOCATION" PILL BUTTON ── */}
                    <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
                        <button
                            type="button"
                            onClick={handleLocateMe}
                            disabled={isLocating}
                            className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-full bg-white shadow-xl border border-gray-100 text-[12px] sm:text-[13px] font-bold text-[#8B6914] hover:bg-gray-50 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                        >
                            {isLocating ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8B6914]" />
                            ) : (
                                <FaLocationCrosshairs className="w-3.5 h-3.5 text-[#8B6914]" />
                            )}
                            <span>Use my current Location</span>
                        </button>
                    </div>
                </div>

                {/* ── BOTTOM CONFIRMATION SHEET (COMPACT FOR MAXIMUM MAP DISPLAY & UX) ── */}
                <div className="relative z-[1010] bg-white rounded-t-2xl sm:rounded-t-3xl border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-4 py-3 sm:px-5 sm:py-4">
                    {/* Header Label: DELIVER TO (Clean, no extra subtitle) */}
                    <div className="mb-1.5">
                        <span className="text-[10px] sm:text-[11px] font-black text-gray-500 tracking-wider uppercase">
                            DELIVER TO
                        </span>
                    </div>

                    {/* Address Preview Box */}
                    <div className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-[#FAFAF8] border border-[#E8E0D5]">
                        {/* Theme Gold Icon Container */}
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F5EDD6] border border-[#E8E0D5] flex items-center justify-center shrink-0 mt-0.5 text-[#8B6914]">
                            <MapPin className="w-3.5 h-3.5 text-[#8B6914]" />
                        </div>

                        {/* Title and Address Details */}
                        <div className="flex-1 min-w-0">
                            {isDragging ? (
                                <div className="py-0.5">
                                    <h4 className="text-[13px] sm:text-[14px] font-bold text-[#8B6914] truncate leading-tight animate-pulse">
                                        Adjusting pin location...
                                    </h4>
                                    <p className="text-[11px] sm:text-[12px] text-gray-400 line-clamp-2 mt-0.5 leading-snug">
                                        Release to detect exact address
                                    </p>
                                </div>
                            ) : isGeocoding ? (
                                <div className="space-y-1 py-0.5">
                                    <div className="h-3.5 w-28 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-2.5 w-44 bg-gray-200 rounded animate-pulse" />
                                </div>
                            ) : (
                                <>
                                    <h4 className="text-[13px] sm:text-[14px] font-bold text-[#1A1A1A] truncate leading-tight">
                                        {selectedAddress.title || "Selected Location"}
                                    </h4>
                                    <p className="text-[11px] sm:text-[12px] text-gray-600 line-clamp-2 mt-0.5 leading-snug">
                                        {selectedAddress.fullAddress}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Confirm & Proceed Button (Theme Gold with Reduced Font Size) */}
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isGeocoding || isDragging}
                        className="w-full mt-2.5 sm:mt-3 py-2.5 sm:py-3 px-4 rounded-xl bg-[#8B6914] hover:bg-[#7A5C10] active:scale-[0.99] text-white text-[13px] sm:text-[14px] font-semibold tracking-wide shadow-md shadow-[#8B6914]/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                        <span>Confirm & Proceed</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Secondary Link: Enter Address Manually */}
                    <div className="text-center mt-1.5 sm:mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-[11px] sm:text-[12px] text-gray-400 hover:text-gray-700 font-medium transition cursor-pointer"
                        >
                            Enter address details manually
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LocationPickerModal;
