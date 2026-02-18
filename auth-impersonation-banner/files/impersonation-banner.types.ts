/**
 * Represents a user involved in an impersonation session.
 */
export interface ImpersonationUser {
  /** Display name of the user */
  name: string;
  /** Email address of the user */
  email: string;
  /** Optional avatar URL for future use */
  avatarUrl?: string;
}

/**
 * Props for the ImpersonationBanner component.
 */
export interface ImpersonationBannerProps {
  /** The user currently being impersonated */
  impersonatedUser: ImpersonationUser;
  /** The admin user performing the impersonation */
  adminUser: ImpersonationUser;
  /** Callback fired when the admin clicks "Stop Impersonating" */
  onStopImpersonating: () => void;
  /** Optional additional CSS classes for the banner container */
  className?: string;
}
