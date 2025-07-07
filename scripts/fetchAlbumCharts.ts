import { createId } from "@paralleldrive/cuid2";

interface AlbumChart {
 position: number;
 artist: string;
 album: string;
 image?: string;
 storageType: "remote";
}

const CHARTS_URL = "https://www.offiziellecharts.de/charts/album";
async function fetchAlbumCharts(): Promise<AlbumChart[]> {
 try {
  const response = await fetch(CHARTS_URL);

  if (!response.ok) {
   throw new Error(`HTTP error! status: ${response.status}`);
  }

  const html = await response.text();
  const charts: AlbumChart[] = [];
  const trRegex = /<tr class="drill-down-link"[^>]*>([\s\S]*?)<\/tr>/g;
  let trMatch: RegExpExecArray | null = null;

  trMatch = trRegex.exec(html);
  while (trMatch !== null) {
   const trContent = trMatch[1];

   let position = 0;
   const positionMatch1 = trContent.match(
    /<span class="this-week[^"]*"[^>]*>(\d+)<\/span>/
   );
   const positionMatch2 = trContent.match(
    /<td[^>]*class="[^"]*ch-pos[^"]*"[^>]*>[\s\S]*?(\d+)[\s\S]*?<\/td>/
   );
   const positionMatch3 = trContent.match(/>\s*(\d+)\s*</);
   if (positionMatch1) {
    position = Number.parseInt(positionMatch1[1], 10);
   } else if (positionMatch2) {
    position = Number.parseInt(positionMatch2[1], 10);
   } else if (positionMatch3) {
    position = Number.parseInt(positionMatch3[1], 10);
   }

   let title = "";
   const titleMatch1 = trContent.match(
    /<span class="info-title[^"]*"[^>]*>([^<]+)<\/span>/
   );
   const titleMatch2 = trContent.match(
    /<[^>]*class="[^"]*track-title[^"]*"[^>]*>([^<]+)</
   );
   const titleMatch3 = trContent.match(/<a[^>]+title="([^"]+)"/);

   if (titleMatch1) {
    title = titleMatch1[1].trim();
   } else if (titleMatch2) {
    title = titleMatch2[1].trim();
   } else if (titleMatch3) {
    title = titleMatch3[1].trim();
   }

   let artist = "";
   const artistMatch1 = trContent.match(
    /<span class="info-artist[^"]*"[^>]*>([^<]+)<\/span>/
   );
   const artistMatch2 = trContent.match(
    /<[^>]*class="[^"]*artist[^"]*"[^>]*>([^<]+)</
   );

   if (artistMatch1) {
    artist = artistMatch1[1].trim();
   } else if (artistMatch2) {
    artist = artistMatch2[1].trim();
   }

   if (!artist || !title) {
    const combinedMatch = trContent.match(/<a[^>]+title="([^"]+)"/);
    if (combinedMatch) {
     const combined = combinedMatch[1];

     const splitMatch = combined.match(/^(.+?)\s*[-:]\s*(.+)$/);
     if (splitMatch) {
      artist = artist || splitMatch[1].trim();
      title = title || splitMatch[2].trim();
     } else {
      title = title || combined.trim();
     }
    }
   }
   let imageUrl = "";

   const coverTdMatch = trContent.match(
    /<td class="ch-cover"[^>]*>([\s\S]*?)<\/td>/
   );
   if (coverTdMatch) {
    const coverTdContent = coverTdMatch[1];

    const coverUrlMatch = coverTdContent.match(
     /background:\s*url\(['"]?([^'"]+)['"]?\)/
    );
    if (coverUrlMatch) {
     const imagePath = coverUrlMatch[1];
     imageUrl = imagePath.startsWith("http")
      ? imagePath
      : `https://www.offiziellecharts.de${imagePath}`;
    }
   }

   if (!imageUrl) {
    const coverMatch = trContent.match(
     /background-image:\s*url\(['"]?([^'"]+)['"]?\)/
    );
    if (coverMatch) {
     imageUrl = coverMatch[1].startsWith("http")
      ? coverMatch[1]
      : `https://www.offiziellecharts.de${coverMatch[1]}`;
    }
   }

   if (position > 0 && title && position <= 100) {
    artist = artist
     .replace(/&amp;/g, "&")
     .replace(/&quot;/g, '"')
     .replace(/&#39;/g, "'");
    title = title
     .replace(/&amp;/g, "&")
     .replace(/&quot;/g, '"')
     .replace(/&#39;/g, "'");
    charts.push({
     position,
     artist: artist || "Unknown Artist",
     album: title,
     image: imageUrl,
     storageType: "remote",
    });
   }

   trMatch = trRegex.exec(html);
  }
  if (charts.length > 0) {
   console.log(`Successfully parsed ${charts.length} chart entries`);
   return charts.sort((a, b) => a.position - b.position);
  }

  return getDefaultCharts();
 } catch (error) {
  console.error(
   "Error fetching album charts:",
   error instanceof Error ? error.message : String(error)
  );
  return getDefaultCharts();
 }
}

function getDefaultCharts(length = 30): AlbumChart[] {
 const randomImages = Array.from(
  { length },
  (_, index) => `https://picsum.photos/300/300?random=${index + 1}`
 );

 return Array.from({ length }, (_, index) => ({
  position: index + 1,
  artist: createId(),
  album: createId(),
  image: randomImages[index],
 }));
}

async function getAlbumByPosition(
 position?: number
): Promise<AlbumChart | AlbumChart[] | null> {
 const charts = await fetchAlbumCharts();
 if (charts.length === 0) {
  console.error("No chart data available");
  return null;
 }
 if (position) {
  const album = charts.find((item) => item.position === position);
  if (album) {
   return album;
  }
  console.error(`Position ${position} not found in charts`);
  return null;
 }

 return charts.slice(0, 30);
}

async function writeChartsToFile(charts: AlbumChart[]): Promise<void> {
 try {
  const outputPath = "public/data/albumCharts.json";
  const jsonData = JSON.stringify(charts, null, 2);
  await Bun.write(outputPath, jsonData);
  console.log(`Chart data written to ${outputPath}`);
 } catch (error) {
  console.error(
   "Error writing chart data:",
   error instanceof Error ? error.message : String(error)
  );
 }
}

async function main(): Promise<void> {
 const args = process.argv.slice(2);
 const position = args[0] ? Number.parseInt(args[0], 10) : undefined;
 if (position && (position < 1 || position > 100)) {
  console.error("Position must be between 1 and 100");
  process.exit(1);
 }

 if (position) {
  const album = await getAlbumByPosition(position);

  if (album && !Array.isArray(album)) {
   console.log(`Position: ${album.position}`);
   console.log(`Artist: ${album.artist}`);
   console.log(`Album: ${album.album}`);
  } else {
   console.error("No album found");
   process.exit(1);
  }
 } else {
  const charts = await getAlbumByPosition();

  if (charts && Array.isArray(charts)) {
   await writeChartsToFile(charts);
  } else {
   console.error("No charts found");
   process.exit(1);
  }
 }
}

export { fetchAlbumCharts, getAlbumByPosition, type AlbumChart };

if (import.meta.main) {
 main().catch((error) => {
  console.error(
   "Script failed:",
   error instanceof Error ? error.message : String(error)
  );
  process.exit(1);
 });
}
