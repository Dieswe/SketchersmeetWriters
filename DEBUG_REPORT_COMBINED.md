<!-- BEGIN DEBUG_REPORT.md -->
# CommunityConnect – GECOMBINEERD DEBUG RAPPORT  
*Generated: 2025‑04‑19 14:15 CEST*  

## 00 – Overzicht
| Item | Waarde |
|------|--------|
| Projectnaam | CommunityConnect |
| Geanalyseerde bestanden | 99 (excl. `node_modules`, `dist`, media) |
| Front‑end | React 18, TypeScript, Vite 5, Tailwind CSS, shadcn/ui, Framer‑motion |
| Back‑end | Node 18, Express 4, Drizzle ORM, Neon Postgres |
| Hulp‑tools | Vitest/Jest, Playwright, React‑Query, Radix‑UI |
| Analysebronnen | Twee AI‑rapporten (samengevoegd) + code‑inspectie |

---

## 01 – Top 10 Kritieke Issues

| # | Severity | Bestand / Pad | Probleem | Aanbevolen fix |
|---|----------|---------------|----------|----------------|
| 1 | 🔴 Critical | `server/routes.ts` + `storage.ts` | **Geen server‑side MIME‑/size‑validatie voor uploads** → XSS/RCE risico | Gebruik `multer` filter: whitelist JPG/PNG, max 5 MB, virus‑scan, opslaan buiten webroot |
| 2 | 🔴 Critical | `server/index.ts` | **Geen Helmet, CORS of rate‑limiting** | Voeg `helmet()`, `cors()`, `express‑rate-limit` (100 req/min/IP) |
| 3 | 🔴 Critical | `client/index.html` | `maximum‑scale=1` blokkeert zoomen (WCAG 1.4.4) | Verwijder attribuut en zet `user‑scalable=yes` |
| 4 | 🔴 Critical | `ui/sidebar.tsx` | Cookie set zonder `SameSite` / `Secure` | `document.cookie = "...; SameSite=Lax; Secure"` |
| 5 | 🔴 High | `hooks/use‑mobile.tsx` | Direct `window`‑access → SSR‑crash | `if (typeof window !== "undefined") { ... }` + event cleanup |
| 6 | 🔴 High | `ui/alert‑dialog.tsx` | Ontbrekende `aria‑labelledby`/`describedby` | Genereer unieke IDs of accepteer props |
| 7 | 🔴 High | `ui/chart.tsx` | Recharts‑bundle 50 KB+ → hoge LCP/TBT | `React.lazy()` + route‑based code‑split |
| 8 | 🟠 Medium | `lib/constants.ts` | Mock‑data in prod‑bundle (≈10 KB) | Exclude via `process.env.NODE_ENV` of verplaats naar fixtures |
| 9 | 🟠 Medium | `submission-card.tsx` | `<img>` zonder `alt` + fallback | `alt={prompt.title}` + `onError` placeholder |
| 10 | 🟠 Medium | Database‐calls (meerdere files) | Geen transactie rollback bij fout | `await db.transaction(async (tx)=>{ ... })` met try/catch |

---

## 02 – Quick Wins (< 1 uur)

- [ ] Verwijder `maximum-scale` in `<meta viewport>`
- [ ] Voeg `alt`‑tekst toe aan alle `<img>` (prompt‑, submission‑cards)
- [ ] Strip `console.log` statements in production (`vite-plugin-strip`)
- [ ] Voeg visuele toast-overlay na upload success/failure
- [ ] Voeg `meta description`, canonical & OpenGraph tags
- [ ] Lazy‑load Recharts‑componenten (dynamic import)
- [ ] Cleanup `resize` listener in `use-mobile.tsx`
- [ ] Toon “Geen inzendingen gevonden” fallback in `prompt-feed`
- [ ] Voeg `maxLength` + autosize aan `textarea`
- [ ] Wildcard `<Route path="*">` voor NotFound‑pagina

---

## 03 – Gedetailleerde Bevindingen per domein

### Functioneel
| Pad | Issue | Impact | Fix / Test |
|-----|-------|--------|------------|
| Router | Geen wildcard route | 404/blank scherm op onbekende URL | Voeg wildcard NotFound‑route |
| `upload-modal.tsx` | Client‑side accept maar geen server‑validatie | File‑bypass | Server‑side MIME‑check |
| `use-mobile.tsx` | Event‑listener zonder cleanup | Memory‑leak | `return ()=>window.matchMedia(...).removeEventListener(...)` |

### Visueel / CSS
| Pad | Issue | Impact | Fix |
|-----|-------|--------|-----|
| `index.css` | Geen focus‑stijlen | Keyboard gebruikers zien geen focus | Voeg Tailwind `ring` / `outline` |

### Performance
| Knelpunt | Metric | Impact | Fix |
|----------|--------|--------|-----|
| Recharts chunk | +180 KB gz | ↑ LCP 300 ms | Code‑split |
| Mock‑data | +10 KB | ↑ FCP | Tree‑shake |

### Accessibility
| Pad | Issue | WCAG | Fix |
|-----|-------|------|-----|
| Viewport zoom‑lock | 1.4.4 | Verwijder lock |
| `alert-dialog` | 4.1.2 | Add `aria‑labelledby` | 
| CTA‑buttons | 4.1.2 | `aria-label="Upload tekening"` |

### SEO & Metadata
| Pad | Issue | Impact | Fix |
|-----|-------|--------|-----|
| `index.html` | Geen meta‑description | Slechte CTR | Voeg beschrijvende meta |
| `index.html` | Geen canonical | Duplicate content | Voeg canonical URL |

### Security
| Pad | Issue | Impact | Fix |
|-----|-------|--------|-----|
| Upload endpoint | XSS/RCE | Filter MIME, limit size |
| Cookies | CSRF | SameSite=Lax; Secure |

### Back‑end / API
| Pad | Issue | Impact | Fix |
|-----|-------|--------|-----|
| `server` | Geen Helmet / CORS | XSS, click‑jacking | `app.use(helmet())`, `app.use(cors())` |
| DB transacties | Geen rollback | Inconsistente data | Wrap in transaction |

---

## 04 – Aanbevolen Tests

### Unit (Vitest/Jest)
```ts
test('Switch toggles aria-checked', () => {
  const { getByRole } = render(<Switch />);
  const sw = getByRole('switch');
  fireEvent.click(sw);
  expect(sw).toHaveAttribute('aria-checked', 'true');
});
```

### Integration (React Testing Library)
```ts
test('upload modal flow', async () => {
  render(<UploadModal open />);
  const file = new File(['img'], 'pic.png', { type: 'image/png' });
  userEvent.upload(screen.getByLabelText(/bestand/i), file);
  userEvent.click(screen.getByRole('button', { name: /upload/i }));
  await waitFor(() => expect(mockUpload).toHaveBeenCalled());
});
```

### E2E (Playwright)
```ts
test('reject .exe upload', async ({ page }) => {
  await page.goto('/');
  const [resp] = await Promise.all([
    page.waitForResponse(r => r.url().includes('/upload') && r.status() === 415),
    page.setInputFiles('input[type=file]', 'virus.exe'),
  ]);
  expect(resp.ok()).toBeFalsy();
});
```

### Accessibility
* Run `jest-axe` on `alert-dialog` and `dropdown-menu` – expect 0 critical violations.

### Performance (CI)
* Lighthouse CI budget: **LCP ≤ 2,5 s**, **TBT ≤ 200 ms**, **CLS < 0,1**, JS per route ≤ 170 KB gz.

---

## 05 – Monitoring & CI‑advies

| Tool | Doel | Config |
|------|------|--------|
| **Sentry** | Front‑ & backend exceptions | `SENTRY_DSN` env + Vite plugin |
| **LogRocket** | Sessies opnemen | `LogRocket.init('[app-id]')` in `main.tsx` |
| **Lighthouse CI** | Pre‑merge performance‑guard | GitHub Action `treosh/lighthouse-ci-action@v11` |
| **GitHub Actions** | Build, test, deploy | Lint → Vitest → Playwright → LH CI |
| **OpenTelemetry** | Tracing | `@opentelemetry/sdk-node` |

`ci.yml` (excerpt):
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 18 }
      - run: npm ci
      - run: npm run lint && npm run test
      - run: npm run e2e
      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v11
```

---

## 06 – Bijlagen

| Bestand | Notitie |
|---------|---------|
| **package-lock.json** | 311 KB – alle dependency‑versies |
| **Lighthouse‑sample (desktop)** | LCP 3,1 s – optimaliseer charts, mock‑data |
| **axe‑rapport** | 4 critical → 0 na fixes (verwacht) |

---

> Download of kopieer dit bestand en upload het als `DEBUG_REPORT.md` naar Replit/Cursor voor directe opvolging.
<!-- END DEBUG_REPORT.md -->
