export type MediaItem = {
  id: string;
  title: string;
  src: string;
  added: Date;
  storageType: "remote" | "local";
  location?: { lat: number; lng: number };
};
