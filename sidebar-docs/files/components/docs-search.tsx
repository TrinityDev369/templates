"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DocsSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function DocsSearch({ value, onChange }: DocsSearchProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search docs..."
        value={value}
        onChange={handleChange}
        className="h-8 pl-8 text-sm"
      />
    </div>
  );
}
