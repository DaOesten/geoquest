"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Crosshair, MapPin } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StationRadiusSlider } from "@/components/station-radius-slider";
import { AddressSearchField } from "@/components/address-search-field";
import { useCurrentPosition } from "@/hooks/use-current-position";
import type { AddressSearchResult } from "@/hooks/use-address-search";
import { stripHtmlTags } from "@/lib/sanitize";
import type { DraftStation } from "@/lib/quest-storage";
import { GERMANY_CENTER, GERMANY_ZOOM, STATION_ZOOM } from "@/lib/map-constants";

// Leaflet touches `window` on import, so the map must never render on the server.
const StationMap = dynamic(() => import("@/components/station-map").then((m) => m.StationMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-card bg-muted animate-pulse" />
  ),
});

interface ContextPin {
  id: string;
  lat: number;
  lng: number;
}

interface StationEditorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  station: DraftStation | null;
  contextPins: ContextPin[];
  onSave: (station: DraftStation) => void;
}

function initialMapView(
  position: { lat: number; lng: number } | null,
  contextPins: ContextPin[]
): { center: [number, number]; zoom: number } {
  if (position) return { center: [position.lat, position.lng], zoom: STATION_ZOOM };
  const lastContext = contextPins[contextPins.length - 1];
  if (lastContext) return { center: [lastContext.lat, lastContext.lng], zoom: STATION_ZOOM };
  return { center: GERMANY_CENTER, zoom: GERMANY_ZOOM };
}

export function StationEditorSheet({ open, onOpenChange, station, contextPins, onSave }: StationEditorSheetProps) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusMeters, setRadiusMeters] = useState(10);
  const [mapView, setMapView] = useState(() => initialMapView(null, []));
  const [prevOpen, setPrevOpen] = useState(open);
  const { isLoading: isLocating, request: requestCurrentPosition } = useCurrentPosition();

  // Reset the local draft whenever the sheet transitions from closed to open, without an
  // effect (https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      const initialPosition = station?.lat !== undefined && station.lng !== undefined
        ? { lat: station.lat, lng: station.lng }
        : null;
      setName(station?.name ?? "");
      setPosition(initialPosition);
      setRadiusMeters(station?.radiusMeters ?? 10);
      setMapView(initialMapView(initialPosition, contextPins));
    }
  }

  function handleUseCurrentPosition() {
    requestCurrentPosition().then((result) => {
      if (!result) {
        toast.error("Standort nicht verfügbar.");
        return;
      }
      setPosition(result);
      setMapView({ center: [result.lat, result.lng], zoom: STATION_ZOOM });
    });
  }

  function handleAddressSelect(result: AddressSearchResult) {
    setPosition({ lat: result.lat, lng: result.lng });
    setMapView({ center: [result.lat, result.lng], zoom: STATION_ZOOM });
  }

  function handleSave() {
    const sanitizedName = stripHtmlTags(name).trim();
    onSave({
      id: station?.id ?? crypto.randomUUID(),
      name: sanitizedName,
      lat: position?.lat,
      lng: position?.lng,
      radiusMeters,
      modules: station?.modules ?? [],
    });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Radix portals to <body>, outside the light-themed container from create/layout.tsx — re-apply the theme
          here so descendants without their own explicit color class render correctly (see PROJ-6 Implementation Notes). */}
      <SheetContent
        side="bottom"
        data-theme="light"
        className="text-foreground h-[92dvh] max-w-none sm:max-w-none flex flex-col gap-0 overflow-hidden rounded-t-card"
      >
        <SheetHeader className="shrink-0 pb-4">
          <SheetTitle className="font-display italic text-2xl uppercase text-foreground">
            {station ? "Station bearbeiten" : "Station hinzufügen"}
          </SheetTitle>
        </SheetHeader>

        {/* Only this middle band scrolls; header and footer stay put, so "Speichern" is reachable
            on every viewport height instead of being pushed out by the map's min-height
            (PROJ-7 refine 2026-09-06). The map keeps a usable size — the content scrolls instead.

            Field order matters here (PROJ-7 refine 2026-09-20): every control sits ABOVE the map,
            and the map is the last element. Previously the radius slider came after the map, and
            the map's wrapper — `flex-1 min-h-[220px]` — outgrew this scroll container on short
            viewports (measured at 320x568: scroller ends at y470, map wrapper at y524). That drew
            the map over the slider, and scrolling could not reach it because the scroller had less
            overflow than the map had overhang. A partly visible map still does its job; a partly
            visible control does not. */}
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="station-name" className="text-tech text-[10px] tracking-[0.1em]">
              Stationsname
            </Label>
            <Input
              id="station-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Der alte Brunnen"
              autoFocus
              maxLength={200}
            />
          </div>

          {/* Wraps below the label on narrow screens. "Aktuelle Position verwenden" is the longest
              label in the sheet and ran off the right edge at 320px and 360px when this row was a
              single `justify-between` line (PROJ-7 refine 2026-09-20). */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <Label className="text-tech text-[10px] tracking-[0.1em]">Position</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUseCurrentPosition}
              disabled={isLocating}
              className="rounded-pill h-11 min-w-0 text-tech text-[10px] tracking-[0.08em]"
            >
              <Crosshair className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{isLocating ? "Suche…" : "Aktuelle Position verwenden"}</span>
            </Button>
          </div>

          <AddressSearchField onSelect={handleAddressSelect} />

          <StationRadiusSlider value={radiusMeters} onChange={setRadiusMeters} />

          {/* Last element, and the only one allowed to be cut off when the content does not fit.
              `min-h-[220px]` keeps the floor from 2026-09-06; `flex-1` lets it take the leftover
              room on tall screens, where it grew to ~395px before this refinement. The difference
              to the old markup is the wrapper it sits in: this one is a plain block, so the map can
              no longer push past the scroll container and cover the controls above it. */}
          <div className="flex flex-col gap-2 flex-1 min-h-[220px]">
            <div className="relative flex-1 min-h-[220px] rounded-card overflow-hidden border border-border">
              <StationMap
                position={position}
                contextPins={contextPins}
                center={mapView.center}
                zoom={mapView.zoom}
                onPositionChange={(lat, lng) => setPosition({ lat, lng })}
              />
            </div>
            {!position && (
              <p className="font-body text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                Tippe auf die Karte, um die Station zu platzieren.
              </p>
            )}
          </div>
        </div>

        {/* SheetFooter defaults to flex-col-reverse on mobile — two stacked 44px buttons cost
            height that a 360x640 screen cannot spare. Side by side keeps it to one row, and
            pb-[14px] is the design system's safe-area gutter for a fixed bottom action. */}
        <SheetFooter className="shrink-0 flex-row gap-2 pt-4 pb-[14px]">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-pill h-11 text-tech text-xs tracking-[0.08em]"
            onClick={() => onOpenChange(false)}
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-pill h-11 bg-primary text-primary-foreground text-tech text-xs tracking-[0.08em] active:scale-[0.96] transition-all duration-fast ease-gq"
          >
            Speichern
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
