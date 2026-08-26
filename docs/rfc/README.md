# RFC — Request for Comments

När vi står inför ett beslut som är för stort för en PR-kommentar men ännu inte redo att bli en ADR: öppna en RFC.

## Process

1. Kopiera [`000-template.md`](./000-template.md) till `NNN-kort-namn.md` (nästa lediga nummer).
2. Öppna PR med label `rfc`.
3. Diskutera i PR-kommentarerna. Minst 3 arbetsdagar.
4. När beslutat:
   - **Accepted** → konvertera till ADR under [`docs/adr/`](../adr/), stäng RFC-PR med länk till ADR:n.
   - **Rejected** → merga RFC-PR med status uppdaterad till "Rejected" och skäl. Bevaras som beslutshistorik.
   - **Deferred** → merga med status "Deferred" och tidshorisont. Tas upp igen aktivt vid det datumet.

## När RFC, när ADR direkt?

- **RFC** när det är genuint öppet, kräver diskussion, eller påverkar flera team.
- **ADR direkt** när beslutet är taget i annan kanal (arkitektmöte, incident, tidigare RFC) och detta är dokumentationen.

## Index

Inga öppna RFC:er ännu.
