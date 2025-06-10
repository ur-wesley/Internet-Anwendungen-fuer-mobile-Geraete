import { ActionMenu } from "@/components/media/ActionMenu";
import { DetailView } from "@/components/media/DetailView";
import { MediaEditDialog } from "@/components/media/MediaEditDialog";
import { MediaModel } from "@/components/media/MediaModel";
import { MediaView } from "@/components/media/MediaView";
import type { MediaItem } from "@/types/MediaItem";
import { Show, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

type ViewMode = "list" | "detail";
type DialogMode = "create" | "edit" | "none";

export function MediaController() {
 const [store, setStore] = createStore({
  items: [],
 });

 const [viewMode, setViewMode] = createSignal<ViewMode>("list");
 const [dialogMode, setDialogMode] = createSignal<DialogMode>("none");
 const [selectedItem, setSelectedItem] = createSignal<MediaItem | undefined>();
 const [showActionMenu, setShowActionMenu] = createSignal(false);

 const model = new MediaModel([], setStore);

 const handleAddItem = () => {
  setDialogMode("create");
  setSelectedItem(undefined);
 };

 const handleEditItem = (item: MediaItem) => {
  setDialogMode("edit");
  setSelectedItem(item);
 };
 const handleDeleteItem = async (itemId: string) => {
  try {
   await model.deleteMediaItem(itemId);
  } catch (error) {
   console.error("Error deleting item:", error);
  }
 };

 const handleSelectItem = (item: MediaItem) => {
  setSelectedItem(item);
  setViewMode("detail");
 };

 const handleShowOptions = (item: MediaItem) => {
  setSelectedItem(item);
  setShowActionMenu(true);
 };
 const handleSaveItem = async (title: string) => {
  try {
   const item = selectedItem();
   if (dialogMode() === "create") {
    await model.addMediaItem(title);
   } else if (dialogMode() === "edit" && item) {
    await model.updateMediaItem(item.id, title);
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

 const handleDeleteFromDetail = async () => {
  try {
   const item = selectedItem();
   if (item) {
    await model.deleteMediaItem(item.id);
    setViewMode("list");
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

 return (
  <div class="h-screen overflow-hidden">
   <Show
    when={viewMode() === "list"}
    fallback={
     <Show when={selectedItem()}>
      {(item) => (
       <DetailView
        item={item()}
        onBack={handleBackToList}
        onDelete={handleDeleteFromDetail}
       />
      )}
     </Show>
    }
   >
    <MediaView
     items={store.items}
     onAddItem={handleAddItem}
     onEditItem={handleEditItem}
     onDeleteItem={handleDeleteItem}
     onSelectItem={handleSelectItem}
     onShowOptions={handleShowOptions}
     isDialogOpen={isDialogOpen()}
    />
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
      handleDeleteItem(item.id);
     }
     setSelectedItem(undefined);
    }}
    item={selectedItem()}
   />
  </div>
 );
}
