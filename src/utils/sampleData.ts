import type { MediaItem } from "@/types/MediaItem";
import { createId } from "@paralleldrive/cuid2";

interface AlbumChart {
  position: number;
  artist: string;
  album: string;
  image?: string;
  location?: { lat: number; lng: number };
}

let cachedAlbumCharts: AlbumChart[] | null = null;

async function loadAlbumCharts(): Promise<AlbumChart[]> {
  if (cachedAlbumCharts) {
    return cachedAlbumCharts;
  }

  try {
    const response = await fetch("./data/albumCharts.json");
    if (response.ok) {
      const charts = await response.json();
      if (Array.isArray(charts) && charts.length > 0) {
        cachedAlbumCharts = charts;
        return charts;
      }
    }
  } catch {
    console.warn("Could not load album charts, using fallback data");
  }

  const fallbackCharts = getFallbackCharts();
  cachedAlbumCharts = fallbackCharts;
  return fallbackCharts;
}

function getFallbackCharts(): AlbumChart[] {
  return Array.from({ length: 30 }, (_, index) => ({
    position: index + 1,
    artist: createId(),
    album: createId(),
    image: `https://picsum.photos/300/300?random=${createId()}`,
  }));
}

function getAlbumChartsSync(): AlbumChart[] {
  return cachedAlbumCharts || getFallbackCharts();
}

export async function generateSampleMediaItems(count = 30): Promise<MediaItem[]> {
  const charts = await loadAlbumCharts();
  const itemsToGenerate = Math.min(count, charts.length);
  return Array.from({ length: itemsToGenerate }, (_, index) => {
    const chart = charts[index];
    return {
      id: createId(),
      title: `${chart.artist} - ${chart.album}`,
      src: chart.image || "",
      added: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      storageType: "remote",
      location: chart.location,
    };
  });
}

export function generateRandomMediaItem(): MediaItem {
  const charts = getAlbumChartsSync();
  const randomChart = charts[Math.floor(Math.random() * charts.length)];

  return {
    id: createId(),
    title: `${randomChart.artist} - ${randomChart.album}`,
    src: randomChart.image || "",
    added: new Date(),
    storageType: "remote",
  };
}

export async function getAlbumCharts(): Promise<AlbumChart[]> {
  return await loadAlbumCharts();
}

/**
 * Preloads album charts data for synchronous access
 * Call this early in your app initialization
 */
export async function preloadAlbumCharts(): Promise<void> {
  await loadAlbumCharts();
}

export type { AlbumChart };
