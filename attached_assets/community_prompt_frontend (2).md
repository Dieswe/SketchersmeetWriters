
## 🧠 Doel & context

Ontwerp een nieuwe **homepage en promptfeed** voor een **communityplatform voor beginnende hobbytekenaars en -schrijvers**.  
De essentie van het platform is **creatieve samenwerking**: tekenaars en schrijvers vullen elkaars werk aan.  

- Een tekenaar maakt een illustratie bij een bestaande tekstprompt.  
- Een schrijver schrijft een verhaal bij een bestaande tekeningprompt.  

Deze samenwerking moet **direct voelbaar zijn op de homepage**. De interface moet eenvoudig, uitnodigend en intuïtief zijn — met een focus op het ontdekken en aanvullen van elkaars werk.

---

## 🏠 Homepage – structuur en elementen

### 🟩 Header (boven de vouw, compact)
```
Sketchers meet Writers  
Breng jouw creatieve werk tot leven door samenwerking. Wat wil je doen?
```

### 🟦 Chips (rolkeuze)
Onder de header komen twee **filter chips**:
- Voor tekenaars
- Voor schrijvers

**UX-regels:**
- De chips bepalen welke prompts je ziet: tekstprompts (voor tekenaars) of tekenprompts (voor schrijvers).
- De rolkeuze is **vrij te wisselen**, zonder herladen van de pagina.
- Laat visueel duidelijk zien welke chip actief is (bijv. kleurvulling of schaduw).
- Toon standaard de chip “Voor schrijvers” als geselecteerd bij eerste bezoek.

---

## 🔁 Promptfeed (onder de chips)

### 📌 1. Horizontale promptlijst
Een horizontaal scrollbare rij met **promptcards**, afhankelijk van de gekozen rol:

- **Voor schrijvers:** kaarten met **afbeeldingen** geüpload door tekenaars. Elke kaart bevat een knop “Schrijf verhaal bij deze tekening”.
- **Voor tekenaars:** kaarten met **teksten** geüpload door schrijvers. Elke kaart bevat een knop “Upload tekening bij dit verhaal”.
- Toon bij elke prompt real-time statistieken: Bijvoorbeeld "42 bijdragen • 156 reacties"
- Toon "Active now" indicatoren bij prompts met recente activiteit
- Active now indicator: Kleine groene stip (8px diameter) met lichte pulserende animatie
- Positie: Rechtsbovenhoek van de promptcard
- Toon avatar en naam van inzender van prompt bovenaan elke prompt

**UX-regels:**
- De promptcards tonen **user generated content**, geen AI-prompts.
- De eerste kaart in de lijst is de **Daily Prompt**: deze wordt subtiel gehighlight (bijv. label "Vandaag" of accentrand).
- Prompts van eerdere dagen blijven goed zichtbaar in dezelfde rij, met een iets lichter kader.
- Bij klikken op de **prompt zelf** (niet de knop) ga je naar de bijbehorende **inzendingenfeed**.
- Boven de promptlijst met tekeningen staat de tekst: "Geef deze tekening betekenis met jouw woorden"
- Boven de promptlijst met teksten staat de tekst: "Breng deze teksten tot leven met jouw tekening" 

### 📌 2. Module ‘Previous collaborations’
Onder de promptlijst komt een blok waarin eerdere samenwerkingen getoond worden. Elke samenwerking bestaat uit een **tekst + illustratie** in **split-screen stijl** (horizontaal naast elkaar, swipebaar op mobiel).

### 📌 3. Populaire prompts
Daaronder een overzicht van populaire prompts op basis van betrokkenheid (likes of reacties). Weergave in grid- of carrouselvorm.

---

## 🔼 Uploadproces

Als een gebruiker op een knop in een promptcard drukt (“Upload tekening” of “Schrijf verhaal”), wordt hij naar een **uploadscherm** geleid.

**UX-regels:**
- Uploaden mag zonder account.
- Na uploaden verschijnt een overlay of melding:  
  > **“Wil je je bijdrage bewaren of reacties ontvangen? Maak een account aan!”**
- Bevestigingsbericht bij succesvolle upload: "Geweldig! Jouw creativiteit is nu deel van onze community"
- Toon mini-celebratie animaties bij succesvolle uploads (confetti, high-five emoji)
- Bevestigingsbericht bij succesvolle upload: "Geweldig! Jouw creativiteit is nu deel van onze community"
- Confetti-animatieduur: 2 seconden
- Opaciteit van overlay/melding: 80%
- Toon animatie: Een korte (~500ms) shake of bounce van de high-five emoji


---

## 📖 Feed met inzendingen

Na het uploaden, of als je op een prompt klikt, ga je naar de **inzendingenfeed**:

- De originele prompt (tekst of afbeelding) staat **bovenaan**.
- Direct daaronder verschijnt **de inzending van de gebruiker zelf**, als eerste.
- Daaronder staan alle andere inzendingen van andere gebruikers, gesorteerd op **datum (nieuwste eerst)**.
- Bij elke inzending zijn er 3 knoppen: **like**, **share**, **reageer**.
- Er is altijd een knop zichtbaar: **“Upload jouw bijdrage”** (ook als je al iets hebt ingezonden).
- Als er nog geen inzendingen zijn bij een prompt, toon dan deze tekst:  
  > **“Yes! Jij bent de eerste. Laat je creativiteit de vrije loop!”**
  - Teller voor nieuwe reacties/likes op jouw bijdragen (rood notificatiebadge)


---

## 🎨 Design tokens – kleurenschema & styling

Gebruik een **design token-structuur** voor het kleurenschema, typografie, spacing en component-styling van de website.  
Gebruik de volgende tokens:

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
Gebruik voldoende witruimte, visuele hiërarchie en afgeronde componenten voor een moderne en toegankelijke uitstraling. De interface moet vriendelijk aanvoelen, met een creatieve, community-gedreven sfeer.
Consistente iconen: pen voor schrijvers, penseel voor tekenaars
Ontwerp is mobile-first. Op mobiel moet alle content swipebaar zijn en visuele hiërarchie behouden blijven.
Zorg dat de interface voldoet aan WCAG 2.1 AA richtlijnen:

Componenten moeten met toetsenbord bedienbaar zijn.

Gebruik aria-labels voor interactieve elementen.

Zorg voor voldoende kleurcontrast tussen tekst en achtergrond.
Neem je tijd. Ik herhaal: neem je tijd. Analyseer deze prompt grondig en volledig voordat je output genereert. 