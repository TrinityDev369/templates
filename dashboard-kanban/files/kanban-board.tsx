'use client';

import { useState, useCallback, type DragEvent } from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { KanbanCardComponent } from './kanban-card';
import type { KanbanColumn, KanbanCard } from './types';

/* -------------------------------------------------------------------------- */
/*  Placeholder data                                                          */
/* -------------------------------------------------------------------------- */

const PLACEHOLDER_COLUMNS: KanbanColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    cards: [
      { id: 'c1', title: 'Research competitor pricing', description: 'Analyze top 5 competitors and document pricing tiers.', priority: 'low', labels: [{ name: 'Research', color: 'blue' }], assignee: { name: 'Alice M.' } },
      { id: 'c2', title: 'Update privacy policy', priority: 'medium', assignee: { name: 'Bob K.' }, dueDate: '2026-03-01' },
      { id: 'c3', title: 'Explore new analytics provider', description: 'Evaluate Posthog, Mixpanel, Amplitude.', priority: 'low', labels: [{ name: 'Infra', color: 'purple' }] },
    ],
  },
  {
    id: 'todo',
    title: 'To Do',
    cards: [
      { id: 'c4', title: 'Design onboarding flow', description: 'Create wireframes for the 3-step onboarding wizard.', priority: 'high', labels: [{ name: 'Design', color: 'green' }], assignee: { name: 'Carol S.' }, dueDate: '2026-02-25' },
      { id: 'c5', title: 'Write API docs for v2 endpoints', priority: 'medium', assignee: { name: 'Dave R.' } },
      { id: 'c6', title: 'Set up E2E tests for auth', priority: 'high', labels: [{ name: 'Testing', color: 'orange' }], dueDate: '2026-02-22' },
      { id: 'c7', title: 'Add dark mode toggle', priority: 'low', assignee: { name: 'Eve L.' } },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    cards: [
      { id: 'c8', title: 'Implement payment integration', description: 'Stripe checkout session + webhooks.', priority: 'urgent', labels: [{ name: 'Backend', color: 'red' }], assignee: { name: 'Frank W.' }, dueDate: '2026-02-20' },
      { id: 'c9', title: 'Build dashboard charts', priority: 'high', assignee: { name: 'Grace T.' } },
      { id: 'c10', title: 'Migrate DB to new schema', description: 'Run migration scripts and validate data integrity.', priority: 'urgent', labels: [{ name: 'Infra', color: 'purple' }], assignee: { name: 'Hank P.' } },
    ],
  },
  {
    id: 'review',
    title: 'Review',
    cards: [
      { id: 'c11', title: 'PR: User profile page', description: 'Needs design review and accessibility check.', priority: 'medium', assignee: { name: 'Alice M.' }, labels: [{ name: 'Frontend', color: 'green' }] },
      { id: 'c12', title: 'PR: Email templates', priority: 'low', assignee: { name: 'Bob K.' } },
      { id: 'c13', title: 'PR: Rate limiter middleware', priority: 'high', labels: [{ name: 'Backend', color: 'red' }], assignee: { name: 'Carol S.' } },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    cards: [
      { id: 'c14', title: 'Set up CI/CD pipeline', priority: 'high', assignee: { name: 'Dave R.' }, labels: [{ name: 'Infra', color: 'purple' }] },
      { id: 'c15', title: 'Create landing page', priority: 'medium', assignee: { name: 'Eve L.' } },
      { id: 'c16', title: 'Configure monitoring alerts', priority: 'low', assignee: { name: 'Frank W.' }, labels: [{ name: 'Infra', color: 'purple' }] },
      { id: 'c17', title: 'Implement login & signup', priority: 'high', assignee: { name: 'Grace T.' } },
      { id: 'c18', title: 'Design system foundations', priority: 'medium', labels: [{ name: 'Design', color: 'green' }], assignee: { name: 'Hank P.' } },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

interface KanbanBoardProps {
  columns?: KanbanColumn[];
  onCardMove?: (cardId: string, fromColumn: string, toColumn: string, position: number) => void;
  onCardClick?: (card: KanbanCard) => void;
  onAddCard?: (columnId: string) => void;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function KanbanBoard({
  columns: initialColumns = PLACEHOLDER_COLUMNS,
  onCardMove,
  onCardClick,
  onAddCard,
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  /* ---- drag handlers ---- */

  const handleDragStart = useCallback((e: DragEvent<HTMLDivElement>, cardId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);
    setDraggedCardId(cardId);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>, toColumnId: string) => {
      e.preventDefault();
      const cardId = e.dataTransfer.getData('text/plain');
      if (!cardId) return;

      setColumns((prev) => {
        let movedCard: KanbanCard | undefined;
        let fromColumnId = '';

        const updated = prev.map((col) => {
          const idx = col.cards.findIndex((c) => c.id === cardId);
          if (idx !== -1) {
            fromColumnId = col.id;
            movedCard = col.cards[idx];
            return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
          }
          return col;
        });

        if (!movedCard || fromColumnId === toColumnId) return prev;

        const result = updated.map((col) => {
          if (col.id === toColumnId) {
            const newCards = [...col.cards, movedCard!];
            onCardMove?.(cardId, fromColumnId, toColumnId, newCards.length - 1);
            return { ...col, cards: newCards };
          }
          return col;
        });

        return result;
      });

      setDraggedCardId(null);
      setDragOverColumn(null);
    },
    [onCardMove],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedCardId(null);
    setDragOverColumn(null);
  }, []);

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 p-4" style={{ minWidth: `${columns.length * 300}px` }}>
        {columns.map((column) => (
          <div
            key={column.id}
            className={cn(
              'flex w-[280px] shrink-0 flex-col rounded-lg border bg-muted/30 transition-colors',
              dragOverColumn === column.id && draggedCardId && 'border-dashed border-primary bg-primary/5',
            )}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {column.cards.length}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onAddCard?.(column.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onAddCard?.(column.id)}>
                      Add card
                    </DropdownMenuItem>
                    <DropdownMenuItem>Clear column</DropdownMenuItem>
                    <DropdownMenuItem>Rename</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 px-2 pb-2">
              {column.cards.map((card) => (
                <KanbanCardComponent
                  key={card.id}
                  card={card}
                  isDragging={draggedCardId === card.id}
                  onDragStart={(e) => handleDragStart(e, card.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onCardClick?.(card)}
                />
              ))}
              {column.cards.length === 0 && (
                <div className="flex h-20 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                  Drop cards here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
