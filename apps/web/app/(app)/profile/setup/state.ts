import type { ProfileInput } from "@/lib/validators/profile";

export type ProfileFormState =
  | { status: "idle" }
  | { status: "saved" }
  | {
      status: "error";
      fieldErrors: Partial<Record<keyof ProfileInput | "form", string>>;
    };

export const INITIAL_PROFILE_STATE: ProfileFormState = { status: "idle" };
