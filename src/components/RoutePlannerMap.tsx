import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { motion } from "framer-motion";

export interface MapStop {
  id?: string;
  name: string;
  lat: number;
  lng: number;
}

interface RoutePlannerMapProps {
  origin: MapStop;
  stops: MapStop[];
  optimizedOrder?: string[];
}

const FALLBACK_CENTER: [number, number] = [0, 20];

const RoutePlannerMap = ({ origin, stops, optimizedOrder }: RoutePlannerMapProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [styleReady, setStyleReady] = useState(false);

  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [tokenStatus, setTokenStatus] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    let isMounted = true;
    const loadToken = async () => {
      try {
        const response = await fetch("/api/config/mapbox-token");
        if (!response.ok) {
          throw new Error(`Failed to fetch Mapbox token: ${response.statusText}`);
        }
        const payload: { success: boolean; token: string | null } = await response.json();
        if (!isMounted) return;
        if (payload.success && payload.token) {
          setMapboxToken(payload.token);
          setTokenStatus("ready");
        } else {
          setTokenStatus("missing");
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setTokenStatus("missing");
        }
      }
    };

    loadToken();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasToken = tokenStatus === "ready" && mapboxToken.length > 0;

  const safeOrigin = useMemo(() => {
    if (!origin || isNaN(origin.lat) || isNaN(origin.lng)) {
      return { name: "Origin", lat: FALLBACK_CENTER[1], lng: FALLBACK_CENTER[0] };
    }
    return origin;
  }, [origin]);

  const orderedStops = useMemo(() => {
    const safeStops = stops ?? [];
    if (!optimizedOrder?.length) return safeStops;
    const lookup = new Map<string, MapStop>();
    safeStops.forEach((stop) => lookup.set(stop.name ?? stop.id ?? stop.lat.toString(), stop));
    return optimizedOrder
      .map((key) => lookup.get(key) ?? safeStops.find((stop) => stop.name === key))
      .filter((stop): stop is MapStop => Boolean(stop));
  }, [optimizedOrder, stops]);

  useEffect(() => {
    if (!hasToken || !mapContainer.current || mapRef.current) return;

    mapboxgl.accessToken = mapboxToken;

    const initialCenter: [number, number] = [safeOrigin.lng ?? FALLBACK_CENTER[0], safeOrigin.lat ?? FALLBACK_CENTER[1]];

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: initialCenter,
      zoom: 3,
    });

    const mapInstance = mapRef.current;

    const handleLoad = () => setStyleReady(true);
    mapInstance.on("load", handleLoad);

    return () => {
      mapInstance.off("load", handleLoad);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [hasToken, mapboxToken, safeOrigin]);

  useEffect(() => {
    if (!mapRef.current || !styleReady) return;

    const map = mapRef.current;

    const tryUpdate = () => {
      if (!map.isStyleLoaded()) {
        setTimeout(tryUpdate, 100);
        return;
      }
      updateMapContent(map);
    };

    tryUpdate();

    function updateMapContent(instance: mapboxgl.Map) {
      const markers = document.querySelectorAll(".route-planner-map-marker");
      markers.forEach((marker) => marker.remove());

      if (instance.getLayer("route-line")) instance.removeLayer("route-line");
      if (instance.getSource("route-line")) instance.removeSource("route-line");

      const originEl = document.createElement("div");
      originEl.className = "route-planner-map-marker";
      originEl.style.cssText = `
        background:#f97316; width:20px; height:20px; border-radius:50%;
        border:3px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.35);
      `;

      new mapboxgl.Marker(originEl)
        .setLngLat([safeOrigin.lng, safeOrigin.lat])
        .setPopup(new mapboxgl.Popup({ offset: 12 }).setHTML(`<strong>${safeOrigin.name}</strong><br/>Origin`))
        .addTo(instance);

      orderedStops.forEach((stop, index) => {
        if (!stop || isNaN(stop.lat) || isNaN(stop.lng)) return;
        const el = document.createElement("div");
        el.className = "route-planner-map-marker";
        el.style.cssText = `
          background:#22d3ee; width:28px; height:28px; border-radius:50%;
          border:3px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.35);
          display:flex; align-items:center; justify-content:center; color:#0f172a;
          font-weight:700; font-size:12px;
        `;
        el.textContent = String(index + 1);

        new mapboxgl.Marker(el)
          .setLngLat([stop.lng, stop.lat])
          .setPopup(new mapboxgl.Popup({ offset: 12 }).setHTML(`<strong>${stop.name}</strong><br/>Stop ${index + 1}`))
          .addTo(instance);
      });

      const coordinates: [number, number][] = [[safeOrigin.lng, safeOrigin.lat]];
      orderedStops.forEach((stop) => {
        if (!stop || isNaN(stop.lat) || isNaN(stop.lng)) return;
        coordinates.push([stop.lng, stop.lat]);
      });

      instance.addSource("route-line", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates,
          },
        },
      });

      instance.addLayer({
        id: "route-line",
        type: "line",
        source: "route-line",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#22d3ee",
          "line-width": 4,
          "line-opacity": 0.85,
        },
      });

      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([safeOrigin.lng, safeOrigin.lat]);
      orderedStops.forEach((stop) => {
        if (!stop || isNaN(stop.lat) || isNaN(stop.lng)) return;
        bounds.extend([stop.lng, stop.lat]);
      });

      if (!bounds.isEmpty()) {
        instance.fitBounds(bounds, { padding: 64, maxZoom: 7, duration: 1200 });
      }
    }
  }, [orderedStops, safeOrigin, styleReady]);

  if (!hasToken) {
    return (
      <div className="w-full h-full bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center p-10">
        {tokenStatus === "loading" ? (
          <>
            <h3 className="text-lg font-semibold text-white mb-2">Loading Map…</h3>
            <p className="text-sm text-white/60">Fetching Mapbox configuration</p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-white mb-2">Map Visualization Disabled</h3>
            <p className="text-sm text-white/60 mb-3">
              Add your Mapbox token to enable the live route map.
            </p>
            <code className="px-3 py-2 rounded-lg bg-white/10 text-xs text-white/80">
              MAPBOX_TOKEN=pk...
            </code>
          </>
        )}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
    </motion.div>
  );
};

export default RoutePlannerMap;
