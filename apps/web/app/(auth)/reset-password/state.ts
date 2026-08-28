export type ResetRequestFormState =
  | { status: "idle" }
  | {
      status: "error";
      fieldErrors: { email?: string; form?: string };
      values: { email: string };
    };

export const INITIAL_RESET_REQUEST_STATE: ResetRequestFormState = { status: "idle" };
