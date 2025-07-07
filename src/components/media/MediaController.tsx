import { ActionMenu } from "@/components/media/ActionMenu";
import { DetailView } from "@/components/media/DetailView";
import { MediaEditDialog } from "@/components/media/MediaEditDialog";
import { MediaModel } from "@/components/media/MediaModel";
import { MediaView } from "@/components/media/MediaView";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { MediaItem } from "@/types/MediaItem";
import { Match, Show, Switch, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { OverviewMap } from "./OverviewMap";

type ViewMode = "list" | "detail" | "overview";
type DialogMode = "create" | "edit" | "none";
type StorageFilter = "all" | "local" | "remote";

export function MediaController() {
  const [store, setStore] = createStore({
    items: [],
  });

  const [viewMode, setViewMode] = createSignal<ViewMode>("list");
  const [dialogMode, setDialogMode] = createSignal<DialogMode>("none");
  const [selectedItem, setSelectedItem] = createSignal<MediaItem | undefined>();
  const [showActionMenu, setShowActionMenu] = createSignal(false);
  const [storageFilter, setStorageFilter] = createSignal<StorageFilter>("all");
  const [confirmOpen, setConfirmOpen] = createSignal(false);
  const [pendingDelete, setPendingDelete] = createSignal<MediaItem | undefined>();
  const [sheetOpen, setSheetOpen] = createSignal(false);

  let model: MediaModel;

  onMount(async () => {
    model = await MediaModel.create([], setStore);
  });

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
    storageType: "local" | "remote",
    location?: { lat: number; lng: number },
  ) => {
    try {
      const item = selectedItem();
      if (dialogMode() === "create") {
        await model.addMediaItem(title, imageSrc, storageType, location);
      } else if (dialogMode() === "edit" && item) {
        await model.updateMediaItem(item.id, title, imageSrc, storageType, location);
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

  const handleStorageFilterChange = (filter: StorageFilter) => {
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

  function getStorageButtonClass(type: StorageFilter) {
    const base = "px-3 py-1 text-xs rounded transition-colors ";
    if (storageFilter() === type) {
      return `${base} bg-primary text-primary-foreground`;
    }
    return `${base} bg-muted text-muted-foreground hover:bg-muted/80`;
  }

  function getViewButtonVariant(type: "list" | "overview") {
    if (viewMode() === type) {
      return "default";
    }
    return "ghost";
  }

  function getDialogDeleteHandler() {
    if (dialogMode() === "edit") {
      return handleDeleteFromDialog;
    }
    return undefined;
  }

  function getDialogMode() {
    if (dialogMode() === "create") {
      return "create";
    }
    return "edit";
  }

  return (
    <Sheet open={sheetOpen()} onOpenChange={setSheetOpen}>
      <div class="flex flex-col h-screen">
        <header class="flex items-center justify-between p-4 border-b-2 border-border bg-background shadow-sm shrink-0">
          <SheetTrigger>
            <div
              class="i-mdi-menu h-7 w-7 cursor-pointer bg-primary text-primary-foreground rounded-full p-1 hover:bg-primary/80 transition"
              aria-label="Menü öffnen"
            />
          </SheetTrigger>
          <span class="text-lg font-semibold">Medien</span>
          <div class="flex gap-2">
            <Show when={viewMode() === "list"}>
              <Button variant="ghost" size="icon" onClick={handleAddItem} title="Medium hinzufügen">
                <div class="i-mdi-plus h-6 w-6" />
              </Button>
            </Show>
            <Show when={viewMode() === "detail" && selectedItem()}>
              <Button variant="destructive" size="icon" onClick={() => requestDelete(selectedItem())} title="Löschen">
                <div class="i-mdi-delete h-6 w-6" />
              </Button>
            </Show>
          </div>
        </header>
        <main class="flex-1 overflow-auto z-0">
          <Switch>
            <Match when={viewMode() === "list"}>
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
            </Match>
            <Match when={viewMode() === "overview"}>
              <OverviewMap items={store.items} />
            </Match>
            <Match when={viewMode() === "detail" && selectedItem()}>
              <DetailView
                item={selectedItem()}
                onBack={handleBackToList}
                onDelete={() => requestDelete(selectedItem())}
                onOpenMenu={() => setSheetOpen(true)}
              />
            </Match>
          </Switch>
        </main>
        <footer class="border-t bg-background shrink-0 p-2">
          <Show when={viewMode() === "list"}>
            <div class="flex justify-center gap-1">
              <button
                type="button"
                onClick={() => handleStorageFilterChange("all")}
                class={getStorageButtonClass("all")}
              >
                Alle
              </button>
              <button
                type="button"
                onClick={() => handleStorageFilterChange("local")}
                class={getStorageButtonClass("local")}
              >
                Lokal
              </button>
              <button
                type="button"
                onClick={() => handleStorageFilterChange("remote")}
                class={getStorageButtonClass("remote")}
              >
                Remote
              </button>
            </div>
          </Show>
        </footer>
      </div>
      <SheetContent
        side="top"
        class="fixed inset-0 w-full h-full max-w-full max-h-full z-[3001] flex flex-col bg-background"
      >
        <SheetTitle>Ansicht wechseln</SheetTitle>
        <div class="flex flex-col gap-4 mt-6">
          <Button
            variant={getViewButtonVariant("list")}
            onClick={() => {
              setViewMode("list");
              setSheetOpen(false);
            }}
          >
            Listenansicht
          </Button>
          <Button
            variant={getViewButtonVariant("overview")}
            onClick={() => {
              setViewMode("overview");
              setSheetOpen(false);
            }}
          >
            Kartenansicht
          </Button>
        </div>
      </SheetContent>
      <MediaEditDialog
        isOpen={dialogMode() !== "none"}
        onClose={() => {
          setDialogMode("none");
          setSelectedItem(undefined);
        }}
        onSave={handleSaveItem}
        onDelete={getDialogDeleteHandler()}
        item={selectedItem()}
        mode={getDialogMode()}
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
    </Sheet>
  );
}
