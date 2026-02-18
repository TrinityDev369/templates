"use client";

import {
  type CSSProperties,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EmojiData {
  emoji: string;
  name: string;
  category: string;
}

export interface EmojiPickerProps {
  /** Called when the user picks an emoji. */
  onSelect: (emoji: EmojiData) => void;
  /** Additional CSS class names. */
  className?: string;
  /** Inline styles applied to the root element. */
  style?: CSSProperties;
  /** Placeholder text for the search input. */
  searchPlaceholder?: string;
  /** Number of columns in the emoji grid. */
  columns?: number;
  /** Maximum number of recently-used emojis to remember. */
  maxRecent?: number;
  /** Color theme. `"auto"` follows the system preference via Tailwind `dark:`. */
  theme?: "light" | "dark" | "auto";
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES = [
  "Recently Used",
  "Smileys & Emotion",
  "People & Body",
  "Animals & Nature",
  "Food & Drink",
  "Travel & Places",
  "Activities",
  "Objects",
  "Symbols",
  "Flags",
] as const;

type Category = (typeof CATEGORIES)[number];

/** Tab icons shown in the category bar. */
const CATEGORY_ICONS: Record<Category, string> = {
  "Recently Used": "\u{1F552}",
  "Smileys & Emotion": "\u{1F600}",
  "People & Body": "\u{1F44B}",
  "Animals & Nature": "\u{1F43B}",
  "Food & Drink": "\u{1F354}",
  "Travel & Places": "\u{2708}\uFE0F",
  Activities: "\u{26BD}",
  Objects: "\u{1F4A1}",
  Symbols: "\u{2764}\uFE0F",
  Flags: "\u{1F3F3}\uFE0F",
};

const STORAGE_KEY = "emoji-picker-recent";
const EMOJI_BTN_SIZE = 36; // px — height of each emoji button row

// ---------------------------------------------------------------------------
// Inline emoji dataset (~260 emojis)
// ---------------------------------------------------------------------------

const EMOJI_DATA: EmojiData[] = [
  // ── Smileys & Emotion (35) ──
  { emoji: "\u{1F600}", name: "grinning face", category: "Smileys & Emotion" },
  { emoji: "\u{1F603}", name: "grinning face with big eyes", category: "Smileys & Emotion" },
  { emoji: "\u{1F604}", name: "grinning face with smiling eyes", category: "Smileys & Emotion" },
  { emoji: "\u{1F601}", name: "beaming face with smiling eyes", category: "Smileys & Emotion" },
  { emoji: "\u{1F606}", name: "grinning squinting face", category: "Smileys & Emotion" },
  { emoji: "\u{1F605}", name: "grinning face with sweat", category: "Smileys & Emotion" },
  { emoji: "\u{1F602}", name: "face with tears of joy", category: "Smileys & Emotion" },
  { emoji: "\u{1F923}", name: "rolling on the floor laughing", category: "Smileys & Emotion" },
  { emoji: "\u{1F642}", name: "slightly smiling face", category: "Smileys & Emotion" },
  { emoji: "\u{1F643}", name: "upside-down face", category: "Smileys & Emotion" },
  { emoji: "\u{1F609}", name: "winking face", category: "Smileys & Emotion" },
  { emoji: "\u{1F60A}", name: "smiling face with smiling eyes", category: "Smileys & Emotion" },
  { emoji: "\u{1F607}", name: "smiling face with halo", category: "Smileys & Emotion" },
  { emoji: "\u{1F970}", name: "smiling face with hearts", category: "Smileys & Emotion" },
  { emoji: "\u{1F60D}", name: "smiling face with heart-eyes", category: "Smileys & Emotion" },
  { emoji: "\u{1F929}", name: "star-struck", category: "Smileys & Emotion" },
  { emoji: "\u{1F618}", name: "face blowing a kiss", category: "Smileys & Emotion" },
  { emoji: "\u{1F61A}", name: "kissing face with closed eyes", category: "Smileys & Emotion" },
  { emoji: "\u{1F60B}", name: "face savoring food", category: "Smileys & Emotion" },
  { emoji: "\u{1F61C}", name: "winking face with tongue", category: "Smileys & Emotion" },
  { emoji: "\u{1F92A}", name: "zany face", category: "Smileys & Emotion" },
  { emoji: "\u{1F928}", name: "face with raised eyebrow", category: "Smileys & Emotion" },
  { emoji: "\u{1F9D0}", name: "face with monocle", category: "Smileys & Emotion" },
  { emoji: "\u{1F913}", name: "nerd face", category: "Smileys & Emotion" },
  { emoji: "\u{1F60E}", name: "smiling face with sunglasses", category: "Smileys & Emotion" },
  { emoji: "\u{1F614}", name: "pensive face", category: "Smileys & Emotion" },
  { emoji: "\u{1F61E}", name: "disappointed face", category: "Smileys & Emotion" },
  { emoji: "\u{1F622}", name: "crying face", category: "Smileys & Emotion" },
  { emoji: "\u{1F62D}", name: "loudly crying face", category: "Smileys & Emotion" },
  { emoji: "\u{1F621}", name: "pouting face", category: "Smileys & Emotion" },
  { emoji: "\u{1F92F}", name: "exploding head", category: "Smileys & Emotion" },
  { emoji: "\u{1F631}", name: "face screaming in fear", category: "Smileys & Emotion" },
  { emoji: "\u{1F914}", name: "thinking face", category: "Smileys & Emotion" },
  { emoji: "\u{1F92B}", name: "shushing face", category: "Smileys & Emotion" },
  { emoji: "\u{1F971}", name: "yawning face", category: "Smileys & Emotion" },

  // ── People & Body (25) ──
  { emoji: "\u{1F44B}", name: "waving hand", category: "People & Body" },
  { emoji: "\u{1F91A}", name: "raised back of hand", category: "People & Body" },
  { emoji: "\u{270B}", name: "raised hand", category: "People & Body" },
  { emoji: "\u{1F596}", name: "vulcan salute", category: "People & Body" },
  { emoji: "\u{1F44C}", name: "OK hand", category: "People & Body" },
  { emoji: "\u{1F90C}", name: "pinched fingers", category: "People & Body" },
  { emoji: "\u{1F90F}", name: "pinching hand", category: "People & Body" },
  { emoji: "\u{270C}\uFE0F", name: "victory hand", category: "People & Body" },
  { emoji: "\u{1F91E}", name: "crossed fingers", category: "People & Body" },
  { emoji: "\u{1F918}", name: "sign of the horns", category: "People & Body" },
  { emoji: "\u{1F919}", name: "call me hand", category: "People & Body" },
  { emoji: "\u{1F448}", name: "backhand index pointing left", category: "People & Body" },
  { emoji: "\u{1F449}", name: "backhand index pointing right", category: "People & Body" },
  { emoji: "\u{1F446}", name: "backhand index pointing up", category: "People & Body" },
  { emoji: "\u{1F44D}", name: "thumbs up", category: "People & Body" },
  { emoji: "\u{1F44E}", name: "thumbs down", category: "People & Body" },
  { emoji: "\u{270A}", name: "raised fist", category: "People & Body" },
  { emoji: "\u{1F44A}", name: "oncoming fist", category: "People & Body" },
  { emoji: "\u{1F91B}", name: "left-facing fist", category: "People & Body" },
  { emoji: "\u{1F91C}", name: "right-facing fist", category: "People & Body" },
  { emoji: "\u{1F44F}", name: "clapping hands", category: "People & Body" },
  { emoji: "\u{1F64C}", name: "raising hands", category: "People & Body" },
  { emoji: "\u{1F91D}", name: "handshake", category: "People & Body" },
  { emoji: "\u{1F64F}", name: "folded hands", category: "People & Body" },
  { emoji: "\u{1F4AA}", name: "flexed biceps", category: "People & Body" },

  // ── Animals & Nature (25) ──
  { emoji: "\u{1F436}", name: "dog face", category: "Animals & Nature" },
  { emoji: "\u{1F431}", name: "cat face", category: "Animals & Nature" },
  { emoji: "\u{1F42D}", name: "mouse face", category: "Animals & Nature" },
  { emoji: "\u{1F439}", name: "hamster", category: "Animals & Nature" },
  { emoji: "\u{1F430}", name: "rabbit face", category: "Animals & Nature" },
  { emoji: "\u{1F98A}", name: "fox", category: "Animals & Nature" },
  { emoji: "\u{1F43B}", name: "bear", category: "Animals & Nature" },
  { emoji: "\u{1F43C}", name: "panda", category: "Animals & Nature" },
  { emoji: "\u{1F428}", name: "koala", category: "Animals & Nature" },
  { emoji: "\u{1F42F}", name: "tiger face", category: "Animals & Nature" },
  { emoji: "\u{1F981}", name: "lion", category: "Animals & Nature" },
  { emoji: "\u{1F984}", name: "unicorn", category: "Animals & Nature" },
  { emoji: "\u{1F422}", name: "turtle", category: "Animals & Nature" },
  { emoji: "\u{1F40D}", name: "snake", category: "Animals & Nature" },
  { emoji: "\u{1F438}", name: "frog", category: "Animals & Nature" },
  { emoji: "\u{1F419}", name: "octopus", category: "Animals & Nature" },
  { emoji: "\u{1F41D}", name: "honeybee", category: "Animals & Nature" },
  { emoji: "\u{1F98B}", name: "butterfly", category: "Animals & Nature" },
  { emoji: "\u{1F339}", name: "rose", category: "Animals & Nature" },
  { emoji: "\u{1F33B}", name: "sunflower", category: "Animals & Nature" },
  { emoji: "\u{1F332}", name: "evergreen tree", category: "Animals & Nature" },
  { emoji: "\u{1F335}", name: "cactus", category: "Animals & Nature" },
  { emoji: "\u{1F340}", name: "four leaf clover", category: "Animals & Nature" },
  { emoji: "\u{1F341}", name: "maple leaf", category: "Animals & Nature" },
  { emoji: "\u{1F343}", name: "leaf fluttering in wind", category: "Animals & Nature" },

  // ── Food & Drink (25) ──
  { emoji: "\u{1F34E}", name: "red apple", category: "Food & Drink" },
  { emoji: "\u{1F34A}", name: "tangerine", category: "Food & Drink" },
  { emoji: "\u{1F34B}", name: "lemon", category: "Food & Drink" },
  { emoji: "\u{1F34C}", name: "banana", category: "Food & Drink" },
  { emoji: "\u{1F349}", name: "watermelon", category: "Food & Drink" },
  { emoji: "\u{1F347}", name: "grapes", category: "Food & Drink" },
  { emoji: "\u{1F353}", name: "strawberry", category: "Food & Drink" },
  { emoji: "\u{1F951}", name: "avocado", category: "Food & Drink" },
  { emoji: "\u{1F955}", name: "carrot", category: "Food & Drink" },
  { emoji: "\u{1F33D}", name: "ear of corn", category: "Food & Drink" },
  { emoji: "\u{1F354}", name: "hamburger", category: "Food & Drink" },
  { emoji: "\u{1F355}", name: "pizza", category: "Food & Drink" },
  { emoji: "\u{1F32E}", name: "taco", category: "Food & Drink" },
  { emoji: "\u{1F32F}", name: "burrito", category: "Food & Drink" },
  { emoji: "\u{1F363}", name: "sushi", category: "Food & Drink" },
  { emoji: "\u{1F35C}", name: "steaming bowl", category: "Food & Drink" },
  { emoji: "\u{1F370}", name: "shortcake", category: "Food & Drink" },
  { emoji: "\u{1F369}", name: "doughnut", category: "Food & Drink" },
  { emoji: "\u{1F36B}", name: "chocolate bar", category: "Food & Drink" },
  { emoji: "\u{1F36D}", name: "lollipop", category: "Food & Drink" },
  { emoji: "\u{2615}", name: "hot beverage", category: "Food & Drink" },
  { emoji: "\u{1F37A}", name: "beer mug", category: "Food & Drink" },
  { emoji: "\u{1F377}", name: "wine glass", category: "Food & Drink" },
  { emoji: "\u{1F379}", name: "tropical drink", category: "Food & Drink" },
  { emoji: "\u{1F9C3}", name: "beverage box", category: "Food & Drink" },

  // ── Travel & Places (20) ──
  { emoji: "\u{1F30D}", name: "globe showing Europe-Africa", category: "Travel & Places" },
  { emoji: "\u{1F30E}", name: "globe showing Americas", category: "Travel & Places" },
  { emoji: "\u{1F3D4}\uFE0F", name: "snow-capped mountain", category: "Travel & Places" },
  { emoji: "\u{1F3D6}\uFE0F", name: "beach with umbrella", category: "Travel & Places" },
  { emoji: "\u{1F3E0}", name: "house", category: "Travel & Places" },
  { emoji: "\u{1F3E2}", name: "office building", category: "Travel & Places" },
  { emoji: "\u{1F3EB}", name: "school", category: "Travel & Places" },
  { emoji: "\u{1F3E5}", name: "hospital", category: "Travel & Places" },
  { emoji: "\u{2708}\uFE0F", name: "airplane", category: "Travel & Places" },
  { emoji: "\u{1F680}", name: "rocket", category: "Travel & Places" },
  { emoji: "\u{1F697}", name: "automobile", category: "Travel & Places" },
  { emoji: "\u{1F68C}", name: "bus", category: "Travel & Places" },
  { emoji: "\u{1F682}", name: "locomotive", category: "Travel & Places" },
  { emoji: "\u{1F6A2}", name: "ship", category: "Travel & Places" },
  { emoji: "\u{1F6B2}", name: "bicycle", category: "Travel & Places" },
  { emoji: "\u{1F307}", name: "sunset", category: "Travel & Places" },
  { emoji: "\u{1F303}", name: "night with stars", category: "Travel & Places" },
  { emoji: "\u{1F309}", name: "bridge at night", category: "Travel & Places" },
  { emoji: "\u{26C5}", name: "sun behind cloud", category: "Travel & Places" },
  { emoji: "\u{1F308}", name: "rainbow", category: "Travel & Places" },

  // ── Activities (20) ──
  { emoji: "\u{26BD}", name: "soccer ball", category: "Activities" },
  { emoji: "\u{1F3C0}", name: "basketball", category: "Activities" },
  { emoji: "\u{1F3C8}", name: "american football", category: "Activities" },
  { emoji: "\u{26BE}", name: "baseball", category: "Activities" },
  { emoji: "\u{1F3BE}", name: "tennis", category: "Activities" },
  { emoji: "\u{1F3D0}", name: "volleyball", category: "Activities" },
  { emoji: "\u{1F3B3}", name: "bowling", category: "Activities" },
  { emoji: "\u{1F3AF}", name: "direct hit", category: "Activities" },
  { emoji: "\u{1F3AE}", name: "video game", category: "Activities" },
  { emoji: "\u{1F3B2}", name: "game die", category: "Activities" },
  { emoji: "\u{265F}\uFE0F", name: "chess pawn", category: "Activities" },
  { emoji: "\u{1F3A8}", name: "artist palette", category: "Activities" },
  { emoji: "\u{1F3AD}", name: "performing arts", category: "Activities" },
  { emoji: "\u{1F3B5}", name: "musical note", category: "Activities" },
  { emoji: "\u{1F3B6}", name: "musical notes", category: "Activities" },
  { emoji: "\u{1F3A4}", name: "microphone", category: "Activities" },
  { emoji: "\u{1F3B8}", name: "guitar", category: "Activities" },
  { emoji: "\u{1F3B9}", name: "musical keyboard", category: "Activities" },
  { emoji: "\u{1F3BA}", name: "trumpet", category: "Activities" },
  { emoji: "\u{1F3C6}", name: "trophy", category: "Activities" },

  // ── Objects (25) ──
  { emoji: "\u{1F4F1}", name: "mobile phone", category: "Objects" },
  { emoji: "\u{1F4BB}", name: "laptop", category: "Objects" },
  { emoji: "\u{1F5A5}\uFE0F", name: "desktop computer", category: "Objects" },
  { emoji: "\u{2328}\uFE0F", name: "keyboard", category: "Objects" },
  { emoji: "\u{1F4F7}", name: "camera", category: "Objects" },
  { emoji: "\u{1F4A1}", name: "light bulb", category: "Objects" },
  { emoji: "\u{1F526}", name: "flashlight", category: "Objects" },
  { emoji: "\u{1F4D6}", name: "open book", category: "Objects" },
  { emoji: "\u{1F4DA}", name: "books", category: "Objects" },
  { emoji: "\u{1F4DD}", name: "memo", category: "Objects" },
  { emoji: "\u{270F}\uFE0F", name: "pencil", category: "Objects" },
  { emoji: "\u{1F4CE}", name: "paperclip", category: "Objects" },
  { emoji: "\u{1F4CB}", name: "clipboard", category: "Objects" },
  { emoji: "\u{1F4C5}", name: "calendar", category: "Objects" },
  { emoji: "\u{1F4E7}", name: "email", category: "Objects" },
  { emoji: "\u{1F4E6}", name: "package", category: "Objects" },
  { emoji: "\u{1F512}", name: "locked", category: "Objects" },
  { emoji: "\u{1F513}", name: "unlocked", category: "Objects" },
  { emoji: "\u{1F511}", name: "key", category: "Objects" },
  { emoji: "\u{1F528}", name: "hammer", category: "Objects" },
  { emoji: "\u{1F527}", name: "wrench", category: "Objects" },
  { emoji: "\u{2699}\uFE0F", name: "gear", category: "Objects" },
  { emoji: "\u{1F9F2}", name: "magnet", category: "Objects" },
  { emoji: "\u{1F4B0}", name: "money bag", category: "Objects" },
  { emoji: "\u{1F48E}", name: "gem stone", category: "Objects" },

  // ── Symbols (20) ──
  { emoji: "\u{2764}\uFE0F", name: "red heart", category: "Symbols" },
  { emoji: "\u{1F9E1}", name: "orange heart", category: "Symbols" },
  { emoji: "\u{1F49B}", name: "yellow heart", category: "Symbols" },
  { emoji: "\u{1F49A}", name: "green heart", category: "Symbols" },
  { emoji: "\u{1F499}", name: "blue heart", category: "Symbols" },
  { emoji: "\u{1F49C}", name: "purple heart", category: "Symbols" },
  { emoji: "\u{2705}", name: "check mark", category: "Symbols" },
  { emoji: "\u{274C}", name: "cross mark", category: "Symbols" },
  { emoji: "\u{2757}", name: "exclamation mark", category: "Symbols" },
  { emoji: "\u{2753}", name: "question mark", category: "Symbols" },
  { emoji: "\u{1F4AF}", name: "hundred points", category: "Symbols" },
  { emoji: "\u{1F525}", name: "fire", category: "Symbols" },
  { emoji: "\u{2B50}", name: "star", category: "Symbols" },
  { emoji: "\u{1F31F}", name: "glowing star", category: "Symbols" },
  { emoji: "\u{26A1}", name: "high voltage", category: "Symbols" },
  { emoji: "\u{1F4A5}", name: "collision", category: "Symbols" },
  { emoji: "\u{1F389}", name: "party popper", category: "Symbols" },
  { emoji: "\u{2728}", name: "sparkles", category: "Symbols" },
  { emoji: "\u{267B}\uFE0F", name: "recycling symbol", category: "Symbols" },
  { emoji: "\u{1F6AB}", name: "prohibited", category: "Symbols" },

  // ── Flags (15) ──
  { emoji: "\u{1F1FA}\u{1F1F8}", name: "flag United States", category: "Flags" },
  { emoji: "\u{1F1EC}\u{1F1E7}", name: "flag United Kingdom", category: "Flags" },
  { emoji: "\u{1F1E9}\u{1F1EA}", name: "flag Germany", category: "Flags" },
  { emoji: "\u{1F1EB}\u{1F1F7}", name: "flag France", category: "Flags" },
  { emoji: "\u{1F1EA}\u{1F1F8}", name: "flag Spain", category: "Flags" },
  { emoji: "\u{1F1EE}\u{1F1F9}", name: "flag Italy", category: "Flags" },
  { emoji: "\u{1F1E7}\u{1F1F7}", name: "flag Brazil", category: "Flags" },
  { emoji: "\u{1F1EF}\u{1F1F5}", name: "flag Japan", category: "Flags" },
  { emoji: "\u{1F1E8}\u{1F1F3}", name: "flag China", category: "Flags" },
  { emoji: "\u{1F1EE}\u{1F1F3}", name: "flag India", category: "Flags" },
  { emoji: "\u{1F1E8}\u{1F1E6}", name: "flag Canada", category: "Flags" },
  { emoji: "\u{1F1E6}\u{1F1FA}", name: "flag Australia", category: "Flags" },
  { emoji: "\u{1F1F0}\u{1F1F7}", name: "flag South Korea", category: "Flags" },
  { emoji: "\u{1F1F2}\u{1F1FD}", name: "flag Mexico", category: "Flags" },
  { emoji: "\u{1F3F4}", name: "black flag", category: "Flags" },
];

// ---------------------------------------------------------------------------
// Helper: group emojis by category preserving order
// ---------------------------------------------------------------------------

function groupByCategory(emojis: EmojiData[]): Map<string, EmojiData[]> {
  const map = new Map<string, EmojiData[]>();
  for (const e of emojis) {
    const list = map.get(e.category);
    if (list) {
      list.push(e);
    } else {
      map.set(e.category, [e]);
    }
  }
  return map;
}

// ---------------------------------------------------------------------------
// Helper: localStorage persistence for recent emojis
// ---------------------------------------------------------------------------

function loadRecent(max: number): EmojiData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: EmojiData[] = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, max) : [];
  } catch {
    return [];
  }
}

function saveRecent(recent: EmojiData[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
  } catch {
    // localStorage may be full or unavailable — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EmojiPicker({
  onSelect,
  className,
  style,
  searchPlaceholder = "Search emojis...",
  columns = 8,
  maxRecent = 20,
  theme = "auto",
}: EmojiPickerProps) {
  // ── State ──
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("Smileys & Emotion");
  const [recent, setRecent] = useState<EmojiData[]>(() => loadRecent(maxRecent));
  const [hoveredEmoji, setHoveredEmoji] = useState<EmojiData | null>(null);
  const [focusIndex, setFocusIndex] = useState(-1);

  // ── Refs ──
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // ── Derived: filtered + grouped emojis ──
  const isSearching = search.trim().length > 0;
  const searchLower = search.trim().toLowerCase();

  const filteredEmojis = useMemo(() => {
    if (!isSearching) return EMOJI_DATA;
    return EMOJI_DATA.filter((e) => e.name.toLowerCase().includes(searchLower));
  }, [isSearching, searchLower]);

  const grouped = useMemo(() => groupByCategory(filteredEmojis), [filteredEmojis]);

  /** Flat list of emojis in display order (including recent when not searching). */
  const flatList = useMemo(() => {
    const list: EmojiData[] = [];
    if (!isSearching && recent.length > 0) {
      list.push(...recent);
    }
    for (const cat of CATEGORIES) {
      if (cat === "Recently Used") continue;
      const items = grouped.get(cat);
      if (items) list.push(...items);
    }
    return list;
  }, [grouped, isSearching, recent]);

  // ── Handlers ──

  const handleSelect = useCallback(
    (emoji: EmojiData) => {
      // Update recent list
      setRecent((prev: EmojiData[]) => {
        const next = [emoji, ...prev.filter((e: EmojiData) => e.emoji !== emoji.emoji)].slice(0, maxRecent);
        saveRecent(next);
        return next;
      });
      onSelect(emoji);
    },
    [onSelect, maxRecent],
  );

  const scrollToCategory = useCallback((cat: Category) => {
    setActiveCategory(cat);
    const el = categoryRefs.current.get(cat);
    if (el && scrollContainerRef.current) {
      const containerTop = scrollContainerRef.current.getBoundingClientRect().top;
      const elTop = el.getBoundingClientRect().top;
      scrollContainerRef.current.scrollTop += elTop - containerTop;
    }
  }, []);

  // ── Keyboard navigation ──
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const total = flatList.length;
      if (total === 0) return;

      switch (e.key) {
        case "ArrowRight": {
          e.preventDefault();
          setFocusIndex((prev: number) => (prev + 1) % total);
          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          setFocusIndex((prev: number) => (prev - 1 + total) % total);
          break;
        }
        case "ArrowDown": {
          e.preventDefault();
          setFocusIndex((prev: number) => {
            const next = prev + columns;
            return next < total ? next : prev;
          });
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setFocusIndex((prev: number) => {
            const next = prev - columns;
            return next >= 0 ? next : prev;
          });
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (focusIndex >= 0 && focusIndex < total) {
            handleSelect(flatList[focusIndex]);
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          // Blur the search input and reset focus
          searchInputRef.current?.blur();
          setFocusIndex(-1);
          break;
        }
      }
    },
    [flatList, columns, focusIndex, handleSelect],
  );

  // ── Scroll spy: update active category tab on scroll ──
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      const containerTop = container.getBoundingClientRect().top;
      let closest: Category = "Smileys & Emotion";
      let closestDist = Infinity;

      for (const [cat, el] of categoryRefs.current.entries()) {
        const dist = Math.abs(el.getBoundingClientRect().top - containerTop);
        if (dist < closestDist) {
          closestDist = dist;
          closest = cat as Category;
        }
      }
      setActiveCategory(closest);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  // ── Scroll focused emoji into view ──
  useEffect(() => {
    if (focusIndex < 0 || !gridRef.current) return;
    const buttons = gridRef.current.querySelectorAll<HTMLButtonElement>("[data-emoji-btn]");
    buttons[focusIndex]?.scrollIntoView({ block: "nearest" });
  }, [focusIndex]);

  // ── Theme class resolution ──
  const themeClass =
    theme === "light" ? "emoji-picker-light" : theme === "dark" ? "dark" : "";

  // ── Visible categories for tabs ──
  const visibleCategoryTabs = useMemo(() => {
    if (isSearching) return [];
    const tabs: Category[] = [];
    if (recent.length > 0) tabs.push("Recently Used");
    for (const cat of CATEGORIES) {
      if (cat === "Recently Used") continue;
      if (grouped.has(cat)) tabs.push(cat);
    }
    return tabs;
  }, [isSearching, recent.length, grouped]);

  // ── Render ──

  /** Renders a single category section. */
  const renderCategory = (cat: string, emojis: EmojiData[], startIndex: number) => (
    <div
      key={cat}
      ref={(el: HTMLDivElement | null) => {
        if (el) categoryRefs.current.set(cat, el);
      }}
    >
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1.5">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {cat}
        </span>
      </div>
      <div
        className="grid gap-0.5 px-1"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {emojis.map((emoji, i) => {
          const globalIdx = startIndex + i;
          const isFocused = globalIdx === focusIndex;
          return (
            <button
              key={`${cat}-${emoji.emoji}-${i}`}
              data-emoji-btn
              type="button"
              className={[
                "flex items-center justify-center rounded-md text-2xl leading-none transition-colors",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                isFocused ? "bg-gray-200 dark:bg-gray-600 ring-2 ring-blue-500" : "",
              ].join(" ")}
              style={{ width: EMOJI_BTN_SIZE, height: EMOJI_BTN_SIZE }}
              onClick={() => handleSelect(emoji)}
              onMouseEnter={() => setHoveredEmoji(emoji)}
              onMouseLeave={() => setHoveredEmoji(null)}
              onFocus={() => setFocusIndex(globalIdx)}
              title={emoji.name}
              aria-label={emoji.name}
              tabIndex={isFocused ? 0 : -1}
            >
              {emoji.emoji}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Build sections with running index so keyboard navigation maps correctly
  const sections: ReactNode[] = [];
  let runningIndex = 0;

  if (!isSearching && recent.length > 0) {
    sections.push(renderCategory("Recently Used", recent, runningIndex));
    runningIndex += recent.length;
  }

  for (const cat of CATEGORIES) {
    if (cat === "Recently Used") continue;
    const items = grouped.get(cat);
    if (!items || items.length === 0) continue;
    sections.push(renderCategory(cat, items, runningIndex));
    runningIndex += items.length;
  }

  return (
    <div
      className={[
        "flex flex-col rounded-xl border shadow-lg overflow-hidden",
        "bg-white text-gray-900 border-gray-200",
        "dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700",
        themeClass,
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: columns * EMOJI_BTN_SIZE + 24, maxHeight: 420, ...style }}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-label="Emoji picker"
    >
      {/* ── Search bar ── */}
      <div className="px-2 pt-2 pb-1">
        <input
          ref={searchInputRef}
          type="text"
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value);
            setFocusIndex(-1);
          }}
          placeholder={searchPlaceholder}
          className={[
            "w-full rounded-lg border px-3 py-1.5 text-sm outline-none transition-colors",
            "bg-gray-50 border-gray-200 placeholder-gray-400",
            "focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
            "dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-500",
            "dark:focus:border-blue-500 dark:focus:ring-blue-900",
          ].join(" ")}
          aria-label="Search emojis"
        />
      </div>

      {/* ── Category tabs ── */}
      {visibleCategoryTabs.length > 0 && (
        <div className="flex items-center gap-0.5 px-2 py-1 border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
          {visibleCategoryTabs.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => scrollToCategory(cat)}
              className={[
                "flex-shrink-0 rounded-md p-1 text-lg transition-colors",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                activeCategory === cat
                  ? "bg-gray-200 dark:bg-gray-600"
                  : "",
              ].join(" ")}
              title={cat}
              aria-label={`Category: ${cat}`}
            >
              {CATEGORY_ICONS[cat]}
            </button>
          ))}
        </div>
      )}

      {/* ── Emoji grid (scrollable) ── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden py-1"
        role="grid"
        aria-label="Emojis"
      >
        <div ref={gridRef}>
          {sections.length > 0 ? (
            sections
          ) : (
            <div className="flex items-center justify-center py-8 text-sm text-gray-400 dark:text-gray-500">
              No emojis found
            </div>
          )}
        </div>
      </div>

      {/* ── Preview bar ── */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-t border-gray-100 dark:border-gray-700 min-h-[32px]">
        {hoveredEmoji ? (
          <>
            <span className="text-xl leading-none">{hoveredEmoji.emoji}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {hoveredEmoji.name}
            </span>
          </>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Hover over an emoji to preview
          </span>
        )}
      </div>
    </div>
  );
}

export default EmojiPicker;
