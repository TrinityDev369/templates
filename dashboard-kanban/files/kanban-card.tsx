'use client';

import type { DragEvent } from 'react';
import { GripVertical, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { KanbanCard } from './types';

/* -------------------------------------------------------------------------- */
/*  Priority config                                                           */
/* -------------------------------------------------------------------------- */

const PRIORITY_STYLES: Record<KanbanCard['priority'], { badge: string; border: string }> = {
  low: { badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', border: 'border-l-slate-400' },
  medium: { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', border: 'border-l-blue-500' },
  high: { badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', border: 'border-l-yellow-500' },
  urgent: { badge: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', border: 'border-l-red-500' },
};

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

interface KanbanCardComponentProps {
  card: KanbanCard;
  isDragging?: boolean;
  onDragStart: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onClick?: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function KanbanCardComponent({
  card,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onClick,
}: KanbanCardComponentProps) {
  const priority = PRIORITY_STYLES[card.priority];
  const initials = card.assignee
    ? card.assignee.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '';

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        'group relative cursor-grab border-l-4 p-3 transition-all hover:shadow-md active:cursor-grabbing',
        priority.border,
        isDragging && 'opacity-50 shadow-lg rotate-1 scale-[1.02]',
      )}
    >
      {/* Drag handle */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-60">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="pl-3">
        {/* Title */}
        <p className="text-sm font-semibold leading-snug">{card.title}</p>

        {/* Description */}
        {card.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {card.description}
          </p>
        )}

        {/* Labels */}
        {card.labels && card.labels.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {card.labels.map((label) => (
              <span
                key={label.name}
                className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: `color-mix(in srgb, ${label.color} 15%, transparent)`,
                  color: label.color,
                }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        {/* Footer: priority, due date, assignee */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', priority.badge)}>
              {card.priority}
            </Badge>
            {card.dueDate && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(card.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>
          {card.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </Card>
  );
}
