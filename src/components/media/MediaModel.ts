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
}

export class MediaModel {
  private _items: MediaItem[] = [];
  private _updateReactiveStore: (key: string, value: MediaItem[]) => void;
  private storage = !isServer ? localforage : null;
  constructor(initialItems: MediaItem[], storeSetter: (key: string, value: MediaItem[]) => void) {
    this._items = initialItems || [];
    this._updateReactiveStore = storeSetter;

    this.initStorage().catch((error) => console.error("Storage initialization failed:", error));
  }

  private async initStorage(): Promise<void> {
    if (this.storage) {
      this.storage.config({
        name: "MediaApp",
        storeName: "mediaItems",
      });
      try {
        const existingItems = await this.storage.getItem<SerializedMediaItem[]>("items");

        if (existingItems && existingItems.length > 0) {
          this._items = existingItems.map((item) => ({
            ...item,
            added: new Date(item.added),
          }));
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

        this._items = storedItems.map((item) => ({
          ...item,
          added: new Date(item.added),
        }));
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
  async addMediaItem(title: string, src?: string): Promise<void> {
    const newItem: MediaItem = {
      id: createId(),
      title: title || "New Item",
      src: src || `https://picsum.photos/400/300?random=${createId()}`,
      added: new Date(),
    };
    this._items = [...this._items, newItem];
    this._updateReactiveStore("items", this._items);
    await this.saveItems();
  }

  async deleteMediaItem(itemId: string): Promise<void> {
    this._items = this._items.filter((item) => item.id !== itemId);
    this._updateReactiveStore("items", this._items);
    await this.saveItems();
  }

  async updateMediaItem(itemId: string, newTitle: string): Promise<void> {
    this._items = this._items.map((item) => (item.id === itemId ? { ...item, title: newTitle } : item));
    this._updateReactiveStore("items", this._items);
    await this.saveItems();
  }

  getItemById(itemId: string): MediaItem | undefined {
    return this._items.find((item) => item.id === itemId);
  }
}
