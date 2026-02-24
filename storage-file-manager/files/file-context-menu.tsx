"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  FolderOpen,
  Download,
  Pencil,
  Copy,
  FolderInput,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContextAction, FileContextMenuProps } from "./types";

interface MenuItem {
  action: ContextAction;
  label: string;
  icon: React.ElementType;
  destructive?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { action: "open", label: "Open", icon: FolderOpen },
  { action: "download", label: "Download", icon: Download },
  { action: "rename", label: "Rename", icon: Pencil },
  { action: "copy", label: "Copy", icon: Copy },
  { action: "move", label: "Move to...", icon: FolderInput },
  { action: "delete", label: "Delete", icon: Trash2, destructive: true },
];

/** Context menu popup displayed on right-click of a file/folder entry. */
export function FileContextMenu({
  file,
  position,
  onAction,
  onClose,
}: FileContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClickOutside, handleKeyDown]);

  // Adjust position so the menu doesn't overflow the viewport
  const adjustedStyle: React.CSSProperties = {
    position: "fixed",
    top: position.y,
    left: position.x,
    zIndex: 50,
  };

  return (
    <div
      ref={menuRef}
      style={adjustedStyle}
      role="menu"
      className="min-w-[180px] rounded-md border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
    >
      {MENU_ITEMS.map((item, index) => {
        const Icon = item.icon;
        // Add separator before delete
        const showSeparator = item.action === "delete" && index > 0;
        return (
          <div key={item.action}>
            {showSeparator && (
              <div className="my-1 h-px bg-border" role="separator" />
            )}
            <button
              type="button"
              role="menuitem"
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors",
                item.destructive
                  ? "text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                  : "text-popover-foreground hover:bg-accent focus:bg-accent"
              )}
              onClick={() => {
                onAction(item.action, file);
                onClose();
              }}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          </div>
        );
      })}
    </div>
  );
}
