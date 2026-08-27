# `lib/supabase/`

Tre Supabase-klienter, en per användningskontext, plus en middleware-helper.

| Fil                                | När den används                   | Vad den kan                                                                                    |
| ---------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------- |
| [`server.ts`](./server.ts)         | Server Components, Route Handlers | Läser sessionen från cookies. Respekterar RLS.                                                 |
| [`client.ts`](./client.ts)         | Client Components                 | Session i localStorage + cookies. Respekterar RLS.                                             |
| [`admin.ts`](./admin.ts)           | Server-only, edge cases           | Service-role. **Kringgår RLS.** Använd bara för Stripe-webhooks, GDPR-radering, adaptiv motor. |
| [`middleware.ts`](./middleware.ts) | Next.js middleware                | Refreshar session-JWT vid varje request.                                                       |
| [`types.ts`](./types.ts)           | Alla                              | Auto-genererad Database-typ (placeholder tills #48 landar).                                    |

## Session-livscykeln (kortversion)

1. Användaren loggar in i browsern via Client Component → Supabase sätter cookies.
2. Vid varje request kör `middleware.ts` `updateSupabaseSession()` som anropar `supabase.auth.getUser()` för att förnya JWT om den är nära utgång.
3. Server Components som anropar `createSupabaseServerClient()` läser samma cookies och får en klient som tänker "jag är den här användaren".
4. Client Components som anropar `createSupabaseBrowserClient()` gör direktanrop mot Supabase med session-cookien.

## RLS-regeln

**Standard-klienten (server + client) ska alltid respektera Row Level Security.**

Om du märker att du "måste" använda `createSupabaseAdminClient()` för att komma åt data — stanna först. Nästan alltid är rätt fix att skriva en RLS-policy som ger _aktuell användare_ rätt åtkomst, inte att kringgå säkerheten. Admin-klienten är för operationer _utan användarkontext_, inte som väg runt bristfälliga policies.

## Type-generation

När första schemat finns i Supabase (skapas i #48):

```bash
pnpm dlx supabase gen types typescript \
  --project-id <PROJECT_ID> \
  --schema public \
  > apps/web/lib/supabase/types.ts
```

Skriptet `pnpm --filter @vera/web supabase:types` gör samma sak om `SUPABASE_PROJECT_ID` finns i miljön.
