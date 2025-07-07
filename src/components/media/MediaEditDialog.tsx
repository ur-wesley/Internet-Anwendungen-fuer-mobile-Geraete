import {
 TextField,
 TextFieldLabel,
 TextFieldRoot,
} from "@/components/ui/textfield";
import { Dialog as DialogPrimitive } from "@kobalte/core/dialog";
import { createEffect, createSignal } from "solid-js";
import { Dialog, DialogHeader, DialogTitle } from "../ui/dialog";
import { cn } from "@/libs/cn";
import type { MediaItem } from "@/types/MediaItem";
import { Show } from "solid-js/web";

interface MediaEditDialogProps {
 readonly isOpen: boolean;
 readonly onClose: () => void;
 readonly onSave: (title: string, imageSrc: string) => void;
 readonly onDelete?: () => void;
 readonly item?: MediaItem;
 readonly mode: "create" | "edit";
}

export function MediaEditDialog(props: MediaEditDialogProps) {
 const [title, setTitle] = createSignal("");
 const [imageFile, setImageFile] = createSignal<File | null>(null);
 const [imagePreview, setImagePreview] = createSignal<string>("");
 const [error, setError] = createSignal<string>("");

 createEffect(() => {
  if (props.isOpen) {
   setTitle(props.item?.title ?? "");
   setImageFile(null);
   setError("");
   setImagePreview(props.item?.src ?? "");
  } else {
   setImagePreview("");
   setImageFile(null);
   setError("");
  }
 });

 const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (files?.[0]) {
   const file = files[0];
   setImageFile(file);
   const url = URL.createObjectURL(file);
   setImagePreview(url);
   if (!title().trim()) {
    const name = file.name.replace(/\.[^.]+$/, "");
    setTitle(name);
   }
  }
 };

 async function saveImageFile(file: File): Promise<string> {
  if ("showDirectoryPicker" in window) {
   // @ts-ignore
   const dirHandle = await window.showDirectoryPicker({
    id: "media-images",
    mode: "readwrite",
   });
   // @ts-ignore
   const fileHandle = await dirHandle.getFileHandle(file.name, {
    create: true,
   });
   // @ts-ignore
   const writable = await fileHandle.createWritable();
   await writable.write(file);
   await writable.close();
   return fileHandle.name;
  }
  setError("File System API wird nicht unterstützt.");
  return "";
 }

 const handleSave = async () => {
  const trimmedTitle = title().trim();
  if (!trimmedTitle || (!imageFile() && !imagePreview())) {
   setError("Bitte Titel und Bild angeben.");
   return;
  }
  let imageSrc = imagePreview();
  if (imageFile()) {
   try {
    imageSrc = await saveImageFile(imageFile());
    if (!imageSrc) return;
   } catch {
    setError("Fehler beim lokalen Speichern des Bildes.");
    return;
   }
  }
  setError("");
  props.onSave(trimmedTitle, imageSrc);
 };

 const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter") {
   handleSave();
  }
 };
 return (
  <Dialog open={props.isOpen} onOpenChange={(open) => !open && props.onClose()}>
   <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay class="fixed inset-0 z-50 bg-background/80 data-[expanded]:(animate-in fade-in-0) data-[closed]:(animate-out fade-out-0)" />
    <DialogPrimitive.Content
     class={cn(
      "fixed left-[50%] top-[50%] z-50 grid w-[90vw] max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border-2 border-border bg-card shadow-2xl duration-200 data-[expanded]:(animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-48% duration-200) data-[closed]:(animate-out fade-out-0 zoom-out-95 slide-out-to-left-1/2 slide-out-to-top-48% duration-200) md:w-full rounded-lg"
     )}
    >
     <div class="flex flex-col gap-2 p-2">
      <DialogHeader>
       <DialogTitle>
        {props.mode === "create" ? "Neues Medium" : "Medium editieren"}
       </DialogTitle>
      </DialogHeader>
      <TextFieldRoot class="flex flex-col gap-2">
       <TextFieldLabel class="">Titel</TextFieldLabel>
       <TextField
        value={title()}
        onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
        onKeyDown={handleKeyDown}
        placeholder="Titel eingeben..."
        class="w-full"
       />
      </TextFieldRoot>
      <TextFieldRoot class="flex flex-col gap-2">
       <TextFieldLabel class="">Bild auswählen</TextFieldLabel>
       <TextField
        type="file"
        accept="image/*"
        onInput={handleFileChange}
        class="w-full"
       />
      </TextFieldRoot>
      <Show when={imagePreview()}>
       <div class="flex justify-center items-center gap-2">
        <img
         src={imagePreview()}
         alt="Vorschau"
         class="max-h-32 rounded shadow"
        />
       </div>
      </Show>
      <Show when={error()}>
       <div class="text-red-600 text-sm text-center">{error()}</div>
      </Show>
     </div>
     <div class="border-t-2 border-border">
      <div class="flex gap-0">
       <button
        type="button"
        onClick={() => props.onDelete?.()}
        disabled={props.mode === "create" || !props.onDelete}
        class="flex-1 text-center font-semibold border-r-2 border-border transition-colors touch-manipulation disabled:text-muted-foreground disabled:cursor-not-allowed text-destructive hover:bg-destructive/10 active:bg-destructive/20 disabled:hover:bg-transparent disabled:active:bg-transparent"
       >
        Löschen
       </button>
       <button
        type="button"
        onClick={handleSave}
        disabled={!title().trim() || (!imageFile() && !imagePreview())}
        class="flex-1 text-center font-semibold text-green-600 hover:bg-green-600/10 active:bg-green-600/20 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors touch-manipulation"
       >
        {props.mode === "create" ? "Hinzufügen" : "Speichern"}
       </button>
      </div>
     </div>
    </DialogPrimitive.Content>
   </DialogPrimitive.Portal>
  </Dialog>
 );
}
