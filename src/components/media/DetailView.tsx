import { Button } from "@/components/ui/button";
import type { MediaItem } from "@/types/MediaItem";
import { createSignal, onMount } from "solid-js";
import "@/components/media/DetailView.css";

interface DetailViewProps {
 item: MediaItem;
 onBack: () => void;
 onDelete: () => void;
}

export function DetailView(props: Readonly<DetailViewProps>) {
 const [isVisible, setIsVisible] = createSignal(false);

 onMount(() => {
  setTimeout(() => setIsVisible(true), 50);
 });

 const handleBack = () => {
  setIsVisible(false);
  setTimeout(() => props.onBack(), 300);
 };

 const handleDelete = () => {
  props.onDelete();
 };

 return (
  <div
   class={`fixed inset-0 bg-background transition-opacity duration-300 ${
    isVisible() ? "opacity-100" : "opacity-0"
   }`}
  >
   <div class="flex flex-col h-full">
    <header class="flex items-center justify-between p-4 border-b-2 border-border bg-card shadow-sm shrink-0">
     <div class="flex items-center gap-3 flex-1 min-w-0">
      <div class="i-mdi-menu h-6 w-6 shrink-0" />
      <h1 class="text-lg font-semibold truncate">{props.item.title}</h1>
     </div>
     <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      class="shrink-0 touch-manipulation"
     >
      <div class="i-mdi-delete h-6 w-6" />
     </Button>
    </header>
    <main class="flex-1 overflow-auto">
     <div class="detail-view-image-container">
      <img
       src={props.item.src}
       alt={props.item.title}
       class="detail-view-image"
       onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
        const fallback = (e.target as HTMLImageElement)
         .nextElementSibling as HTMLElement;
        if (fallback) fallback.style.display = "flex";
       }}
      />
      <div class="detail-view-fallback">
       <div class="i-mdi-image h-16 w-16 text-muted-foreground" />
      </div>
     </div>
    </main>
    <footer class="p-4 border-t-2 border-border bg-card shadow-sm shrink-0">
     <Button
      variant="ghost"
      size="icon"
      onClick={handleBack}
      class="touch-manipulation"
     >
      <div class="i-mdi-arrow-left h-6 w-6" />
     </Button>
    </footer>
   </div>
  </div>
 );
}
