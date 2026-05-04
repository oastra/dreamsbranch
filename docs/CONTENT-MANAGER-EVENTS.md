# Adding events to the website — content manager guide

This guide is for the content manager who is filling the events archive (last 4 years). You will use the admin panel — no coding required.

---

## 1. Before you start — image preparation

All images must be **`.webp`** format. Use any free converter (e.g. squoosh.app).

| Image type | Where it shows | Recommended size | Aspect ratio |
|---|---|---|---|
| **Cover image** | Big hero photo on the event page (under the title) | 1280 × 620 px | ~16:9 (or 1280:620) |
| **Gallery image** (archived events only) | The 6 photos in the "Звіти / Reports" block at the bottom of the archived event page | 800 × 800 px | 1:1 (square) |

Tips:
- Keep each file **under 4 MB** — the upload will reject larger files.
- Use natural-light, in-focus photos. Faces should be visible but not cropped at the edge.
- Don't use logos or watermarks — let the photo speak.

---

## 2. How to log in

1. Open `https://dreamsbranch.org/admin` (or your local URL during testing).
2. Sign in with the admin email and password you were given.
3. In the left menu click **Events**.
4. Click **+ New event** at the top right.

---

## 3. Filling the event form — field by field

### Section "General"

| Field | What to enter | Notes |
|---|---|---|
| **Date** | The date the event happened (or will happen) | Required. Use the date picker. |
| **Status** | `Active` (upcoming/ongoing) **or** `Archived` (past, complete with photos and money report) | Use **Draft** while still working — it won't show on the public site. |
| **Start time** | e.g. `09:00` | Optional. |
| **End time** | e.g. `14:00` | Optional. Shows as `09:00 – 14:00` on the page. |
| **Location** | e.g. `Bunnings Ashfield` or `Harbourside Shopping Centre` | What appears in the "Місце проведення / Location" card. |
| **Map URL** | Paste a Google Maps link to the venue | Optional. Becomes the "відкрити на мапі" link. |
| **Slug** | Auto-fills from the UA title for **Latin** titles (e.g. `Bunnings Ashfield` → `bunnings-ashfield`). For Cyrillic-only titles you must type the slug manually in Latin (e.g. `kyiv-concert`). Lowercase letters, numbers, hyphens only | This becomes the URL: `/events/<slug>`. Don't change after publishing — that breaks links. |
| **Cover image** | Upload one `.webp` photo of the event | Required for the page to look complete. |
| **Gallery images** | Upload up to 6 `.webp` square photos | **Only used when status = Archived.** First two appear next to the financial card; the other four fill the row below. Upload exactly 6 for the cleanest layout. |
| **Tags** | Click `Looking for partners` and/or `Looking for volunteers` if relevant | Become the blue/yellow pills under the title. Skip both for archived events. |
| **Show volunteer CTA** | Checkbox | Adds the "Стань волонтером" yellow block on the event page. Usually OFF for archived events. |

### Section "Financial report"

**Only fill this for Archived events.** Leave entirely blank for active events — the block is hidden on the public page.

For each "Income line" and "Expense line":
- **Label** = the visible text. Use the same convention as past reports, e.g.
  - `$2 938 - cash`
  - `$3 249,57 - EFTPOS п'ятниця`
  - `-$1 411,60 - оренда будинку`
  - `+$890 - PayPal збір на потреби`
- **Amount** = the number only (no `$`, no spaces). Just `2938` or `1411.60`.

Use **Add income / expense line** to add more rows. Use **✕** to remove a row.

**Profit (AUD)** — enter the final calculated profit, e.g. `11016.70`. This becomes the "Прибуток: $11 016,70" line at the bottom of the report.

> The label is **bilingual** — the same string is shown to both UA and EN visitors. Past reports mix Ukrainian and English freely (e.g. `EFTPOS п'ятниця`) and that's fine.

### Section "Content" (UA + EN tabs)

| Field | What to enter |
|---|---|
| **Title (UA) / Title (EN)** | Event name in each language. Usually the same (`Bunnings Ashfield`). For Ukrainian-named events, translate properly for EN. |
| **Description (UA) / Description (EN)** | A few short paragraphs. Plain text — **separate paragraphs with a blank line.** Don't include the date/location (those have their own fields). |

> Both UA and EN must be filled, even if the title is identical. The page picks the right one based on the visitor's language.

**You don't need to write the "What/Who/Why" cards** — those three colored blocks (Що буде на події / Хто може долучитися / Чому варто прийти) are the same on every event and live in the site translations, not in each event.

---

## 4. Save and check

1. Click **Save changes** (or **Create event**).
2. Open the event on the public site:
   - Active: `https://dreamsbranch.org/ua/events/<your-slug>` and `/en/events/<your-slug>`
   - Archived: same URLs
3. Check both languages and both layouts (active vs. archived). On archived, verify the photos and financial report look right.

If something looks wrong, click **Edit** in the admin table, fix it, and save again. The public page updates instantly.

---

## 5. Workflow for the 4-year archive

For each past event:

1. Set **Status = Archived**
2. Set **Date** to the actual date the event happened
3. Upload **Cover image** (.webp)
4. Upload **6 gallery images** (.webp, square)
5. Fill **Financial report** with the income/expense lines and profit
6. Fill **Title** + **Description** in UA and EN
7. **Slug** auto-fills — adjust if a duplicate exists (add the year, e.g. `bunnings-ashfield-2024-12`)
8. Tags: usually leave both off for archived events
9. **Show volunteer CTA**: leave OFF
10. Save

Suggested slug pattern for the archive: `<venue>-<month>-<year>` (e.g. `bunnings-castle-hill-dec-2024`).

---

## 6. Common questions

**Q: I uploaded a JPG by mistake — will it work?**
A: Convert it to .webp first (squoosh.app, free). The site is optimized for .webp.

**Q: I have only 4 photos for an archived event — is that OK?**
A: Yes. The layout adjusts. But 6 looks best.

**Q: An event has no financial report (e.g. it was just a vigil) — what do I do?**
A: Leave the entire Financial report section blank. The block won't appear on the public page.

**Q: Can I edit an event after publishing?**
A: Yes — click the row in the admin table → Edit. Changes go live immediately.

**Q: Do I need to translate the "What/Who/Why" cards for each event?**
A: No. They're hardcoded site-wide and identical for every event in both UA and EN.

**Q: What happens if I leave Status = Draft?**
A: The event saves but doesn't appear on the public site. Use Draft while still preparing the event.

---

## 7. If something is broken

- Form won't save → check Date and Slug are filled (both are required).
- Public page shows "404" → check Status is not Draft, and that the slug in the URL matches the slug in the admin.
- Photos don't show → re-upload as .webp.
- Description is blank on the public page → make sure both UA and EN textareas have text. Plain text only, paragraphs separated by a blank line.

For anything else, message the developer.
