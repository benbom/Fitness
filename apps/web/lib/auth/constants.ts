/**
 * Delade auth-konstanter som får importeras från både server- och
 * client-kod. `password.ts` är markerad `server-only` och kan därmed
 * inte konsumeras från Client Components — därför bor delade värden
 * här istället.
 */
export const MIN_PASSWORD_LENGTH = 12;
