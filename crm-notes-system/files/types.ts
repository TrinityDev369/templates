/**
 * CRM Notes System — Type Definitions
 *
 * Lightweight notes with @mention support for contacts, deals, and companies.
 * No external dependencies beyond React.
 */

// -----------------------------------------------------------------------------
// Entity Types
// -----------------------------------------------------------------------------

export type NoteEntityType = 'contact' | 'deal' | 'company';

export interface Note {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string; // ISO 8601
  updatedAt?: string; // ISO 8601
  mentions: string[];
  entityType: NoteEntityType;
  entityId: string;
}

// -----------------------------------------------------------------------------
// Component Props
// -----------------------------------------------------------------------------

export interface NotesFeedProps {
  notes: Note[];
  currentUserId: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, content: string) => void;
}

export interface NoteComposerProps {
  onSubmit: (content: string, mentions: string[]) => void;
  authorName: string;
  placeholder?: string;
}
