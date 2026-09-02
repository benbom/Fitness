import type { InjuryArea, InjurySeverity } from "@/lib/validators/injury";

export type InjuryFormEntry = {
  area: InjuryArea;
  severity: InjurySeverity;
  note: string;
};

export type InjuriesFormState =
  | { status: "idle" }
  | { status: "saved" }
  | {
      status: "error";
      formError?: string;
    };

export const INITIAL_INJURIES_STATE: InjuriesFormState = { status: "idle" };
