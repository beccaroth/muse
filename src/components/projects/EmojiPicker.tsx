import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import Fuse from 'fuse.js';

// Group emojis by their group number
const EMOJI_GROUPS: Record<number, string> = {
  0: 'Smileys & Emotion',
  1: 'People & Body',
  2: 'Animals & Nature',
  3: 'Food & Drink',
  4: 'Travel & Places',
  5: 'Activities',
  6: 'Objects',
  7: 'Symbols',
  8: 'Flags',
};

interface EmojiData {
  emoji: string;
  hexcode: string;
  label: string;
  tags?: string[];
  group?: number;
  skins?: unknown[];
  version: number;
}

interface EmojiPickerProps {
  value: string | null;
  onChange: (emoji: string | null) => void;
}

// Cache for loaded emoji data
let emojiCache: {
  baseEmojis: EmojiData[];
  fuse: Fuse<EmojiData>;
  groupedEmojis: Record<number, EmojiData[]>;
} | null = null;

async function loadEmojiData() {
  if (emojiCache) return emojiCache;

  const { default: emojis } = await import('emojibase-data/en/data.json');

  // Filter to only include base emojis (no skin tone variants, etc.)
  // Note: emojis with `skins` are the base versions that support skin tones - we want those
  // Skin tone variants are stored inside the `skins` array, not as top-level entries
  const baseEmojis = (emojis as EmojiData[]).filter(
    (e) => e.group !== undefined && e.version <= 14
  );

  // Create search index
  const fuse = new Fuse(baseEmojis, {
    keys: ['label', 'tags'],
    threshold: 0.3,
    includeScore: true,
  });

  // Group emojis
  const groupedEmojis: Record<number, EmojiData[]> = {};
  for (const emoji of baseEmojis) {
    const group = emoji.group ?? 0;
    if (!groupedEmojis[group]) groupedEmojis[group] = [];
    groupedEmojis[group].push(emoji);
  }

  emojiCache = { baseEmojis, fuse, groupedEmojis };
  return emojiCache;
}


export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [emojiData, setEmojiData] = useState(emojiCache);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive loading state: loading if open but data not yet loaded
  const loading = open && !emojiData;

  // Load emoji data when popover opens
  useEffect(() => {
    if (open && !emojiData) {
      loadEmojiData().then(setEmojiData);
    }
  }, [open, emojiData]);

  const handleSelect = useCallback((emoji: string) => {
    onChange(emoji);
    setOpen(false);
    setSearch('');
    setFocusedIndex(-1);
  }, [onChange]);

  const handleClear = () => {
    onChange(null);
    setOpen(false);
    setSearch('');
    setFocusedIndex(-1);
  };

  const displayedEmojis = useMemo(() => {
    if (!emojiData || !search.trim()) return null;
    return emojiData.fuse.search(search, { limit: 50 }).map((r) => r.item);
  }, [search, emojiData]);

  // Flatten all visible emojis for keyboard navigation
  const flatEmojis = useMemo(() => {
    if (displayedEmojis) return displayedEmojis;
    if (!emojiData) return [];
    // Flatten grouped emojis (same order as rendered, max 40 per group)
    return Object.values(emojiData.groupedEmojis).flatMap((group) =>
      group.slice(0, 40)
    );
  }, [displayedEmojis, emojiData]);

  // Scroll focused emoji into view
  useEffect(() => {
    if (focusedIndex >= 0 && containerRef.current) {
      const buttons = containerRef.current.querySelectorAll('button[type="button"]');
      const focusedButton = buttons[focusedIndex] as HTMLElement | undefined;
      focusedButton?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [focusedIndex]);

  // Find the button directly above/below the current one by matching x position
  const findVerticalNeighbor = useCallback((currentIndex: number, direction: 'up' | 'down'): number => {
    if (!containerRef.current) return currentIndex;
    const buttons = containerRef.current.querySelectorAll('button[type="button"]');
    if (buttons.length === 0 || currentIndex < 0) return currentIndex;

    const currentButton = buttons[currentIndex] as HTMLElement;
    if (!currentButton) return currentIndex;

    const currentLeft = currentButton.offsetLeft;
    const currentTop = currentButton.offsetTop;

    if (direction === 'down') {
      // Find the first button below with the closest x position
      let bestIndex = currentIndex;
      let bestDistance = Infinity;
      let foundNextRow = false;

      for (let i = currentIndex + 1; i < buttons.length; i++) {
        const btn = buttons[i] as HTMLElement;
        if (btn.offsetTop > currentTop) {
          foundNextRow = true;
          const distance = Math.abs(btn.offsetLeft - currentLeft);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = i;
          }
          // If we've moved to a third row, stop
          if (btn.offsetTop > (buttons[bestIndex] as HTMLElement).offsetTop) {
            break;
          }
        }
      }

      return foundNextRow ? bestIndex : currentIndex;
    } else {
      // Find the button above with the closest x position
      let bestIndex = currentIndex;
      let bestDistance = Infinity;
      let foundPrevRow = false;

      for (let i = currentIndex - 1; i >= 0; i--) {
        const btn = buttons[i] as HTMLElement;
        if (btn.offsetTop < currentTop) {
          foundPrevRow = true;
          const distance = Math.abs(btn.offsetLeft - currentLeft);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = i;
          }
          // If we've moved to a row above that, stop
          if (btn.offsetTop < (buttons[bestIndex] as HTMLElement).offsetTop) {
            break;
          }
        }
      }

      return foundPrevRow ? bestIndex : currentIndex;
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (flatEmojis.length === 0) return;

      const maxIndex = flatEmojis.length - 1;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => findVerticalNeighbor(prev === -1 ? 0 : prev, 'down'));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => {
            if (prev === -1) return -1;
            return findVerticalNeighbor(prev, 'up');
          });
          break;
        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            setFocusedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
          } else {
            setFocusedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
          }
          break;
        case 'Enter':
          if (focusedIndex >= 0 && focusedIndex < flatEmojis.length) {
            e.preventDefault();
            handleSelect(flatEmojis[focusedIndex].emoji);
          }
          break;
        case 'Escape':
          setOpen(false);
          break;
      }
    },
    [flatEmojis, focusedIndex, handleSelect, findVerticalNeighbor]
  );

  return (
    <Popover open={open} onOpenChange={(isOpen) => { setOpen(isOpen); setFocusedIndex(-1); }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-16 h-10 text-xl',
            !value && 'text-muted-foreground'
          )}
        >
          {value || '😀'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="space-y-3">
          <Input
            placeholder="Search emojis..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setFocusedIndex(-1); }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown' && flatEmojis.length > 0) {
                e.preventDefault();
                setFocusedIndex(0);
                containerRef.current?.focus();
              } else if (e.key === 'Escape') {
                setOpen(false);
              }
            }}
            className="h-8"
            autoFocus
          />

          <div
            ref={containerRef}
            className="h-64 overflow-y-auto focus:outline-none"
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">Loading emojis...</p>
              </div>
            ) : displayedEmojis ? (
              // Search results
              <div className="flex flex-wrap gap-1">
                {displayedEmojis.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">No emojis found</p>
                ) : (
                  displayedEmojis.map((emoji, index) => (
                    <button
                      key={emoji.hexcode}
                      type="button"
                      title={emoji.label}
                      className={cn(
                        'w-8 h-8 text-lg rounded hover:bg-muted transition-colors',
                        value === emoji.emoji && 'bg-muted ring-2 ring-primary',
                        focusedIndex === index && 'ring-2 ring-ring bg-muted'
                      )}
                      onClick={() => handleSelect(emoji.emoji)}
                    >
                      {emoji.emoji}
                    </button>
                  ))
                )}
              </div>
            ) : emojiData ? (
              // Categorized view
              <div className="space-y-3">
                {(() => {
                  let runningIndex = 0;
                  return Object.entries(emojiData.groupedEmojis).map(([groupId, groupEmojis]) => {
                    const startIndex = runningIndex;
                    const slicedEmojis = groupEmojis.slice(0, 40);
                    runningIndex += slicedEmojis.length;
                    return (
                      <div key={groupId}>
                        <h4 className="text-xs font-medium text-muted-foreground mb-2 sticky top-0 bg-popover">
                          {EMOJI_GROUPS[Number(groupId)] || 'Other'}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {slicedEmojis.map((emoji, idx) => (
                            <button
                              key={emoji.hexcode}
                              type="button"
                              title={emoji.label}
                              className={cn(
                                'w-8 h-8 text-lg rounded hover:bg-muted transition-colors',
                                value === emoji.emoji && 'bg-muted ring-2 ring-primary',
                                focusedIndex === startIndex + idx && 'ring-2 ring-ring bg-muted'
                              )}
                              onClick={() => handleSelect(emoji.emoji)}
                            >
                              {emoji.emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            ) : null}
          </div>

          {value && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={handleClear}
            >
              Clear icon
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
