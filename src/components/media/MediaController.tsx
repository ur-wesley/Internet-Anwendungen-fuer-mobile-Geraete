import { ActionMenu } from "@/components/media/ActionMenu";
import { DetailView } from "@/components/media/DetailView";
import { MediaEditDialog } from "@/components/media/MediaEditDialog";
import { MediaModel } from "@/components/media/MediaModel";
import { MediaView } from "@/components/media/MediaView";
import type { MediaItem } from "@/types/MediaItem";
import { Show, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import {
 Dialog,
 DialogContent,
 DialogTitle,
 DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

type ViewMode = "list" | "detail" | "overview";
type DialogMode = "create" | "edit" | "none";

export function MediaController() {
 const [store, setStore] = createStore({
  items: [],
 });

 const [viewMode, setViewMode] = createSignal<ViewMode>("list");
 const [dialogMode, setDialogMode] = createSignal<DialogMode>("none");
 const [selectedItem, setSelectedItem] = createSignal<MediaItem | undefined>();
 const [showActionMenu, setShowActionMenu] = createSignal(false);
 const [storageFilter, setStorageFilter] = createSignal<
  "all" | "local" | "remote"
 >("all");
 const [confirmOpen, setConfirmOpen] = createSignal(false);
 const [pendingDelete, setPendingDelete] = createSignal<
  MediaItem | undefined
 >();

 const model = new MediaModel([], setStore);

 const handleAddItem = () => {
  setDialogMode("create");
  setSelectedItem(undefined);
 };

 const handleEditItem = (item: MediaItem) => {
  setDialogMode("edit");
  setSelectedItem(item);
 };

 const handleSaveItem = async (
  title: string,
  imageSrc: string,
  storageType: "local" | "remote"
 ) => {
  try {
   const item = selectedItem();
   if (dialogMode() === "create") {
    await model.addMediaItem(title, imageSrc, storageType);
   } else if (dialogMode() === "edit" && item) {
    await model.updateMediaItem(item.id, title, imageSrc, storageType);
   }
   setDialogMode("none");
   setSelectedItem(undefined);
  } catch (error) {
   console.error("Error saving item:", error);
  }
 };

 const handleDeleteFromDialog = async () => {
  try {
   const item = selectedItem();
   if (item) {
    await model.deleteMediaItem(item.id);
    setDialogMode("none");
    setSelectedItem(undefined);
   }
  } catch (error) {
   console.error("Error deleting item:", error);
  }
 };

 const handleBackToList = () => {
  setViewMode("list");
  setSelectedItem(undefined);
 };

 const isDialogOpen = () => dialogMode() !== "none" || showActionMenu();

 const handleStorageFilterChange = (filter: "all" | "local" | "remote") => {
  setStorageFilter(filter);
 };

 const requestDelete = (item: MediaItem) => {
  setPendingDelete(item);
  setConfirmOpen(true);
 };

 const handleConfirmDelete = async () => {
  const item = pendingDelete();
  if (item) {
   await model.deleteMediaItem(item.id);
   if (viewMode() === "detail") {
    setViewMode("list");
   }
   setSelectedItem(undefined);
  }
  setConfirmOpen(false);
  setPendingDelete(undefined);
 };

 const handleCancelDelete = () => {
  setConfirmOpen(false);
  setPendingDelete(undefined);
 };

 return (
  <div class="h-screen overflow-hidden">
   <Sheet>
    <MediaView
     items={store.items}
     onAddItem={handleAddItem}
     onEditItem={handleEditItem}
     onDeleteItem={() => {}}
     onSelectItem={(item) => {
      setSelectedItem(item);
      setViewMode("detail");
     }}
     onShowOptions={(item) => {
      setSelectedItem(item);
      setShowActionMenu(true);
     }}
     isDialogOpen={isDialogOpen()}
     storageFilter={storageFilter()}
     onStorageFilterChange={handleStorageFilterChange}
    />
    <SheetContent side="left">
     <SheetTitle>Ansicht wechseln</SheetTitle>
     <div class="flex flex-col gap-4 mt-6">
      <Button
       variant={viewMode() === "list" ? "default" : "ghost"}
       onClick={() => setViewMode("list")}
      >
       Listenansicht
      </Button>
      <Button
       variant={viewMode() === "overview" ? "default" : "ghost"}
       onClick={() => setViewMode("overview")}
      >
       Übersicht
      </Button>
     </div>
    </SheetContent>
   </Sheet>
   <Show
    when={viewMode() === "list"}
    fallback={
     <Show
      when={viewMode() === "overview"}
      fallback={
       <Show when={selectedItem()}>
        {(item) => (
         <DetailView
          item={item()}
          onBack={handleBackToList}
          onDelete={() => requestDelete(item())}
         />
        )}
       </Show>
      }
     >
      {/* platzhalter */}
      <div class="flex flex-col items-center justify-center h-full text-muted-foreground">
       <div class="i-mdi-view-dashboard-outline text-6xl mb-4" />
       <div class="text-xl">Alternative Ansicht</div>
       <div class="mt-2">alternative Übersicht.</div>
      </div>
     </Show>
    }
   >
    {/* platzhalter */}
    <div class="flex flex-col items-center justify-center h-full text-muted-foreground">
     <div class="i-mdi-view-dashboard-outline text-6xl mb-4" />
     <div class="text-xl">Alternative Ansicht</div>
     <div class="mt-2">alternative Übersicht.</div>
    </div>
   </Show>
   <MediaEditDialog
    isOpen={dialogMode() !== "none"}
    onClose={() => {
     setDialogMode("none");
     setSelectedItem(undefined);
    }}
    onSave={handleSaveItem}
    onDelete={dialogMode() === "edit" ? handleDeleteFromDialog : undefined}
    item={selectedItem()}
    mode={dialogMode() === "create" ? "create" : "edit"}
   />
   <ActionMenu
    isOpen={showActionMenu()}
    onClose={() => {
     setShowActionMenu(false);
    }}
    onEdit={() => {
     setShowActionMenu(false);
     const item = selectedItem();
     if (item) {
      handleEditItem(item);
     }
    }}
    onDelete={() => {
     setShowActionMenu(false);
     const item = selectedItem();
     if (item) {
      requestDelete(item);
     }
    }}
    item={selectedItem()}
   />
   <Dialog open={confirmOpen()} onOpenChange={setConfirmOpen}>
    <DialogContent>
     <DialogTitle>Löschvorgang bestätigen</DialogTitle>
     <div class="py-2 text-center">
      Möchten Sie das Element <b>{pendingDelete()?.title}</b> wirklich löschen?
     </div>
     <DialogFooter>
      <Button variant="ghost" onClick={handleCancelDelete}>
       Abbrechen
      </Button>
      <Button variant="destructive" onClick={handleConfirmDelete}>
       Löschen
      </Button>
     </DialogFooter>
    </DialogContent>
   </Dialog>
  </div>
 );
}
