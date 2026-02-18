'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  IconSearch,
  IconZoomIn,
  IconZoomOut,
  IconFocusCentered,
  IconRefresh,
  IconFilter,
} from '@tabler/icons-react';
import type { EntityType, GraphStats } from './types';
import { ENTITY_COLORS } from './types';

const ALL_ENTITY_TYPES: EntityType[] = [
  'Component',
  'DesignToken',
  'Contract',
  'Requirement',
  'Person',
  'Concept',
  'Feature',
  'Document',
  'API',
  'Chunk',
];

interface GraphControlsProps {
  stats: GraphStats | null;
  onSearch: (query: string) => void;
  onFilterChange: (types: EntityType[] | undefined) => void;
  onRefresh: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  loading?: boolean;
}

export function GraphControls({
  stats,
  onSearch,
  onFilterChange,
  onRefresh,
  onZoomIn,
  onZoomOut,
  onFitView,
  loading = false,
}: GraphControlsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<EntityType[]>([]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleType = (type: EntityType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];

    setSelectedTypes(newTypes);
    onFilterChange(newTypes.length > 0 ? newTypes : undefined);
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    onFilterChange(undefined);
  };

  return (
    <div className="space-y-3">
      {/* Search and Actions */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <IconSearch className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon" onClick={handleSearch} disabled={loading}>
          <IconSearch className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading}>
          <IconRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onZoomIn}>
          <IconZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onZoomOut}>
          <IconZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onFitView}>
          <IconFocusCentered className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        {stats && (
          <span className="text-muted-foreground text-sm">
            {stats.node_count} nodes · {stats.edge_count} edges
          </span>
        )}
      </div>

      {/* Type Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <IconFilter className="text-muted-foreground h-4 w-4" />
        {ALL_ENTITY_TYPES.map((type) => {
          const count = stats?.types[type] || 0;
          const isSelected = selectedTypes.includes(type);
          return (
            <Badge
              key={type}
              variant={isSelected ? 'default' : 'outline'}
              className="cursor-pointer transition-colors"
              style={{
                backgroundColor: isSelected ? ENTITY_COLORS[type] : undefined,
                borderColor: ENTITY_COLORS[type],
                color: isSelected ? 'white' : ENTITY_COLORS[type],
              }}
              onClick={() => toggleType(type)}
            >
              {type} {count > 0 && `(${count})`}
            </Badge>
          );
        })}
        {selectedTypes.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
