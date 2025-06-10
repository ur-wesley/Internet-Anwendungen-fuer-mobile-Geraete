import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import { cn } from "@/libs/cn";
import type { MediaItem } from "@/types/MediaItem";
import { Dialog as DialogPrimitive } from "@kobalte/core/dialog";
import { createEffect, createSignal } from "solid-js";
import { Dialog, DialogHeader, DialogTitle } from "../ui/dialog";

interface MediaEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  onDelete?: () => void;
  item?: MediaItem;
  mode: "create" | "edit";
}

export function MediaEditDialog(props: MediaEditDialogProps) {
  const [title, setTitle] = createSignal("");
  let inputRef: HTMLInputElement | undefined;

  createEffect(() => {
    if (props.isOpen) {
      setTitle(props.item?.title || "");
      setTimeout(() => {
        if (inputRef) {
          inputRef.focus();
        }
      }, 100);
    }
  });

  const handleSave = () => {
    const trimmedTitle = title().trim();
    if (trimmedTitle) {
      props.onSave(trimmedTitle);
    }
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
            "fixed left-[50%] top-[50%] z-50 grid w-[90vw] max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border-2 border-border bg-card p-6 shadow-2xl duration-200 data-[expanded]:(animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-48% duration-200) data-[closed]:(animate-out fade-out-0 zoom-out-95 slide-out-to-left-1/2 slide-out-to-top-48% duration-200) md:w-full rounded-lg",
          )}
        >
          <DialogHeader>
            <DialogTitle>{props.mode === "create" ? "Neues Medium" : "Medium editieren"}</DialogTitle>
          </DialogHeader>
          <TextFieldRoot class="grid grid-cols-4 items-center gap-4">
            <TextField
              ref={inputRef}
              value={title()}
              onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
              onKeyDown={handleKeyDown}
              placeholder="Titel eingeben..."
              class="col-span-4 h-12"
            />
          </TextFieldRoot>
          <div class="flex flex-col gap-0 -m-6 mt-4">
            <div class="border-t-2 border-border">
              <div class="flex">
                <button
                  type="button"
                  onClick={() => props.onDelete?.()}
                  disabled={props.mode === "create" || !props.onDelete}
                  class="flex-1 py-4 text-center font-semibold border-r-2 border-border transition-colors touch-manipulation disabled:text-muted-foreground disabled:cursor-not-allowed text-destructive hover:bg-destructive/10 active:bg-destructive/20 disabled:hover:bg-transparent disabled:active:bg-transparent"
                >
                  Löschen
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!title().trim()}
                  class="flex-1 py-4 text-center font-semibold text-green-600 hover:bg-green-600/10 active:bg-green-600/20 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors touch-manipulation"
                >
                  {props.mode === "create" ? "Hinzufügen" : "Speichern"}
                </button>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
