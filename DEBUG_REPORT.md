# DEBUG_REPORT.md – Sprint 1 Bugfixes

**Versie:** 1.0 – 2025-04-17  
**Root:** `CommunityConnect/DEBUG_REPORT.md`

---

## 1. Uploadproces

**Bestand:** `client/src/components/upload-modal.tsx`

- **Branch‑logica (semantisch verduidelijkt)**
  ```diff
  - const isWriterUpload = prompt.creatorRole === UserRole.Sketcher;
  + // Gebruik naam vanuit gebruikerflow: tekenen bij een tekstprompt
  + const isUploadingDrawing = prompt.type === 'text';
  ```

**Bestand:** `shared/schema.ts`

- **Zod‑schema: `userId` optioneel maken**
  ```ts
  export const insertSubmissionSchema = createInsertSchema(submissions)
    .pick({ promptId: true, userId: true, type: true, content: true })
    // fallback voor anonieme uploads
    .partial({ userId: true });
  ```

**Bestand:** `client/src/components/upload-modal.tsx`

- **Client payload uitbreiden**
  ```ts
  const submissionData = {
    promptId: prompt.id,
    userId: null,            // anonieme inzending
    type: isUploadingDrawing
      ? 'image'              // tekenupload
      : 'text',              // tekstupload
    content: isUploadingDrawing
      ? previewUrl
      : storyText
  };
  ```

---

## 2. File‑input picker

**Bestand:** `client/src/components/upload-modal.tsx`

- **Ref‑binding op echte `<input>`**
  ```tsx
  <Input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    onChange={handleFileChange}  // bestand gekozen
  />
  ```
- **Trigger `click()` voor choose‑knop**
  ```ts
  function handleChooseFile() {
    fileInputRef.current?.click();  // veilig null‑check
  }
  ```

---

## 3. Kaart‑klikbaarheid (Prompt, Previous & Popular)

**Bestand:**
- `client/src/components/prompt-card.tsx`
- `client/src/components/previous-collaborations.tsx`
- `client/src/components/popular-prompt-card.tsx`

- **Make whole card clickable & accessible**
  ```tsx
  <Link to={`/submissions/${prompt.id}`}>              // Wouter Link
    <Card
      className="cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
      aria-label="Bekijk inzendingen van deze prompt"
    >
      …
    </Card>
  </Link>
  ```

---

## 4. Button‑teksten aanpassen

**Bestand:** `client/src/components/text-prompt-card.tsx`
```diff
- buttonText="Upload tekening"
+ buttonText="Upload tekening bij dit verhaal"
```  

**Bestand:** `client/src/components/image-prompt-card.tsx`
```diff
- buttonText="Schrijf verhaal"
+ buttonText="Schrijf verhaal bij deze tekening"
```  

---

## 5. Accessibility – keyboard navigatie op cards

**Bestand:** `client/src/components/prompt-card.tsx`

- **Enter/Space activeren**
  ```tsx
  <motion.div
    role="button"
    tabIndex={0}
    onClick={handleCardClick}
    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleCardClick(e)}
    aria-label="Bekijk inzendingen bij deze prompt"
  >
    …
  </motion.div>
  ```

---

## 6. Query‑caching keys consistent maken

**Bestand:** `client/src/pages/home.tsx`
```ts
// gebruik rol als dynamische key
useQuery({ queryKey: ['/api/prompts', role] });
```

**Bestand:** `client/src/components/upload-modal.tsx`
```ts
await queryClient.invalidateQueries({ queryKey: ['/api/prompts', role] });
```

---

## 7. Fallback voor lege lijsten

**Bestand:** `client/src/components/prompt-feed.tsx`
```tsx
{prompts.length === 0 && (
  <p className="text-muted text-center">
    Er zijn nog geen prompts voor jouw rol.
  </p>
)}
```

**Bestand:** `client/src/components/previous-collaborations.tsx`
```tsx
{collaborations.length === 0 && (
  <p className="text-muted text-center">
    Nog geen samenwerkingen beschikbaar.
  </p>
)}
```

**Bestand:** `client/src/components/popular-prompts.tsx`
```tsx
{prompts.length === 0 && (
  <p className="text-muted text-center">
    Geen populaire prompts gevonden.
  </p>
)}
```

---

## ✅ Handmatige testsuggesties

- Upload tekening bij tekstprompt → afbeelding zichtbaar in feed?
- Upload verhaal bij afbeeldingprompt → tekst zichtbaar in feed?
- Test toegankelijkheid: navigatie via Tab + Enter
- Open de site zonder prompts: worden fallbackteksten correct getoond?

---

*Plaats dit bestand in de root van `CommunityConnect/DEBUG_REPORT.md`.*
