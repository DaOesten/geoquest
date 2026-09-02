"use client";

import { useState } from "react";
import { Loader2, MapPin, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAddressSearch, type AddressSearchResult } from "@/hooks/use-address-search";

interface AddressSearchFieldProps {
  onSelect: (result: AddressSearchResult) => void;
}

export function AddressSearchField({ onSelect }: AddressSearchFieldProps) {
  const [query, setQuery] = useState("");
  const [listClosed, setListClosed] = useState(false);
  const { results, isLoading, error, search } = useAddressSearch();

  function handleValueChange(value: string) {
    setQuery(value);
    setListClosed(false);
    search(value);
  }

  function handleSelect(result: AddressSearchResult) {
    onSelect(result);
    setQuery(result.displayName);
    setListClosed(true);
  }

  function handleClear() {
    setQuery("");
    setListClosed(false);
    search("");
  }

  const showList = !listClosed && query.trim().length > 0;

  return (
    <Command
      shouldFilter={false}
      className="h-auto overflow-visible rounded-card border border-border bg-background"
    >
      <div className="relative">
        <CommandInput
          value={query}
          onValueChange={handleValueChange}
          placeholder="Adresse suchen, z.B. Musterstraße 1"
          className="font-body text-sm h-11 pr-8"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Suchtext löschen"
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {showList && (
        <CommandList className="border-t border-border">
          {isLoading && (
            <div className="flex items-center gap-2 px-3 py-3 font-body text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Suche…
            </div>
          )}
          {!isLoading && error && (
            <CommandEmpty className="font-body text-xs text-muted-foreground py-3">
              Suche nicht verfügbar.
            </CommandEmpty>
          )}
          {!isLoading && !error && (
            <CommandEmpty className="font-body text-xs text-muted-foreground py-3">
              Keine Ergebnisse gefunden.
            </CommandEmpty>
          )}
          {!isLoading && !error && results.length > 0 && (
            <CommandGroup>
              {results.map((result) => (
                <CommandItem
                  key={result.id}
                  value={result.id}
                  onSelect={() => handleSelect(result)}
                  className="font-body text-sm gap-2 items-start py-2"
                >
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gq-teal" />
                  <span className="line-clamp-2">{result.displayName}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      )}
    </Command>
  );
}
