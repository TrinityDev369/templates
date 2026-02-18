"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface TagInputProps {
  /** Controlled tag list */
  value?: string[];
  /** Initial tags for uncontrolled mode */
  defaultValue?: string[];
  /** Called when the tag list changes */
  onChange?: (tags: string[]) => void;
  /** Autocomplete suggestions shown in the dropdown */
  suggestions?: string[];
  /** Placeholder text when no tags are present */
  placeholder?: string;
  /** Maximum number of tags allowed */
  maxTags?: number;
  /** Maximum character length per tag */
  maxLength?: number;
  /** Minimum character length per tag */
  minLength?: number;
  /** Custom validation function. Return true to accept, false to reject, or a string error message. */
  validate?: (tag: string) => boolean | string;
  /** Disable the entire input */
  disabled?: boolean;
  /** Additional class names for the outer container */
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/** Normalize a tag string: trim whitespace and collapse internal spaces. */
function normalizeTag(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/** Simple fuzzy match: checks if all characters of the query appear in order within the target. */
function fuzzyMatch(target: string, query: string): boolean {
  const lower = target.toLowerCase();
  const q = query.toLowerCase();
  let cursor = 0;
  for (let i = 0; i < lower.length && cursor < q.length; i++) {
    if (lower[i] === q[cursor]) {
      cursor++;
    }
  }
  return cursor === q.length;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function TagInput({
  value,
  defaultValue = [],
  onChange,
  suggestions = [],
  placeholder = "Add a tag...",
  maxTags,
  maxLength,
  minLength,
  validate,
  disabled = false,
  className,
}: TagInputProps) {
  /* ---- Controlled / uncontrolled state ---- */
  const isControlled = value !== undefined;
  const [internalTags, setInternalTags] = useState<string[]>(defaultValue);
  const tags = isControlled ? value : internalTags;

  const setTags = useCallback(
    (next: string[] | ((prev: string[]) => string[])) => {
      if (isControlled) {
        const resolved =
          typeof next === "function" ? next(value ?? []) : next;
        onChange?.(resolved);
      } else {
        setInternalTags((prev) => {
          const resolved = typeof next === "function" ? next(prev) : next;
          onChange?.(resolved);
          return resolved;
        });
      }
    },
    [isControlled, value, onChange],
  );

  /* ---- Input state ---- */
  const [inputValue, setInputValue] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ---- Tag limit check ---- */
  const isAtLimit = maxTags !== undefined && tags.length >= maxTags;

  /* ---- Filtered suggestions ---- */
  const filteredSuggestions = useMemo(() => {
    if (!inputValue.trim()) return suggestions.filter((s) => !tags.includes(s));
    return suggestions.filter(
      (s) => !tags.includes(s) && fuzzyMatch(s, inputValue),
    );
  }, [suggestions, tags, inputValue]);

  /* ---- Show/hide popover based on filtered results ---- */
  useEffect(() => {
    if (filteredSuggestions.length > 0 && inputValue.trim() && !disabled && !isAtLimit) {
      setPopoverOpen(true);
    } else {
      setPopoverOpen(false);
    }
  }, [filteredSuggestions.length, inputValue, disabled, isAtLimit]);

  /* ---- Clear error after a delay ---- */
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  /* ---- Validate and add a tag ---- */
  const addTag = useCallback(
    (raw: string) => {
      const tag = normalizeTag(raw);
      if (!tag) return;

      // Duplicate check
      if (tags.includes(tag)) {
        setError(`"${tag}" already added`);
        return;
      }

      // Max tags limit
      if (isAtLimit) {
        setError(`Maximum of ${maxTags} tags reached`);
        return;
      }

      // Min length
      if (minLength !== undefined && tag.length < minLength) {
        setError(`Tag must be at least ${minLength} characters`);
        return;
      }

      // Max length
      if (maxLength !== undefined && tag.length > maxLength) {
        setError(`Tag must be at most ${maxLength} characters`);
        return;
      }

      // Custom validation
      if (validate) {
        const result = validate(tag);
        if (result === false) {
          setError(`"${tag}" is not valid`);
          return;
        }
        if (typeof result === "string") {
          setError(result);
          return;
        }
      }

      setTags((prev) => [...prev, tag]);
      setInputValue("");
      setError(null);
      setPopoverOpen(false);
    },
    [tags, isAtLimit, maxTags, minLength, maxLength, validate, setTags],
  );

  /* ---- Remove a tag by index ---- */
  const removeTag = useCallback(
    (index: number) => {
      if (disabled) return;
      setTags((prev) => prev.filter((_, i) => i !== index));
      setError(null);
      // Re-focus the input after removal
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    [disabled, setTags],
  );

  /* ---- Keyboard handling on the text input ---- */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      // Enter or comma: add the current input as a tag
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        if (inputValue.trim()) {
          addTag(inputValue);
        }
        return;
      }

      // Backspace on empty input: remove the last tag
      if (e.key === "Backspace" && !inputValue && tags.length > 0) {
        e.preventDefault();
        removeTag(tags.length - 1);
        return;
      }

      // Escape: close suggestions
      if (e.key === "Escape") {
        setPopoverOpen(false);
        return;
      }
    },
    [inputValue, tags.length, addTag, removeTag],
  );

  /* ---- Handle pasting multiple tags (comma or newline separated) ---- */
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData("text/plain");
      // Only intercept if paste contains separators
      if (!pasted.includes(",") && !pasted.includes("\n")) return;

      e.preventDefault();
      const candidates = pasted
        .split(/[,\n]+/)
        .map(normalizeTag)
        .filter(Boolean);
      for (const candidate of candidates) {
        addTag(candidate);
      }
    },
    [addTag],
  );

  /* ---- Select a suggestion ---- */
  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      addTag(suggestion);
      setPopoverOpen(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    [addTag],
  );

  /* ---- Focus the input when clicking the container ---- */
  const handleContainerClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  /* ---- Render ---- */
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* Main container — looks like an input field */}
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <div
            ref={containerRef}
            role="combobox"
            aria-expanded={popoverOpen}
            aria-haspopup="listbox"
            aria-disabled={disabled}
            tabIndex={-1}
            onClick={handleContainerClick}
            className={cn(
              "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2",
              "ring-offset-background transition-colors",
              "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
              disabled && "cursor-not-allowed opacity-50",
              error && "border-destructive focus-within:ring-destructive",
            )}
          >
            {/* Rendered tags */}
            {tags.map((tag, index) => (
              <Badge
                key={`${tag}-${index}`}
                variant="secondary"
                className={cn(
                  "gap-1 pr-1 text-sm font-normal",
                  disabled && "opacity-70",
                )}
              >
                <span className="max-w-[200px] truncate">{tag}</span>
                {!disabled && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 shrink-0 rounded-full p-0 hover:bg-muted-foreground/20"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      removeTag(index);
                    }}
                    aria-label={`Remove tag: ${tag}`}
                    type="button"
                    tabIndex={-1}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </Badge>
            ))}

            {/* Inline text input */}
            {!isAtLimit && (
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={tags.length === 0 ? placeholder : ""}
                disabled={disabled}
                maxLength={maxLength}
                className={cn(
                  "min-w-[80px] flex-1 bg-transparent text-sm outline-none",
                  "placeholder:text-muted-foreground",
                  "disabled:cursor-not-allowed",
                )}
                aria-label="Tag input"
                aria-autocomplete="list"
                autoComplete="off"
                spellCheck={false}
              />
            )}
          </div>
        </PopoverTrigger>

        {/* Autocomplete suggestions dropdown */}
        {filteredSuggestions.length > 0 && (
          <PopoverContent
            className="w-[--radix-popover-trigger-width] p-0"
            align="start"
            sideOffset={4}
            onOpenAutoFocus={(e: Event) => e.preventDefault()}
          >
            <Command>
              <CommandInput
                placeholder="Search suggestions..."
                value={inputValue}
                onValueChange={setInputValue}
                className="sr-only"
                aria-hidden
                tabIndex={-1}
              />
              <CommandList>
                <CommandEmpty>No matching suggestions.</CommandEmpty>
                <CommandGroup>
                  {filteredSuggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion}
                      value={suggestion}
                      onSelect={() => handleSuggestionSelect(suggestion)}
                      className="cursor-pointer"
                    >
                      <span className="truncate">{suggestion}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>

      {/* Error message */}
      {error && (
        <p
          className="text-[0.8rem] font-medium text-destructive"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}

      {/* Tag count hint when approaching the limit */}
      {maxTags !== undefined && tags.length > 0 && (
        <p className="text-[0.8rem] text-muted-foreground">
          {tags.length} / {maxTags} tags
        </p>
      )}
    </div>
  );
}
