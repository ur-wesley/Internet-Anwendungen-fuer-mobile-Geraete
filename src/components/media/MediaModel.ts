import type { MediaItem } from "@/types/MediaItem";
import { generateSampleMediaItems } from "@/utils/sampleData.js";
import { createId } from "@paralleldrive/cuid2";
import localforage from "localforage";
import { isServer } from "solid-js/web";

interface SerializedMediaItem {
  id: string;
  title: string;
  src: string;
  added: string;
  storageType: "local" | "remote";
  remoteUrl?: string;
}

export class MediaModel {
  private _items: MediaItem[] = [];
  private readonly _updateReactiveStore: (key: string, value: MediaItem[]) => void;
  private readonly storage = !isServer ? localforage : null;
  private constructor(initialItems: MediaItem[], storeSetter: (key: string, value: MediaItem[]) => void) {
    this._items = initialItems || [];
    this._updateReactiveStore = storeSetter;
  }

  static async create(
    initialItems: MediaItem[],
    storeSetter: (key: string, value: MediaItem[]) => void,
  ): Promise<MediaModel> {
    const model = new MediaModel(initialItems, storeSetter);
    try {
      await model.initStorage();
    } catch (error) {
      console.error("Storage initialization failed:", error);
    }
    return model;
  }

  private async initStorage(): Promise<void> {
    if (this.storage) {
      this.storage.config({
        name: "MediaApp",
        storeName: "mediaItems",
      });
      try {
        const existingItems = await this.storage.getItem<SerializedMediaItem[]>("items");

        if (existingItems?.length) {
          this._items = existingItems.map((item) => {
            const baseItem = {
              ...item,
              added: new Date(item.added),
            };

            if (!item.storageType) {
              return {
                ...baseItem,
                storageType: "local" as const,
              };
            }

            if (item.storageType === "remote") {
              return {
                ...baseItem,
                storageType: "remote" as const,
                remoteUrl: item.remoteUrl || item.src,
              };
            }
            return {
              ...baseItem,
              storageType: "local" as const,
            };
          });
          this._updateReactiveStore("items", this._items);
        } else {
          await this.loadInitialData();
        }
      } catch (error) {
        console.error("Error initializing storage:", error);

        await this.loadInitialData();
      }
    } else {
      await this.loadInitialData();
    }
  }

  private async loadInitialData(): Promise<void> {
    try {
      this._items = await generateSampleMediaItems(30);
      this._updateReactiveStore("items", this._items);

      if (this.storage) {
        await this.saveItems();
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  }
  private async loadItems(): Promise<void> {
    if (this.storage) {
      try {
        const storedItems = (await this.storage.getItem<SerializedMediaItem[]>("items")) || [];

        this._items = storedItems.map((item) => {
          const baseItem = {
            ...item,
            added: new Date(item.added),
          };

          if (!item.storageType) {
            return {
              ...baseItem,
              storageType: "local" as const,
            };
          }

          if (item.storageType === "remote") {
            return {
              ...baseItem,
              storageType: "remote" as const,
              remoteUrl: item.remoteUrl || item.src,
            };
          }
          return {
            ...baseItem,
            storageType: "local" as const,
          };
        });
        this._updateReactiveStore("items", this._items);
      } catch (error) {
        console.error("Error loading items:", error);
      }
    }
  }
  private async saveItems(): Promise<void> {
    if (this.storage) {
      try {
        const serializedItems = this._items.map((item) => ({
          ...item,
          added: item.added.toISOString(),
        }));
        await this.storage.setItem("items", serializedItems);
      } catch (error) {
        console.error("Error saving items:", error);
      }
    }
  }
  async addMediaItem(
    title: string,
    imageSrc: string,
    storageType: "local" | "remote",
    location?: { lat: number; lng: number },
  ): Promise<void> {
    const baseItem = {
      id: createId(),
      title: title || "New Item",
      src: imageSrc,
      added: new Date(),
      location,
    };

    let newItem: MediaItem;
    if (storageType === "remote") {
      newItem = {
        ...baseItem,
        storageType: "remote",
      };
    } else {
      newItem = {
        ...baseItem,
        storageType: "local",
      };
    }

    this._items = [...this._items, newItem];
    this._updateReactiveStore("items", this._items);
    await this.saveItems();
  }

  async deleteMediaItem(itemId: string): Promise<void> {
    this._items = this._items.filter((item) => item.id !== itemId);
    this._updateReactiveStore("items", this._items);
    await this.saveItems();
  }

  async updateMediaItem(
    itemId: string,
    newTitle: string,
    imageSrc: string,
    storageType: "local" | "remote",
    location?: { lat: number; lng: number },
  ): Promise<void> {
    this._items = this._items.map((item) => {
      if (item.id !== itemId) return item;

      const baseItem = {
        ...item,
        title: newTitle,
        src: imageSrc,
        location: location ?? item.location,
      };

      if (storageType === "remote") {
        return {
          ...baseItem,
          storageType: "remote",
          remoteUrl: imageSrc,
        };
      }
      return {
        ...baseItem,
        storageType: "local",
      };
    });

    this._updateReactiveStore("items", this._items);
    await this.saveItems();
  }

  getItemById(itemId: string): MediaItem | undefined {
    return this._items.find((item) => item.id === itemId);
  }
}
