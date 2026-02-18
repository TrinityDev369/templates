"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  User,
  Palette,
  Bell,
  Shield,
  Save,
  Check,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/* -------------------------------------------------------------------------- */
/*  Save-feedback hook                                                        */
/* -------------------------------------------------------------------------- */

function useSaveFeedback(duration = 2000) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), duration);
    return () => clearTimeout(timer);
  }, [saved, duration]);

  const trigger = useCallback(() => setSaved(true), []);

  return { saved, trigger } as const;
}

/* -------------------------------------------------------------------------- */
/*  Notification row                                                          */
/* -------------------------------------------------------------------------- */

function NotificationRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Password input with show/hide toggle                                      */
/* -------------------------------------------------------------------------- */

function PasswordInput({
  id,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Save button with feedback                                                 */
/* -------------------------------------------------------------------------- */

function SaveButton({
  saved,
  onSave,
  label = "Save Changes",
}: {
  saved: boolean;
  onSave: () => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Button onClick={onSave} disabled={saved}>
        {saved ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Settings saved
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            {label}
          </>
        )}
      </Button>
      {saved && (
        <span className="text-sm text-emerald-600 dark:text-emerald-400 animate-in fade-in">
          Your changes have been saved successfully.
        </span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Placeholder data                                                          */
/* -------------------------------------------------------------------------- */

const PROFILE_DEFAULTS = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  bio: "Product designer and frontend engineer with 8 years of experience building modern web applications.",
  avatar: "",
  initials: "AJ",
};

/* -------------------------------------------------------------------------- */
/*  Page component                                                            */
/* -------------------------------------------------------------------------- */

export default function DashboardSettingsPage() {
  /* ---- Profile state ---- */
  const [name, setName] = useState(PROFILE_DEFAULTS.name);
  const [email, setEmail] = useState(PROFILE_DEFAULTS.email);
  const [bio, setBio] = useState(PROFILE_DEFAULTS.bio);

  /* ---- Appearance state ---- */
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">(
    "medium"
  );
  const [compactMode, setCompactMode] = useState(false);

  /* ---- Notification state ---- */
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
    securityAlerts: true,
  });

  const toggleNotification = (key: keyof typeof notifications) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  /* ---- Security state ---- */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);

  /* ---- Save feedback per tab ---- */
  const profileFeedback = useSaveFeedback();
  const appearanceFeedback = useSaveFeedback();
  const notificationsFeedback = useSaveFeedback();
  const securityFeedback = useSaveFeedback();

  /* ---- Derived values ---- */
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const passwordMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {/* ---- Page header ---- */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* -------------------------------------------------------------- */}
        {/*  Profile Tab                                                    */}
        {/* -------------------------------------------------------------- */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your personal information and public profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={PROFILE_DEFAULTS.avatar} alt={name} />
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Profile Photo</p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or WebP. Max 2MB.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Upload
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Brief description for your profile. Max 300 characters.
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <SaveButton
                saved={profileFeedback.saved}
                onSave={profileFeedback.trigger}
              />
            </CardFooter>
          </Card>
        </TabsContent>

        {/* -------------------------------------------------------------- */}
        {/*  Appearance Tab                                                 */}
        {/* -------------------------------------------------------------- */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme selection */}
              <div className="space-y-3">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-4">
                  {(
                    [
                      {
                        value: "light" as const,
                        label: "Light",
                        icon: Sun,
                        preview: "bg-white border",
                        lines: "bg-gray-200",
                      },
                      {
                        value: "dark" as const,
                        label: "Dark",
                        icon: Moon,
                        preview: "bg-zinc-900 border-zinc-700",
                        lines: "bg-zinc-700",
                      },
                      {
                        value: "system" as const,
                        label: "System",
                        icon: Monitor,
                        preview:
                          "bg-gradient-to-r from-white from-50% to-zinc-900 to-50% border",
                        lines: "",
                      },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTheme(opt.value)}
                      className={cn(
                        "relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors hover:border-primary/50",
                        theme === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-muted"
                      )}
                    >
                      {theme === opt.value && (
                        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      {/* Mini preview */}
                      <div
                        className={cn("h-16 w-full rounded-md", opt.preview)}
                      >
                        {opt.value !== "system" && (
                          <div className="flex flex-col gap-1.5 p-2">
                            <div
                              className={cn("h-1.5 w-3/4 rounded", opt.lines)}
                            />
                            <div
                              className={cn("h-1.5 w-1/2 rounded", opt.lines)}
                            />
                            <div
                              className={cn("h-1.5 w-2/3 rounded", opt.lines)}
                            />
                          </div>
                        )}
                        {opt.value === "system" && (
                          <div className="flex h-full">
                            <div className="flex w-1/2 flex-col gap-1.5 p-2">
                              <div className="h-1.5 w-3/4 rounded bg-gray-200" />
                              <div className="h-1.5 w-1/2 rounded bg-gray-200" />
                            </div>
                            <div className="flex w-1/2 flex-col gap-1.5 p-2">
                              <div className="h-1.5 w-3/4 rounded bg-zinc-700" />
                              <div className="h-1.5 w-1/2 rounded bg-zinc-700" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <opt.icon className="h-4 w-4" />
                        {opt.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Font size selector */}
              <div className="space-y-3">
                <Label htmlFor="font-size">Font Size</Label>
                <Select
                  value={fontSize}
                  onValueChange={(v) =>
                    setFontSize(v as "small" | "medium" | "large")
                  }
                >
                  <SelectTrigger id="font-size" className="w-48">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (14px)</SelectItem>
                    <SelectItem value="medium">Medium (16px)</SelectItem>
                    <SelectItem value="large">Large (18px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Compact mode */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compact">Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce spacing and padding throughout the interface.
                  </p>
                </div>
                <Switch
                  id="compact"
                  checked={compactMode}
                  onCheckedChange={setCompactMode}
                />
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <SaveButton
                saved={appearanceFeedback.saved}
                onSave={appearanceFeedback.trigger}
                label="Save Preferences"
              />
            </CardFooter>
          </Card>
        </TabsContent>

        {/* -------------------------------------------------------------- */}
        {/*  Notifications Tab                                              */}
        {/* -------------------------------------------------------------- */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <NotificationRow
                label="Email Notifications"
                description="Receive email updates about your account activity and reports."
                checked={notifications.email}
                onCheckedChange={() => toggleNotification("email")}
              />

              <Separator />

              <NotificationRow
                label="Push Notifications"
                description="Receive push notifications for time-sensitive updates."
                checked={notifications.push}
                onCheckedChange={() => toggleNotification("push")}
              />

              <Separator />

              <NotificationRow
                label="Marketing Emails"
                description="Receive emails about new features, tips, and product updates."
                checked={notifications.marketing}
                onCheckedChange={() => toggleNotification("marketing")}
              />

              <Separator />

              <NotificationRow
                label="Security Alerts"
                description="Get notified about unusual account activity and login attempts."
                checked={notifications.securityAlerts}
                onCheckedChange={() => toggleNotification("securityAlerts")}
              />
            </CardContent>
            <CardFooter className="border-t pt-6">
              <SaveButton
                saved={notificationsFeedback.saved}
                onSave={notificationsFeedback.trigger}
                label="Save Preferences"
              />
            </CardFooter>
          </Card>
        </TabsContent>

        {/* -------------------------------------------------------------- */}
        {/*  Security Tab                                                   */}
        {/* -------------------------------------------------------------- */}
        <TabsContent value="security" className="space-y-6">
          {/* Password change */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <PasswordInput
                  id="current-password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <PasswordInput
                  id="new-password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={setNewPassword}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <PasswordInput
                  id="confirm-password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                />
                {passwordMismatch && (
                  <p className="text-sm text-destructive">
                    Passwords do not match.
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <SaveButton
                saved={securityFeedback.saved}
                onSave={() => {
                  if (!passwordMismatch) {
                    securityFeedback.trigger();
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }
                }}
                label="Update Password"
              />
            </CardFooter>
          </Card>

          {/* Two-factor authentication */}
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Enable 2FA</p>
                  <p className="text-sm text-muted-foreground">
                    Require a verification code in addition to your password when
                    signing in.
                  </p>
                </div>
                <Switch
                  checked={twoFactor}
                  onCheckedChange={setTwoFactor}
                  aria-label="Toggle two-factor authentication"
                />
              </div>
              {twoFactor && (
                <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Two-factor authentication is enabled. You will be prompted
                    for a verification code on your next sign-in.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
