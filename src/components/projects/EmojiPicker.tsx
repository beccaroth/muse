import { useState, useMemo, useEffect } from 'react';
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
  const baseEmojis = (emojis as EmojiData[]).filter(
    (e) => e.group !== undefined && !e.skins && e.version <= 14
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

  // Derive loading state: loading if open but data not yet loaded
  const loading = open && !emojiData;

  // Load emoji data when popover opens
  useEffect(() => {
    if (open && !emojiData) {
      loadEmojiData().then(setEmojiData);
    }
  }, [open, emojiData]);

  const handleSelect = (emoji: string) => {
    onChange(emoji);
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onChange(null);
    setOpen(false);
    setSearch('');
  };

  const displayedEmojis = useMemo(() => {
    if (!emojiData || !search.trim()) return null;
    return emojiData.fuse.search(search, { limit: 50 }).map((r) => r.item);
  }, [search, emojiData]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
            autoFocus
          />

          <div className="h-64 overflow-y-auto">
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
                  displayedEmojis.map((emoji) => (
                    <button
                      key={emoji.hexcode}
                      type="button"
                      title={emoji.label}
                      className={cn(
                        'w-8 h-8 text-lg rounded hover:bg-muted transition-colors',
                        value === emoji.emoji && 'bg-muted ring-2 ring-primary'
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
                {Object.entries(emojiData.groupedEmojis).map(([groupId, groupEmojis]) => (
                  <div key={groupId}>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 sticky top-0 bg-popover">
                      {EMOJI_GROUPS[Number(groupId)] || 'Other'}
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {groupEmojis.slice(0, 40).map((emoji) => (
                        <button
                          key={emoji.hexcode}
                          type="button"
                          title={emoji.label}
                          className={cn(
                            'w-8 h-8 text-lg rounded hover:bg-muted transition-colors',
                            value === emoji.emoji && 'bg-muted ring-2 ring-primary'
                          )}
                          onClick={() => handleSelect(emoji.emoji)}
                        >
                          {emoji.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
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
