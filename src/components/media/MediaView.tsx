import { Button } from "@/components/ui/button";
import { Image, ImageFallback, ImageRoot } from "@/components/ui/image";
import type { MediaItem } from "@/types/MediaItem";
import { For, Show } from "solid-js";

interface MediaViewProps {
  items: MediaItem[];
  onAddItem: () => void;
  onEditItem: (item: MediaItem) => void;
  onDeleteItem: (itemId: string) => void;
  onSelectItem: (item: MediaItem) => void;
  onShowOptions: (item: MediaItem) => void;
  isDialogOpen: boolean;
}

export function MediaView(props: MediaViewProps) {
  return (
    <div
      class={`flex flex-col h-screen transition-opacity duration-300 ${
        props.isDialogOpen ? "opacity-30" : "opacity-100"
      }`}
    >
      <header class="flex items-center justify-between p-4 border-b-2 border-border bg-card shadow-sm shrink-0">
        <div class="flex items-center gap-3">
          <div class="i-mdi-menu h-6 w-6" />
          <h1 class="text-xl font-bold">Medien</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={props.onAddItem} class="touch-manipulation">
          <div class="i-mdi-plus h-6 w-6" />
        </Button>
      </header>
      <main class="flex-1 overflow-auto">
        <Show
          when={props.items.length > 0}
          fallback={
            <div class="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
              <div class="i-mdi-image-multiple h-16 w-16 mb-4" />
              <p class="text-lg font-medium mb-2">Keine Medien vorhanden</p>
              <p class="text-sm text-center">Tippen Sie auf das + Symbol, um Ihr erstes Medium hinzuzufügen</p>
            </div>
          }
        >
          <div class="divide-y pb-safe">
            <For each={props.items}>
              {(item) => (
                <div class="flex items-center px-4 py-3 hover:bg-muted/50 transition-colors active:bg-muted/80">
                  <button
                    type="button"
                    class="flex-1 flex items-center gap-3 cursor-pointer touch-manipulation bg-transparent border-none p-0 text-left"
                    onClick={() => props.onSelectItem(item)}
                  >
                    <div class="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted">
                      <ImageRoot class="w-full h-full relative flex shrink-0 overflow-hidden rounded-lg">
                        <Image src={item.src} alt={item.title} class="w-full h-full object-cover" />
                        <ImageFallback class="w-full h-full flex items-center justify-center bg-muted">
                          <div class="i-mdi-image h-8 w-8 text-muted-foreground" />
                        </ImageFallback>
                      </ImageRoot>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="font-medium truncate text-base">{item.title}</h3>
                      <p class="text-sm text-muted-foreground">{item.added.toLocaleDateString("de-DE")}</p>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => props.onShowOptions(item)}
                    class="shrink-0 touch-manipulation"
                  >
                    <div class="i-mdi-dots-vertical h-5 w-5" />
                  </Button>
                </div>
              )}
            </For>
            {/* Add extra padding at the bottom to ensure last item is fully visible on mobile */}
            <div class="h-16 md:h-8" />
          </div>
        </Show>
      </main>
      <footer class="border-t bg-background shrink-0" />
    </div>
  );
}
