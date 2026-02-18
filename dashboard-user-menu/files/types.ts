export interface UserMenuUser {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface UserMenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  destructive?: boolean;
}
