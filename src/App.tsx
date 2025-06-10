import type { Component } from "solid-js";
import { MediaController } from "./components/media/MediaController";
import "@/utils/storageUtils";
import "@/app.css";

const App: Component = () => {
  return (
    <div class="h-screen bg-background text-foreground">
      <MediaController />
    </div>
  );
};

export default App;
