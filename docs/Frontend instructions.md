# ✨ CommunityConnect – Frontend Prompt (V4 – Volledige versie)

## 🧠 Doel & context

Ontwerp een nieuwe **homepage en promptfeed** voor een **communityplatform voor beginnende hobbytekenaars en -schrijvers**.  
De essentie is **creatieve samenwerking**: tekenaars en schrijvers vullen elkaars werk aan.  

- Een tekenaar maakt een illustratie bij een tekstprompt.  
- Een schrijver schrijft een verhaal bij een tekeningprompt.  

Deze samenwerking moet **voelbaar, zichtbaar en toegankelijk** zijn vanaf de homepage.  

---

## 🏠 Homepage – structuur & componenten

De homepage bestaat uit 5 onderdelen:

1. **Header met rolkeuze (chips)**  
2. **Promptfeed (horizontale scroll)**  
3. **Previous collaborations (split view)**  
4. **Populaire prompts (carousel of grid)**  
5. **Uploadflow (knoppen, feedback, celebratie)**  

---

### 🟢 1. Header + chips

Boven de vouw komt een compacte header:

```
Sketchers meet Writers  
Breng jouw creatieve werk tot leven door samenwerking. Wat wil je doen?
```

Daaronder twee chips:
- **Voor tekenaars**
- **Voor schrijvers**

🔧 Gedrag:
- Bepalen welke prompts je ziet (tekst of tekening)
- Vrij wisselbaar zonder reload
- Standaard: "Voor schrijvers" geselecteerd
- Actieve chip: visueel gemarkeerd (kleur of schaduw)

---

### 🔁 2. Promptfeed

Toon een **horizontale scrolllijst** met promptcards.  

Prompttypes:
- `type === 'text'` → prompt is tekst → gebruiker uploadt een **tekening**
- `type === 'image'` → prompt is afbeelding → gebruiker schrijft een **verhaal**

Elke kaart toont:
- Originele prompt (tekst of afbeelding)
- Avatar + naam van de inzender
- Promptstatistieken: “42 bijdragen • 156 reacties”
- Knop afhankelijk van type:
  - “Upload tekening bij dit verhaal”
  - “Schrijf verhaal bij deze tekening”
- Label “Vandaag” bij dagelijkse prompt (`isDaily === true`)
- “Active now” badge: groene stip (8px, pulse-animatie)
- Volledig klikbare kaart (toegang tot inzendingenfeed)

⬇️ UX-zinnen boven feed:
- Voor schrijvers: “Breng deze teksten tot leven met jouw tekening”
- Voor tekenaars: “Geef deze tekening betekenis met jouw woorden”

📐 Styling:
- Gebruik `min-w-[250px] flex-shrink-0` voor kaarten
- `loading="lazy"` op `<img>`
- `tabIndex={0}`, `role="button"`, `onKeyDown` (Enter/Space)
- Iconen: 🖊️ voor tekst, 🎨 voor beeld

---

### 🤝 3. Previous collaborations

Toon geslaagde samenwerkingen in **split-screen stijl** (tekst + afbeelding: vertical).

🔧 Gedrag:
- Swipebaar op mobiel
- Volledige kaart is klikbaar (leidt naar de samenwerking)
- Layout: `grid-cols-2`, met spacing, afgeronde hoeken en hover-effect
- Verticale layout: titel bovenaan, tekst onder titel, afbeelding onder tekst. 

📭 Lege staat:
```tsx
<p className="text-muted text-center">
  Nog geen samenwerkingen beschikbaar.
</p>
```

---

### 📈 4. Populaire prompts

Toon een selectie prompts met veel interactie (likes of inzendingen) in een **carousel of grid**.

- Volledig klikbare kaarten
- Styling & gedrag zoals bij promptfeed
- Toetsenbord- en screenreader-ondersteuning

📭 Lege staat:
```tsx
<p className="text-muted text-center">
  Geen populaire prompts gevonden.
</p>
```

---

### ✍️ 5. Uploadflow

Bij klikken op een knop in een promptkaart:

➡️ Ga naar uploadscherm

**Bestand uploaden** (bij tekstprompt):
- `<input type="file">` met `.png`, `.jpg`, `.webp`
- Max grootte: 5MB

**Verhaal schrijven** (bij afbeeldingprompt):
- Textarea met max 1000 woorden

🎉 UX bij upload:
- Upload zonder account is mogelijk
- Daarna overlay (80% opacity) met:
  > **“Wil je je bijdrage bewaren of reacties ontvangen? Maak een account aan!”**
- Confirmatie:
  > **“Geweldig! Jouw creativiteit is nu deel van onze community”**
- Animaties:
  - 🎉 Confetti (2s)
  - 🙌 High-five emoji met bounce (500ms)

📤 Payload structuur:
```ts
{
  promptId: string,
  userId: null, // ook bij anoniem
  type: 'image' | 'text',
  content: string // URL of tekst
}
```

---

## 📖 Inzendingenfeed

Na upload of klik op een prompt:
- Prompt bovenaan
- Eigen inzending direct daaronder
- Andere inzendingen chronologisch (nieuwste boven)
- Elke inzending: **like**, **share**, **reageer**
- Knop “Upload jouw bijdrage” blijft altijd zichtbaar
- Bij geen inzendingen:
  > **“Yes! Jij bent de eerste. Laat je creativiteit de vrije loop!”**
- Teller met notificatiebadge bij nieuwe reacties/likes

---

## 🎨 Design tokens

Gebruik een **design token structuur** (zoals `theme.json`):

```json
{
  "colors": {
    "background": "#10998A",
    "surface": "#FFFFFF",
    "primary": "#1BAA9B",
    "cta": "#FFC73B",
    "text": "#000000",
    "muted": "#9E9E9E",
    "border": "#E5E5E5",
    "writer": "#4B7BF5",
    "sketcher": "#FF8A5B",
    "active": "#4CAF50"
  },
  "typography": {
    "fontFamily": "Inter, sans-serif",
    "fontSize": "16px"
  },
  "borderRadius": "8px",
  "spacing": {
    "section": "32px",
    "component": "16px"
  },
  "shadow": {
    "card": "0 2px 8px rgba(0,0,0,0.1)"
  }
}
```

---

## ♿ Toegankelijkheid (WCAG 2.1 AA)

- Alle kaarten en knoppen: `role="button"`, `aria-label`, `tabIndex={0}`
- Werkt met toetsenbordnavigatie (`Enter`, `Space`)
- Gebruik semantische HTML
- Contrastverhouding van teksten moet voldoende zijn
- Alle afbeeldingen: `alt` en `loading="lazy"`

---

## ⚙️ Techniek (Cursor optimalisatie)

- Navigatie via `<Link>` (Wouter), geen `window.location`
- Promptfeed queries:
```ts
useQuery({ queryKey: ['/api/prompts', role] });
await queryClient.invalidateQueries({ queryKey: ['/api/prompts', role] });
```
- Componenten zijn modulair opgebouwd
- Mobile-first aanpak

---
