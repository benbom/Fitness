import { describe, expect, it } from "vitest";

import {
  DEFAULT_NOTIFICATION_PREFS,
  MARKETING_CATEGORY,
  notificationPrefsSchema,
  parseStoredPrefs,
} from "./notification-prefs";

describe("DEFAULT_NOTIFICATION_PREFS", () => {
  it("uppfyller schemat", () => {
    expect(notificationPrefsSchema.safeParse(DEFAULT_NOTIFICATION_PREFS).success).toBe(true);
  });

  it("marknadsföring är AV som default (F-PR-05)", () => {
    expect(DEFAULT_NOTIFICATION_PREFS.categories[MARKETING_CATEGORY].enabled).toBe(false);
    expect(DEFAULT_NOTIFICATION_PREFS.categories[MARKETING_CATEGORY].frequency).toBe("off");
  });

  it("quiet_hours default 22-07 med enabled=true", () => {
    expect(DEFAULT_NOTIFICATION_PREFS.quiet_hours.enabled).toBe(true);
    expect(DEFAULT_NOTIFICATION_PREFS.quiet_hours.startHour).toBe(22);
    expect(DEFAULT_NOTIFICATION_PREFS.quiet_hours.endHour).toBe(7);
  });
});

describe("notificationPrefsSchema", () => {
  it("förkastar okänd frekvens", () => {
    const bad = {
      ...DEFAULT_NOTIFICATION_PREFS,
      categories: {
        ...DEFAULT_NOTIFICATION_PREFS.categories,
        training_reminders: { enabled: true, frequency: "hourly" },
      },
    };
    expect(notificationPrefsSchema.safeParse(bad).success).toBe(false);
  });

  it("förkastar timmar utanför 0-23", () => {
    const bad = {
      ...DEFAULT_NOTIFICATION_PREFS,
      quiet_hours: { enabled: true, startHour: 25, endHour: 7 },
    };
    expect(notificationPrefsSchema.safeParse(bad).success).toBe(false);
  });

  it("coerce:ar timmar från strängar (för HTML form)", () => {
    const parsed = notificationPrefsSchema.safeParse({
      ...DEFAULT_NOTIFICATION_PREFS,
      quiet_hours: { enabled: true, startHour: "23", endHour: "6" },
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.quiet_hours.startHour).toBe(23);
      expect(parsed.data.quiet_hours.endHour).toBe(6);
    }
  });

  it("kräver alla kategorier", () => {
    const missing = {
      ...DEFAULT_NOTIFICATION_PREFS,
      categories: {
        training_reminders: { enabled: true, frequency: "daily" },
      },
    };
    expect(notificationPrefsSchema.safeParse(missing).success).toBe(false);
  });
});

describe("parseStoredPrefs", () => {
  it("giltig payload passerar oförändrad", () => {
    expect(parseStoredPrefs(DEFAULT_NOTIFICATION_PREFS)).toEqual(DEFAULT_NOTIFICATION_PREFS);
  });

  it("faller tillbaka till defaults för trasig payload", () => {
    expect(parseStoredPrefs({ garbage: true })).toEqual(DEFAULT_NOTIFICATION_PREFS);
    expect(parseStoredPrefs(null)).toEqual(DEFAULT_NOTIFICATION_PREFS);
    expect(parseStoredPrefs(undefined)).toEqual(DEFAULT_NOTIFICATION_PREFS);
  });

  it("efter fallback är marketing fortfarande AV", () => {
    const parsed = parseStoredPrefs({ some: "old format" });
    expect(parsed.categories[MARKETING_CATEGORY].enabled).toBe(false);
  });
});
