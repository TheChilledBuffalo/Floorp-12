import { useState } from "react";
import { TopSites } from "./components/TopSites/index.tsx";
import { Clock } from "./components/Clock/index.tsx";
import { Background } from "./components/Background/index.tsx";
import { BackgroundProvider } from "./contexts/BackgroundContext.tsx";
import { ComponentsProvider } from "./contexts/ComponentsContext.tsx";
import { Settings } from "./components/Settings/index.tsx";
import { SettingsButton } from "./components/SettingsButton/index.tsx";
import { SearchBar } from "./components/SearchBar/index.tsx";
import "./globals.css";
import { useComponents } from "./contexts/ComponentsContext.tsx";

function NewTabContent() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { components } = useComponents();

  return (
    <>
      <Background />
      <div className="relative w-full min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 w-full">
          <div className="lg:col-span-2 mb-10">
            {components.topSites && <TopSites />}
          </div>

          <div className="flex justify-center lg:justify-end h-fit">
            {components.clock && <Clock />}
          </div>
        </div>

        <div className="w-full flex justify-center px-4">
          <div className="w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl mt-8 md:mt-16">
            {components.searchBar && <SearchBar />}
          </div>
        </div>

        <div className="fixed bottom-4 right-4">
          <SettingsButton onClick={() => setIsSettingsOpen(true)} />
          <Settings
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <ComponentsProvider>
      <BackgroundProvider>
        <NewTabContent />
      </BackgroundProvider>
    </ComponentsProvider>
  );
}
