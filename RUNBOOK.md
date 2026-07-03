# Runbook: einmalige manuelle Einrichtung

Der gesamte Code, alle Tests, CI/CD und das Deployment-Skript sind fertig und
automatisiert. Was **nicht** automatisiert werden kann: Accounts, die an
deine Identität bzw. Zahlungsdaten gebunden sind. Das sind die einzigen
Schritte, die du selbst einmalig erledigen musst — danach läuft das System
ohne weiteres Zutun (jeder `git push` auf `main` deployed automatisch).

Geschätzter Zeitaufwand: 20–30 Minuten. Kosten: 0 €.

---

## Schritt 1 — GitHub-Repository

1. Erstelle ein neues (privates) Repository auf GitHub, z. B. `validate-api`.
2. Im lokalen Projektordner (`C:\Users\jonas\projects\validate-api`, bereits
   `git init`-isiert und committed):
   ```
   git remote add origin https://github.com/<dein-user>/validate-api.git
   git push -u origin main
   ```

## Schritt 2 — Cloudflare-Account + Worker (Hosting, kostenlos)

1. Kostenloses Konto anlegen: https://dash.cloudflare.com/sign-up (keine
   Kreditkarte nötig für den Workers-Free-Plan).
2. Lokal einmalig einloggen und den ersten manuellen Deploy machen, damit die
   Subdomain zugewiesen wird:
   ```
   cd C:\Users\jonas\projects\validate-api
   npx wrangler login
   npx wrangler deploy
   ```
   Die Ausgabe zeigt deine URL, z. B.
   `https://validate-api.<dein-subdomain>.workers.dev`. Trage diese URL in
   `openapi.yaml` unter `servers:` ein (ersetzt den Platzhalter
   `<your-subdomain>`) und committe die Änderung.
3. API-Token für automatisiertes Deployment erstellen:
   - https://dash.cloudflare.com/profile/api-tokens → "Create Token" →
     Template "Edit Cloudflare Workers" → erstellen.
   - Account-ID findest du auf der Cloudflare-Dashboard-Startseite rechts.

## Schritt 3 — Secrets in GitHub hinterlegen

Im GitHub-Repo unter **Settings → Secrets and variables → Actions → New
repository secret** folgende drei Secrets anlegen:

| Name | Wert |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Token aus Schritt 2.3 |
| `CLOUDFLARE_ACCOUNT_ID` | Account-ID aus Schritt 2.3 |
| `RAPIDAPI_PROXY_SECRET` | Ein von dir generiertes zufälliges Secret, z. B. `openssl rand -hex 32` — merke dir den Wert für Schritt 4 |

Sobald diese drei Secrets gesetzt sind, deployed jeder Push auf `main`
automatisch (`.github/workflows/deploy.yml`).

## Schritt 4 — RapidAPI-Account + Listing (Monetarisierung)

1. Kostenloses Konto anlegen: https://rapidapi.com/auth/sign-up
2. Als Provider registrieren: https://rapidapi.com/provider (kostenlos).
3. "Add New API" → OpenAPI-Spec importieren: lade `openapi.yaml` aus diesem
   Projekt hoch. RapidAPI generiert daraus automatisch die komplette
   Endpunkt-Dokumentation für die Marketplace-Seite.
4. Unter API-Einstellungen → **Security**: das gleiche Secret eintragen, das
   du in Schritt 3 als `RAPIDAPI_PROXY_SECRET` gesetzt hast (RapidAPI sendet
   dieses Secret dann bei jedem Request in `X-RapidAPI-Proxy-Secret`; der
   Worker prüft es in `src/middleware/auth.ts` und lehnt alles andere ab).
5. Preismodell festlegen (z. B. Free-Tier mit Rate-Limit + kostenpflichtige
   Tiers für höhere Limits — Standard-Pattern auf RapidAPI, im Dashboard
   unter "Pricing" konfigurierbar).
6. **Payout verknüpfen:** RapidAPI-Dashboard → Payout-Einstellungen → PayPal
   auswählen und deinen bereits vorhandenen PayPal-Account verbinden.
7. Listing veröffentlichen ("Publish").

## Danach: kein manueller Eingriff mehr nötig

- Code-Änderungen → `git push` auf `main` → CI testet → automatischer Deploy
  auf Cloudflare Workers.
- Abrechnung, Kundenverwaltung, Auszahlung → läuft vollständig über RapidAPI.
- Logs/Monitoring → Cloudflare-Dashboard → dein Worker → "Logs"-Tab
  (strukturierte JSON-Logs, siehe `src/middleware/logger.ts`).

## Was danach optional noch sinnvoll ist (nicht blockierend)

- Marketing der API auf RapidAPI (Kategorie, Keywords, Beschreibung
  optimieren) — beeinflusst Sichtbarkeit im Marketplace.
- Sobald erste Einnahmen reinkommen: wie im Gespräch vereinbart, Budget für
  z. B. einen eigenen Custom-Domain-Namen (`api.deinprojekt.de` statt
  `*.workers.dev`) einsetzen — wirkt professioneller, ist aber nicht
  notwendig, damit das System funktioniert.
