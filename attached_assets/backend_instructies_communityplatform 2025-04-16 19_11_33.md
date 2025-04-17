## 🛠️ Backend-instructies voor communityplatform

Voor: **V0.dev**, **Replit**, **Cursor.com**  
Stack: **Supabase** (PostgreSQL + Storage + Auth)  
Runtime: **Node.js + Express (via Replit)**

Deze instructies sluiten aan op het frontend ontwerp voor een communityplatform waar schrijvers en tekenaars elkaars werk aanvullen. Gebruik deze specificatie als leidraad voor het opzetten van de backend infrastructuur.

---

### 📦 1. Database tabellen (Supabase)

#### `prompts`
| veld       | type        | details                                 |
|------------|-------------|------------------------------------------|
| id         | uuid        | primary key, default: `gen_random_uuid()` |
| type       | text        | enum: 'text' of 'image'                  |
| content    | text        | tekstinhoud of URL naar afbeelding       |
| author     | text        | optioneel, bijv. 'anon' of gebruikers-id |
| created_at | timestamp   | default: `now()`                         |

#### `submissions`
| veld        | type      | details                                  |
|-------------|-----------|-------------------------------------------|
| id          | uuid      | primary key                               |
| prompt_id   | uuid      | foreign key → `prompts.id`                |
| type        | text      | enum: 'text' of 'image'                   |
| content     | text      | tekst of afbeeldings-URL                  |
| author      | text      | optioneel ("anon" toegestaan)           |
| created_at  | timestamp | default: `now()`                          |

#### `likes`
| veld            | type      | details                                  |
|-----------------|-----------|-------------------------------------------|
| id              | uuid      | primary key                               |
| submission_id   | uuid      | foreign key → `submissions.id`            |
| user_id         | uuid      | optioneel (anonieme likes toegestaan)     |

#### `comments`
| veld          | type      | details                                  |
|---------------|-----------|-------------------------------------------|
| id            | uuid      | primary key                               |
| content_type  | text      | enum: 'prompt' of 'submission'            |
| content_id    | uuid      | ID van de prompt of submission            |
| user_id       | uuid      | optioneel                                 |
| text          | text      | commenttekst                              |
| created_at    | timestamp | default: `now()`                          |

---

### 🌐 2. API-routes (Replit server met Express)

Gebruik RESTful endpoints. Response-formaat is JSON. Alle endpoints zijn beschikbaar via `/api/*`

#### ✅ Prompts ophalen
```http
GET /api/prompts?type=text
```
- `type` moet exact zijn: `text` of `image`
- Response: lijst met prompts gesorteerd op `created_at`

#### ✅ Daily prompt ophalen
```http
GET /api/prompts/daily
```
- Retourneert de meest recente prompt van vandaag:
```sql
WHERE created_at::date = CURRENT_DATE
```
- Retourneert `null` als geen prompt is geplaatst vandaag

#### ✅ Nieuwe inzending maken
```http
POST /api/submissions
Content-Type: application/json

{
  "prompt_id": "uuid",
  "type": "text", // exact 'text' of 'image'
  "content": "mijn verhaal hier",
  "author": "anon" // optioneel
}
```

#### ✅ Inzendingen bij een prompt ophalen
```http
GET /api/prompts/{id}/submissions
```

#### ✅ Like toevoegen (alleen voor submissions)
```http
POST /api/content/submissions/{id}/like
```
- `user_id` optioneel voor anonieme gebruikers

#### ✅ Reactie toevoegen
```http
POST /api/content/{type}/{id}/comment
Content-Type: application/json

{
  "text": "Supermooi!",
  "user_id": "optional"
}
// type: 'prompt' of 'submission'
```

---

### ☁️ 3. Uploads beheren (Supabase Storage)

- Bucket: `uploads`
- Ondersteunde types: JPG, PNG, WebP
- Max grootte: **5MB** per bestand
- Bestandsnamen: UUID-gebaseerd
- Uploadstap vanuit frontend:
```js
// 1. Upload afbeelding naar Supabase Storage
// 2. Verkrijg publieke URL
// 3. POST /api/submissions met die URL als 'content'
```

---

### 👤 4. Auth en anonimiteit

- Uploads mogen zonder account: gebruik standaard `"author": "anon"`
- Optionele login via Supabase Auth (email, GitHub, etc.)
- JWT wordt automatisch afgehandeld via Supabase bij login

---

### ✅ 5. Stack & libraries (Replit / Cursor)

- **Runtime:** Node.js + Express
- **Validatie:** [Zod](https://zod.dev/) of [Joi](https://joi.dev/)
- **Uploads:** Multer (of Supabase direct upload)
- **Dotenv:** voor `.env` configuratie (API keys, etc.)

---

### 🧪 6. Validatie & foutmeldingen

- Alle inputs valideren met schema's:
```ts
const submissionSchema = z.object({
  prompt_id: z.string().uuid(),
  type: z.enum(["text", "image"]),
  content: z.string().min(1),
  author: z.string().optional(),
});
```
- Foutmeldingen geven met duidelijke statuscodes (400, 500)
- Lege lijsten: geef frontend melding zoals `"Nog geen inzendingen"`
- Uploadfouten: duidelijke UI-feedback met retry-optie

---

### ⚙️ 7. Dynamiek voor V0.dev (frontend hints)

```js
// Promptfeed (V0)
// API: GET /api/prompts?type=text
// Output: [{ id, content, created_at }]
// Dynamisch: verandert bij chip-wissel

// Daily Prompt
// De eerste kaart in de lijst is de daily prompt (indien beschikbaar)

// PromptCard knopactie
// Actie: POST /api/submissions
// Input: { prompt_id, content, type }

// Upload instructie (V0/Cursor)
// 1. Upload afbeelding naar Supabase Storage → ontvang URL
// 2. POST /api/submissions met image-URL als 'content'
```

---

### 📱 8. Mobile-first & toegankelijkheid (a11y)

- Interface moet swipebaar en stapelbaar zijn op mobiel
- Gebruik `aria-labels` voor knoppen en interactieve elementen
- Kleurcontrast minimaal 4.5:1 (WCAG AA)
- Navigatie moet werken met toetsenbord (tabfocus)

---

Met deze backend-opzet is je frontend prompt volledig uitvoerbaar via V0.dev, Replit en Cursor met Supabase als backend-opslag en authenticatie. Laat weten als je ook een `.env` bestand of voorbeeldcode wil voor deployment!"
