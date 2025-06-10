import localforage from "localforage";

export async function clearMediaStorage(): Promise<void> {
  try {
    const storage = localforage.createInstance({
      name: "MediaApp",
      storeName: "mediaItems",
    });
    await storage.clear();
    console.log("Media storage cleared successfully");
    window.location.reload();
  } catch (error) {
    console.error("Error clearing media storage:", error);
  }
}

export async function isMediaStorageEmpty(): Promise<boolean> {
  try {
    const storage = localforage.createInstance({
      name: "MediaApp",
      storeName: "mediaItems",
    });
    const items = await storage.getItem("items");
    return !items || (Array.isArray(items) && items.length === 0);
  } catch (error) {
    console.error("Error checking media storage:", error);
    return true;
  }
}

interface WindowWithDebug extends Window {
  clearMediaStorage: () => Promise<void>;
}

(window as unknown as WindowWithDebug).clearMediaStorage = clearMediaStorage;
