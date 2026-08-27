/**
 * Delad state-typ för signup-formuläret. Skiljs från actions.ts
 * eftersom `"use server"`-filer bara får exportera async functions.
 */
export type SignupFormState =
  | { status: "idle" }
  | {
      status: "error";
      fieldErrors: { email?: string; password?: string; consent?: string; form?: string };
      values: { email: string };
    };

export const INITIAL_SIGNUP_STATE: SignupFormState = { status: "idle" };
