'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconX, IconExternalLink, IconFocus2 } from '@tabler/icons-react';
import type { GraphNode } from './types';
import { ENTITY_COLORS } from './types';

interface NodeDetailsProps {
  node: GraphNode | null;
  onClose: () => void;
  onFocusNode: (nodeId: string) => void;
}

export function NodeDetails({ node, onClose, onFocusNode }: NodeDetailsProps) {
  if (!node) return null;

  const properties = node.properties || {};

  return (
    <Card className="w-80 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: node.color || ENTITY_COLORS[node.type] }}
            />
            <CardTitle className="text-lg">{node.label}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <IconX className="h-4 w-4" />
          </Button>
        </div>
        <Badge
          variant="outline"
          style={{
            borderColor: node.color || ENTITY_COLORS[node.type],
            color: node.color || ENTITY_COLORS[node.type],
          }}
          className="w-fit"
        >
          {node.type}
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-4">
            {/* Properties */}
            {Object.entries(properties).length > 0 && (
              <div>
                <h4 className="text-muted-foreground mb-2 text-sm font-medium">Properties</h4>
                <div className="space-y-2">
                  {Object.entries(properties).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="text-muted-foreground">{key}:</span>{' '}
                      <span className="font-medium">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ID */}
            <div>
              <h4 className="text-muted-foreground mb-1 text-sm font-medium">ID</h4>
              <code className="bg-muted rounded px-2 py-1 text-xs">{node.id}</code>
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onFocusNode(node.id)}
          >
            <IconFocus2 className="mr-2 h-4 w-4" />
            Focus View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
