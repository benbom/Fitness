/**
 * Delad state-typ för login-formuläret. Skiljs från actions.ts
 * eftersom `"use server"`-filer bara får exportera async functions.
 */
export type SigninFormState =
  | { status: "idle" }
  | {
      status: "error";
      fieldErrors: { email?: string; password?: string; form?: string };
      values: { email: string };
    };

export const INITIAL_SIGNIN_STATE: SigninFormState = { status: "idle" };
