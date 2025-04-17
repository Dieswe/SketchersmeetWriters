# 🧠 Backend Prompt – CommunityConnect (Optimized for Cursor, Replit & Supabase)

**Versie:** 1.1 – 2025-04-17  
**Compatibiliteit:** Supabase, Node.js, Express, Replit, Cursor  
**Invoerstandaard:** JSON (camelCase keys)  
**Validatie:** Zod schema’s  
**Opslag:** Supabase Storage  
**Authenticatie:** optioneel (ondersteunt anonieme uploads via `userId: null`)  

---

## 📊 Database tabellen (Supabase)

### prompts
| veld      | type      | details                              |
|-----------|-----------|--------------------------------------|
| id        | uuid      | primary key                          |
| type      | text      | 'text' of 'image'                    |
| content   | text      | tekst of afbeeldings-URL            |
| isDaily   | boolean   | is dit de dagelijkse prompt?        |
| isActive  | boolean   | zichtbaar in de feed                |
| createdAt | timestamp | default now()                        |

### submissions
| veld       | type      | details                              |
|------------|-----------|--------------------------------------|
| id         | uuid      | primary key                          |
| promptId   | uuid      | foreign key → prompts.id             |
| userId     | uuid?     | optioneel, `null` voor anoniem       |
| type       | text      | 'text' of 'image'                    |
| content    | text      | tekst of afbeeldings-URL             |
| createdAt  | timestamp | default now()                        |

### likes
| veld          | type    | details                            |
|---------------|---------|------------------------------------|
| id            | uuid    | primary key                        |
| submissionId  | uuid    | foreign key → submissions.id       |
| userId        | uuid?   | optioneel, `null` toegestaan       |
| createdAt     | timestamp | default now()                    |

### comments
| veld          | type    | details                            |
|---------------|---------|------------------------------------|
| id            | uuid    | primary key                        |
| submissionId  | uuid    | foreign key → submissions.id       |
| userId        | uuid?   | optioneel                          |
| text          | text    | minimale lengte 1                  |
| createdAt     | timestamp | default now()                    |

---

## 📡 REST API Endpoints

### 🔹 Prompts

```http
GET /api/prompts?type=text
```
- Retourneert prompts van opgegeven type

```http
GET /api/prompts/daily
```
- Retourneert de prompt waar `isDaily === true`
- Lege array als geen daily beschikbaar

```http
GET /api/prompts/popular
```
- Retourneert prompts gesorteerd op aantal submissions of likes

```http
POST /api/prompts
```
- Payload:
```json
{
  "type": "text",
  "content": "Geef jouw visie op de toekomst",
  "isDaily": true
}
```

---

### 🔹 Submissions

```http
GET /api/prompts/{promptId}/submissions
```
- Sorteer op `createdAt desc`

```http
POST /api/submissions
```
- Payload:
```json
{
  "promptId": "uuid",
  "userId": null,
  "type": "image",
  "content": "https://supabase.storage/..."
}
```
- `userId` mag `null` zijn

---

### 🔹 Comments

```http
POST /api/comments
```
- Payload:
```json
{
  "submissionId": "uuid",
  "userId": null,
  "text": "Geweldig!"
}
```

---

### 🔹 Likes

```http
POST /api/likes
```
- Payload:
```json
{
  "submissionId": "uuid",
  "userId": null
}
```

---

### 🔹 Collaborations

```http
GET /api/collaborations
```
- Retourneert combinaties van `prompt` + `submission`
- Structuur:
```json
[
  {
    "prompt": { "id": "...", "type": "...", "content": "..." },
    "submission": { "id": "...", "type": "...", "content": "...", "userId": null }
  }
]
```

---

## 📁 Uploads (Supabase Storage)

- Bucket: `uploads`
- Max. bestandsgrootte: 5MB
- Toegestane types: `image/jpeg`, `image/png`, `image/webp`
- Bestandsnaam: UUID
- Upload via client, daarna `POST /submissions` met image-URL als `content`

---

## ✅ Validatie (Zod)

```ts
export const submissionSchema = z.object({
  promptId: z.string().uuid(),
  type: z.enum(["text", "image"]),
  content: z.string().min(1),
  userId: z.string().uuid().nullable().optional(),
});

export const commentSchema = z.object({
  submissionId: z.string().uuid(),
  text: z.string().min(1),
  userId: z.string().uuid().nullable().optional(),
});
```

---

## ♿ Accessibility en UX fallback

- Retourneer lege arrays `[]` bij geen resultaten
- Frontend toont fallbacktekst
- Statuscodes: `200 OK`, `400 Bad Request`, `413 Payload Too Large`, `500 Server Error`

---

## 🔐 Authenticatie (optioneel)

- `userId` is optioneel in alle schema’s
- Ondersteun JWT via Supabase Auth (bijv. GitHub login)
- Voor anonieme acties: gebruik `userId: null`

---

*Deze prompt is geoptimaliseerd voor Cursor en voorkomt bekende frontend-bugs uit Sprint 1.*  
*Gebruik samen met `community_prompt_frontend_FIXED.md` voor volledige integratie.*
