export type NewPasswordFormState =
  | { status: "idle" }
  | {
      status: "error";
      fieldErrors: { password?: string; form?: string };
    };

export const INITIAL_NEW_PASSWORD_STATE: NewPasswordFormState = { status: "idle" };
