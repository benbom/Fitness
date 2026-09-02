export type NotificationPrefsFormState =
  { status: "idle" } | { status: "saved" } | { status: "error"; formError?: string };

export const INITIAL_NOTIF_PREFS_STATE: NotificationPrefsFormState = { status: "idle" };
