import type { MediaItem } from "@/types/MediaItem";
import L from "leaflet";
import { createEffect, onCleanup, onMount } from "solid-js";
import "leaflet/dist/leaflet.css";
import { createGeolocation } from "@solid-primitives/geolocation";
import { createPermission } from "@solid-primitives/permission";

interface LatLng {
  lat: number;
  lng: number;
}

interface OverviewMapProps {
  items: MediaItem[];
}

const DEFAULT_LOCATION: LatLng = { lat: 52.5244, lng: 13.4105 };

export function OverviewMap(props: Readonly<OverviewMapProps>) {
  let mapDiv: HTMLDivElement | null = null;
  let map: L.Map | undefined;
  let markers: L.LayerGroup | undefined;

  const permission = createPermission({ name: "geolocation" });

  const [location] = createGeolocation({
    enableHighAccuracy: true,
    timeout: 5000,
  });

  function getCenter(): LatLng {
    if (permission() === "granted" && location()?.latitude && location()?.longitude) {
      return { lat: location().latitude, lng: location().longitude };
    }
    return DEFAULT_LOCATION;
  }

  const setMapDiv = (el: HTMLDivElement) => {
    mapDiv = el;
  };

  onMount(() => {
    if (!mapDiv) return;
    map = L.map(mapDiv).setView([getCenter().lat, getCenter().lng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    markers = L.layerGroup().addTo(map);
    addMarkers();
  });

  createEffect(() => {
    if (map && permission() === "granted" && location()?.latitude && location()?.longitude) {
      map.setView([location().latitude, location().longitude], 13);
    }
  });

  function addMarkers() {
    if (!markers) return;
    markers.clearLayers();
    for (const item of props.items) {
      const pos: LatLng = item.location || getCenter();
      const marker = L.marker([pos.lat, pos.lng]).bindPopup(item.title);
      markers.addLayer(marker);
    }
  }

  onCleanup(() => {
    if (map) map.remove();
  });

  return <div ref={setMapDiv} style="width: 100%; height: 100%; min-height: 400px; z-index: 0;" />;
}
