# 🐞 DEBUG_REPORT_v2.md – CommunityConnect (Post-Cursor Rebuild)

**Versie:** 2.0 – 2025-04-17  
**Project:** CommunityConnect (Frontend + Backend gebouwd via Replit/Cursor)  
**Doel:** Visuele, functionele en UX-audit na rebuild op basis van aangepaste prompts

---

## ✅ Samenvatting belangrijkste issues

| Onderdeel                        | Status   | Probleem                                      | Oplossing                                        |
|----------------------------------|----------|-----------------------------------------------|--------------------------------------------------|
| Horizontale promptfeed verdwenen| ⚠️ Deels  | Scrollcontainer mist juiste kaartconfiguratie | Voeg `min-w-[250px] flex-shrink-0` toe aan cards |
| Previous collaborations lelijk  | ❌        | Cards missen spacing, grid, hover             | Gebruik `grid-cols`, `p-4`, hover, card-shadow   |
| Promptfeed styling inconsistent | ⚠️ Deels  | Geen iconen, daily badge of hiërarchie        | Voeg `badge`, `shadow`, `type-icon` toe          |
| Role switch werkt niet dynamisch| ❌        | Gebruikt statische prompt arrays              | Gebruik `queryKey: ['/api/prompts', role]`       |
| Popular Prompts                 | ✅        | Functioneert goed                             | Geen actie nodig                                 |
| Toegankelijkheid (a11y)         | ✅        | `tabIndex`, `aria-labels` correct             | Geen actie nodig                                 |

---

## 1. 🔄 Horizontale promptfeed – ontbrekende scroll

**Probleem:** Kaarten verschijnen niet horizontaal ondanks `overflow-x-auto`.  
**Oorzaak:** PromptCards hebben geen `min-w`, dus wrappen of blijven onzichtbaar bij overflow.

**Fix:**
```tsx
<Card className="min-w-[250px] flex-shrink-0" />
```

**Extra (optioneel):**
```tsx
<div className="flex overflow-x-auto snap-x snap-mandatory">
```

---

## 2. 🎭 Previous Collaborations layout

**Probleem:** Collaborations ogen leeg en onaf.  
**Oorzaken:** Cards zijn niet styled, geen grid of spacing, geen hover.

**Fix in container:**
```tsx
<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
```

**Fix in kaart:**
```tsx
<Card className="bg-white/10 p-4 rounded-xl hover:bg-white/20 cursor-pointer transition">
  <p className="text-white text-sm">{prompt.content}</p>
  <p className="text-gray-300 text-xs mt-2">{submission.content}</p>
</Card>
```

---

## 3. 🖼️ Promptcard styling uitbreiden

**Probleem:** Geen visuele hiërarchie, onduidelijk onderscheid tussen prompttypes.

**Fix:**
- Voeg een `type-icon` toe (🖊️ voor tekst, 🎨 voor beeld)
- Voeg badge toe bij `isDaily === true`:
```tsx
{prompt.isDaily && <Badge variant="secondary">Daily</Badge>}
```
- Gebruik `shadow-md` en padding in de card

---

## 4. 🔁 Rol wissel (writer/sketcher) herlaadt prompts niet

**Probleem:** Beide promptarrays (`writerPrompts`, `sketcherPrompts`) worden tegelijk opgehaald, ongeacht gekozen rol. Resultaat: geen directe refresh.

**Fix:**
Gebruik één dynamische query:
```tsx
const { role } = useRoleStore();
const { data: prompts = [] } = useQuery({
  queryKey: ['/api/prompts', role],
  queryFn: () => fetchPromptsByRole(role),
});
```

---

## 5. 🔍 Debughulp en netwerktips

**Aanbevolen:**
- Log API responses in `PromptFeed` en `PreviousCollaborations`
- Check netwerkresponses in devtools (tab: Network → JSON)
- Voeg fallback toe bij lege data:
```tsx
{prompts.length === 0 && <p className="text-muted text-center">Geen prompts gevonden</p>}
```

---

## 6. 🧼 UI & Token Styling

**Acties:**
- Vervang `bg-[#1F2937]` door `bg-[var(--surface)]`
- Gebruik `scrollbar-auto` in horizontale feeds
- Voeg `snap-x` toe voor betere swipe-ervaring

---

## 7. ♿ Toegankelijkheid (a11y)

- Alle interactieve kaarten moeten:
  - `tabIndex={0}` hebben
  - `role="button"` gebruiken
  - reageren op `Enter` en `Space`
  - `aria-label` bevatten (bijv. “Bekijk prompt”)

✅ Dit is in de meeste componenten goed geïmplementeerd.

---

## ✅ Checklijst voor eindtest

- [ ] Horizontale promptfeed zichtbaar en swipebaar op mobiel
- [ ] Collaborations laden netjes in grid met styling
- [ ] Promptfeed verandert bij wissel van rol (zonder herlaad)
- [ ] Iconen en badges tonen prompttype en daily-status
- [ ] Geen lege secties zonder fallbacktekst
- [ ] Navigatie werkt via toetsenbord

---

*Laat dit bestand in je project staan als `DEBUG_REPORT_v2.md` of koppel het aan je Replit project voor fixes.*