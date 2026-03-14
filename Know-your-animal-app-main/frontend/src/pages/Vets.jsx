import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Phone, Clock, Navigation, Loader2, MapPinOff, List, X, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/data/translations";
import "leaflet/dist/leaflet.css";

// ── Custom marker icons ──────────────────────────────────────────────
const createIcon = (color, size = 32) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:3px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
    "><svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });

const vetIcon = createIcon("#16a34a", 36);
const userIcon = createIcon("#2563eb", 40);

// ── Component to recenter map ────────────────────────────────────────
function RecenterMap({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom || 14, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// ── Fetch nearby vets from Overpass API ──────────────────────────────
async function fetchNearbyVets(lat, lon, radiusMeters = 10000) {
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="veterinary"](around:${radiusMeters},${lat},${lon});
      way["amenity"="veterinary"](around:${radiusMeters},${lat},${lon});
    );
    out center body;
  `;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch vet data");
  const data = await res.json();

  return data.elements.map((el) => {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    const tags = el.tags || {};
    return {
      id: el.id,
      lat,
      lon,
      name: tags.name || "Veterinary Clinic",
      address:
        [tags["addr:street"], tags["addr:housenumber"], tags["addr:city"]]
          .filter(Boolean)
          .join(", ") || tags["addr:full"] || "",
      phone: tags.phone || tags["contact:phone"] || "",
      hours: tags.opening_hours || "",
      website: tags.website || tags["contact:website"] || "",
    };
  });
}

// ── Distance helper ──────────────────────────────────────────────────
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ═════════════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════════════
const Vets = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [userPos, setUserPos] = useState(null);
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVet, setSelectedVet] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(13);
  const markerRefs = useRef({});

  // Default location (India center) if geolocation fails
  const DEFAULT_POS = [20.5937, 78.9629];

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      setMapCenter(DEFAULT_POS);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPos([latitude, longitude]);
        setMapCenter([latitude, longitude]);

        try {
          const results = await fetchNearbyVets(latitude, longitude, 10000);
          // Sort by distance
          results.sort(
            (a, b) =>
              getDistanceKm(latitude, longitude, a.lat, a.lon) -
              getDistanceKm(latitude, longitude, b.lat, b.lon)
          );
          setVets(results);
          if (results.length === 0) {
            setError("No veterinary clinics found nearby. Try expanding the search area.");
          }
        } catch {
          setError("Failed to fetch nearby vets. Please try again later.");
        }
        setLoading(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError(
          "Location access denied. Please enable location services to find vets near you."
        );
        setMapCenter(DEFAULT_POS);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const handleVetClick = (vet) => {
    setSelectedVet(vet.id);
    setMapCenter([vet.lat, vet.lon]);
    setMapZoom(16);
    // Open the popup on the marker
    setTimeout(() => {
      markerRefs.current[vet.id]?.openPopup();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-16 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-4 py-6 md:py-8">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                  🐾 Find Vets Near You
                </h1>
                <p className="text-muted-foreground max-w-xl">
                  Discover veterinary clinics around your location on the interactive map.
                  {vets.length > 0 && (
                    <span className="ml-1 font-medium text-primary">
                      {vets.length} clinic{vets.length !== 1 ? "s" : ""} found nearby!
                    </span>
                  )}
                </p>
              </div>
              {/* Toggle sidebar on mobile */}
              <button
                onClick={() => setSidebarOpen((o) => !o)}
                className="md:hidden p-2 rounded-lg bg-card border border-border shadow-sm"
                title="Toggle vet list"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex-1 flex items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-lg">Detecting your location & finding nearby vets…</span>
          </div>
        )}

        {/* Map + Sidebar */}
        {!loading && (
          <div className="flex-1 flex flex-col md:flex-row relative" style={{ minHeight: "calc(100vh - 200px)" }}>
            {/* Sidebar — vet list */}
            <div
              className={`
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden"}
                absolute md:relative z-20 top-0 left-0 bottom-0
                w-80 md:w-96 bg-card border-r border-border
                transition-all duration-300 ease-in-out
                flex flex-col shadow-lg md:shadow-none
              `}
            >
              <div className="p-4 border-b border-border flex items-center justify-between bg-card/95 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="font-display font-semibold text-lg">
                    Nearby Clinics
                  </h2>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden p-1 rounded hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {error && vets.length === 0 && (
                  <div className="p-6 text-center">
                    <MapPinOff className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">{error}</p>
                  </div>
                )}

                {vets.map((vet) => {
                  const dist = userPos
                    ? getDistanceKm(userPos[0], userPos[1], vet.lat, vet.lon).toFixed(1)
                    : null;
                  const isActive = selectedVet === vet.id;

                  return (
                    <button
                      key={vet.id}
                      onClick={() => handleVetClick(vet)}
                      className={`
                        w-full text-left p-4 border-b border-border/50 transition-colors
                        hover:bg-primary/5
                        ${isActive ? "bg-primary/10 border-l-4 border-l-primary" : ""}
                      `}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground text-sm leading-tight">
                          {vet.name}
                        </h3>
                        {dist && (
                          <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {dist} km
                          </span>
                        )}
                      </div>

                      {vet.address && (
                        <div className="flex items-start gap-1.5 mt-2 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>{vet.address}</span>
                        </div>
                      )}
                      {vet.phone && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span>{vet.phone}</span>
                        </div>
                      )}
                      {vet.hours && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span>{vet.hours}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative z-10">
              {mapCenter && (
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  scrollWheelZoom={true}
                  className="w-full h-full"
                  style={{ minHeight: "500px" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <RecenterMap center={mapCenter} zoom={mapZoom} />

                  {/* User position marker */}
                  {userPos && (
                    <Marker position={userPos} icon={userIcon}>
                      <Popup className="custom-popup">
                        <div className="text-center p-1">
                          <p className="font-semibold text-sm flex items-center gap-1 justify-center">
                            <Navigation className="h-3.5 w-3.5 text-blue-600" />
                            Your Location
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Vet markers */}
                  {vets.map((vet) => (
                    <Marker
                      key={vet.id}
                      position={[vet.lat, vet.lon]}
                      icon={vetIcon}
                      ref={(ref) => {
                        if (ref) markerRefs.current[vet.id] = ref;
                      }}
                      eventHandlers={{
                        click: () => setSelectedVet(vet.id),
                      }}
                    >
                      <Popup className="custom-popup" maxWidth={280}>
                        <div className="p-1">
                          <h3 className="font-bold text-sm text-gray-900 mb-1">
                            {vet.name}
                          </h3>
                          {vet.address && (
                            <p className="text-xs text-gray-600 flex items-start gap-1 mb-1">
                              <MapPin className="h-3 w-3 shrink-0 mt-0.5 text-green-600" />
                              {vet.address}
                            </p>
                          )}
                          {vet.phone && (
                            <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                              <Phone className="h-3 w-3 shrink-0 text-green-600" />
                              <a href={`tel:${vet.phone}`} className="underline hover:text-green-700">
                                {vet.phone}
                              </a>
                            </p>
                          )}
                          {vet.hours && (
                            <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                              <Clock className="h-3 w-3 shrink-0 text-green-600" />
                              {vet.hours}
                            </p>
                          )}
                          {vet.website && (
                            <a
                              href={vet.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                            >
                              <ExternalLink className="h-3 w-3" /> Visit Website
                            </a>
                          )}
                          {userPos && (
                            <div className="mt-2 pt-1.5 border-t border-gray-200">
                              <a
                                href={`https://www.google.com/maps/dir/${userPos[0]},${userPos[1]}/${vet.lat},${vet.lon}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <Navigation className="h-3 w-3" />
                                Get Directions ({getDistanceKm(userPos[0], userPos[1], vet.lat, vet.lon).toFixed(1)} km)
                              </a>
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}

              {/* Floating button to open sidebar on mobile */}
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden absolute top-4 left-4 z-30 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all"
                  title="Show vet list"
                >
                  <List className="h-5 w-5" />
                  {vets.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center font-bold">
                      {vets.length}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Vets;
