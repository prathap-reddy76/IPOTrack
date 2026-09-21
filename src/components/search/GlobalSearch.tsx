"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchAll } from "@/lib/api";

import { IPO, NewsArticle } from '@/types';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ ipos: IPO[]; news: NewsArticle[] }>({ ipos: [], news: [] });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length > 1) {
        try {
          const res = await searchAll(query);
          setResults(res || { ipos: [], news: [] });
        } catch (error) {
          console.error("Search error:", error);
          setResults({ ipos: [], news: [] });
        }
      } else {
        setResults({ ipos: [], news: [] });
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const onSelect = (url: string) => {
    router.push(url);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search IPOs, companies, or news... (Ctrl+K)" 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found for &quot;{query}&quot;</CommandEmpty>
        
        {results.ipos && results.ipos.length > 0 && (
          <CommandGroup heading="IPOs">
            {results.ipos.map((ipo) => (
              <CommandItem 
                key={`ipo-${ipo.id}`} 
                onSelect={() => onSelect(`/ipos/${ipo.slug}`)}
                className="cursor-pointer"
              >
                <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium">{ipo.name}</span>
                  <span className="text-xs text-muted-foreground">{ipo.type || 'IPO'}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.news && results.news.length > 0 && (
          <CommandGroup heading="News">
            {results.news.map((item) => (
              <CommandItem 
                key={`news-${item.id}`} 
                onSelect={() => onSelect(`/news/${item.slug}`)}
                className="cursor-pointer"
              >
                <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium line-clamp-1">{item.title}</span>
                  <span className="text-xs text-muted-foreground">{item.date || 'Recent'}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
