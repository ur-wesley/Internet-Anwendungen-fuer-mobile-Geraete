import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { MediaItem } from "@/types/MediaItem";

interface ActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  item?: MediaItem;
}

export function ActionMenu(props: ActionMenuProps) {
  return (
    <Dialog open={props.isOpen} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent class="w-[90vw] max-w-xs mx-auto p-0 border-2 border-border shadow-2xl rounded-lg overflow-hidden bg-card">
        <div class="bg-card">
          <div class="p-4 border-b-2 border-border bg-muted/50">
            <DialogTitle class="text-sm font-semibold text-center">{props.item?.title || "Optionen"}</DialogTitle>
          </div>
          <div class="divide-y-2 divide-border">
            <button
              type="button"
              onClick={() => {
                props.onEdit();
              }}
              class="w-full px-4 py-4 text-left hover:bg-muted/70 active:bg-muted transition-colors touch-manipulation flex items-center"
            >
              <div class="i-mdi-pencil mr-3 h-5 w-5 text-muted-foreground" />
              <span class="text-base font-medium">Editieren</span>
            </button>
            <button
              type="button"
              onClick={() => {
                props.onDelete();
              }}
              class="w-full px-4 py-4 text-left hover:bg-destructive/20 active:bg-destructive/30 transition-colors touch-manipulation flex items-center text-destructive"
            >
              <div class="i-mdi-delete mr-3 h-5 w-5" />
              <span class="text-base">Löschen</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
