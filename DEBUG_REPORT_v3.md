# 🐞 DEBUG_REPORT_v3.md – CommunityConnect (Post-Rebuild Check)

**Datum:** 2025-04-17  
**Scope:** Volledige technische en UX-debug van build `CommunityConnect (3).zip`

---

## ❗ Kritieke backend bugs

### 🔴 1. Geen UUID primary keys in database
- Alle tabellen (`users`, `prompts`, `submissions`, etc.) gebruiken `serial()` i.p.v. `uuid()`
- ❗ Breekt Supabase, client-validatie en externe integraties
- ✅ Fix: gebruik `uuid()` voor id’s, met default `gen_random_uuid()`

### 🔴 2. Endpoint voor `GET /api/prompts/daily` ontbreekt
- Niet aanwezig in routes of storage
- ✅ Fix: voeg backend route toe + filter `isDaily === true`

### 🔴 3. Uploads niet MIME/beveiligd
- Geen validatie op `image/jpeg`, `image/png`, `image/webp`
- Geen check op max 5MB bestandsgrootte
- ✅ Fix: Voeg server-side controle toe vóór opslag

### 🔴 4. Navigatie via `window.location.href`
- Breekt React-state en veroorzaakt reload
- ✅ Fix: vervang door `<Link>` (Wouter)

---

## 🟡 Overige backendproblemen

### 🟠 5. `role = null` bij load
- Geen fallback of guarding in state → consolefouten
- ✅ Fix: voeg default role toe in store

### 🟠 6. Geen `UNIQUE`-constraint op likes
- Maakt dubbele likes per user mogelijk
- ✅ Fix: voeg composite unique toe op `(userId, submissionId)`

---

## ❗ Frontend / UX bugs

### 🔴 7. Geen horizontale scroll bij promptfeed
- Promptkaarten missen `min-w-[250px]` of `flex-shrink-0`
- ✅ Fix: voeg deze klassen toe aan PromptCard

### 🔴 8. Previous collaborations layout gebroken
- Cards zonder grid, spacing of hiërarchie
- ✅ Fix: gebruik `grid-cols-2` + `gap-4` + `hover:shadow`

### 🟠 9. Space/Enter key missen focus events
- Kaarten missen keydown-afhandeling
- ✅ Fix: voeg `onKeyDown` + `tabIndex={0}` toe aan `<Card>`

### 🟠 10. Lazy loading ontbreekt bij images
- Alle afbeeldingen worden eager geladen
- ✅ Fix: voeg `loading="lazy"` toe aan `<img>`

---

## 🧪 Samenvatting

| Type    | Bug                              | Oplossing                        |
|---------|-----------------------------------|----------------------------------|
| Backend | UUID ontbreekt                   | `uuid()` met default             |
| Backend | Daily prompt endpoint mist       | Route + filter toevoegen         |
| Backend | Geen bestandsvalidatie           | MIME-check + size-limit          |
| Frontend| Promptcards niet scrollbaar      | Voeg `min-w` en `snap-x` toe     |
| UX      | Collaborations zijn visueel kaal | Grid + hover toevoegen           |
| UX      | Geen a11y met toetsenbord        | Voeg `tabIndex` + keydown toe    |

---

*Plaats dit rapport naast `DEBUG_REPORT_v2.md`. Fixes kunnen per sectie worden opgevolgd door Cursor of Replit AI.*
