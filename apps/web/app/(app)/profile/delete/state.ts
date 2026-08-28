export type DeleteAccountFormState =
  | { status: "idle" }
  | {
      status: "error";
      fieldErrors: { action?: string; confirmation?: string; form?: string };
    };

export const INITIAL_DELETE_STATE: DeleteAccountFormState = { status: "idle" };
