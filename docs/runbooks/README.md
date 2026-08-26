# Runbooks

Reproducerbara procedurer för ops-arbete. En runbook är inte klar innan någon annan än författaren kan följa den från början till slut och lyckas.

## Regler

- Varje runbook slutar med `Senast testad: ÅÅÅÅ-MM-DD av <namn>`. Är den äldre än 6 månader — kör igenom den innan du använder den skarpt.
- Skriv i imperativ. "Klicka på X", "Kör kommandot Y" — inte "man kan klicka på X".
- Varje steg har ett förväntat resultat. Om resultatet inte stämmer — säg vad man gör då.
- Länka till dashboards, konsoler, dokumentation. Inga anta-att-läsaren-vet.

## Nödvändiga runbooks för M0

Skapas under respektive issue:

| Runbook | Skapas i | Ägare |
|---|---|---|
| Deploy till staging | M0-04 | Platform |
| Rollback av misslyckad deploy | M0-04 | Platform |
| KMS-nyckelrotation | M0-11 | Platform |
| Postgres restore från snapshot | M0-08 | Backend |
| Incident-respons (on-call) | Innan MVP | Alla |
| Data-radering (edge cases) | M0-25 | Backend |
| Secrets-rotation per leverantör | M0-12 | Platform |

## Format

Kopiera `template.md` (skapas i M0-04).
