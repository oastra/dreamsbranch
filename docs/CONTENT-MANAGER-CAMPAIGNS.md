# Adding campaigns to the website — content manager guide

This guide is for the content manager who is creating fundraising campaigns in the admin panel. No coding required.

---

## 1. Before you start — image preparation

All images must be **`.webp`** format. Use any free converter — [squoosh.app](https://squoosh.app) works in the browser and lets you see file size + quality side-by-side as you drag the quality slider.

| Image type | Where it shows | Recommended size | Aspect ratio |
|---|---|---|---|
| **Cover image** | Big photo on the campaign page (next to the title + progress bar) and on the campaigns list card | 1200 × 1200 px | 1:1 (square) |

**Make the file as small as possible while the photo still looks good.** Target file size:

- **Cover image: 100–250 KB.** Anything under 300 KB is fine. If you're saving a 1 MB `.webp`, drop the quality slider in squoosh until the preview still looks sharp and the size drops into the target range. WebP usually looks great at quality 70–80.
- **Hard limit: 4 MB.** The upload will reject anything larger, but you should never get close to that.

How to do it in squoosh.app:
1. Drag your photo in.
2. On the right panel, set the format to **WebP**.
3. Resize down to **1200 × 1200** if your photo is bigger (resize is in the same panel).
4. Drag **Quality** down from the default until you see the file size drop below ~250 KB and the preview still looks clean. 75 is a good starting point.
5. Click the download button (bottom right).

Tips:
- Keep faces visible and in focus — the cover is the first thing donors see.
- Avoid hard-cropping people at the edges (the page may crop further on mobile).
- Don't burn in logos or watermarks.
- If your camera shot is much larger than 1200×1200, resize first — bigger source = bigger file, with no visible benefit on the site.

---

## 2. How to log in

1. Open `https://dreamsbranch.org/admin` (or your local URL during testing).
2. Sign in with the admin email and password you were given.
3. In the left menu click **Campaigns**.
4. Click **+ New Campaign** at the top right.

---

## 3. Filling the campaign form — field by field

### Section "General"

| Field | What to enter | Notes |
|---|---|---|
| **Goal Amount (AUD)** | The fundraising target in dollars, e.g. `15000` | Required. Number only, no `$` or spaces. Decimals OK (`15000.50`). |
| **Status** | `Active` (live and accepting donations) **or** `Archived` (finished, kept as a record) | Use **Draft** while still working — the campaign won't show on the public site. |
| **Sort Order** | Number controlling card order on the campaigns list. Lower = first. Leave `0` if you don't care. | Optional. |
| **URL (UA) / URL (EN)** | **Generated automatically from the title — there's nothing to type here.** Ukrainian letters are transliterated to Latin (e.g. `Допомога Україні` → `dopomoha-ukraini`). The URL preview below the label shows what the public URL will look like after you save. | The URL is **locked once the campaign is saved** so existing donor / share links keep working. If you ever need to change it later, message the developer. |
| **Cover image** | Upload one `.webp` photo (see Section 1 for size + format) | Required for the page to look complete. |

### Section "Content" (UA + EN tabs)

| Field | What to enter |
|---|---|
| **Title (UA) / Title (EN)** * | Campaign name in each language. **Both are required** — the campaign won't save if either is empty. |
| **Description (UA) / Description (EN)** * | A few short paragraphs explaining what the campaign is for and why people should donate. **Both languages are required** — the campaign won't save with either side empty. **Ideal length: ~755 characters (including spaces)** — a bit more or less is fine, this is just the sweet spot for the Figma layout. Plain text — **separate paragraphs with a blank line.** A live counter under the textarea shows your current length. |

> Both UA and EN must be filled. The page picks the right one based on the visitor's language.

> **About the URL:** generated from the title automatically while you're creating the campaign. Once you click **Create campaign**, the URL is locked — editing the title later doesn't change the URL. This is intentional so existing donor / shared links don't break. If you ever need to change a URL, ask the developer to update it in the database (with a redirect from the old URL).

### Section "Common Questions" (FAQ tab)

This block fills the **"Часті питання / Common Questions"** tab on the active campaign page (next to the Description tab).

**New campaigns start pre-filled with a set of standard questions** that apply to every fundraiser (where the money goes, will there be a financial report, how else can donors help, are payments secure). You can:

- **Keep them as-is** if they're fine for this campaign — no action needed.
- **Edit any answer** to make it more specific (e.g. mention the actual beneficiary, the specific equipment being bought, the partner organisation).
- **Delete the ones that don't fit** by clicking the trash icon on the card.
- **Add campaign-specific questions** at the end by clicking **+ Add question**.

How the editor works:
- Each card has two language tabs (UA / EN). Both must be filled, just like the title and description — the visitor sees the version matching their language.
- Fields per card:
  - **Question (UA) / Question (EN)** — short one-liner, e.g. `Скільки коштує один сертифікат?` / `How much does one certificate cost?`
  - **Answer (UA) / Answer (EN)** — a sentence or two. Plain text.
- The order of cards in the admin = the order on the public page. To reorder, delete and re-add (drag isn't supported yet).

Tips:
- 4–6 questions is the sweet spot. More than 8 makes the tab feel heavy.
- Ask questions donors actually have ("Чи це податковий відрахунок?", "Чи отримаю я квитанцію?"), not marketing fluff.
- The questions/answers are independent of the Description tab — don't repeat the same content.

> The defaults live in the site translation files (`messages/ua.json` and `messages/en.json` under `campaigns.default_faq`). If you want a different starter set for all future campaigns, ask the developer to update them there — the change applies to every new campaign going forward, but doesn't touch existing ones.

> The FAQ tab only appears on **Active** campaigns. Archived campaigns use a simpler layout without tabs, so any questions you enter won't show there.

---

## 4. Save and check

1. Click **Save changes** (or **Create campaign**).
2. Open the campaign on the public site:
   - `https://dreamsbranch.org/ua/campaigns/<slug-ua>`
   - `https://dreamsbranch.org/en/campaigns/<slug-en>`
3. Check both languages. Verify the cover photo loads, the title looks right, the goal amount shows in the progress card, and the description paragraphs are separated properly.

If something looks wrong, click the campaign in the admin table → **Edit**, fix it, and save again. The public page updates immediately.

---

## 5. Help & troubleshooting

**Q: I uploaded a JPG by mistake — will it work?**
A: Convert it to `.webp` first (squoosh.app). The site is optimized for `.webp` and JPGs are larger for the same quality.

**Q: My `.webp` is 2 MB — is that OK?**
A: It will upload, but it's way too big. Drop the quality in squoosh until the preview still looks good and the file is under ~250 KB. Donors on mobile data will thank you.

**Q: Can I change the slug after publishing?**
A: Don't. If someone has shared the URL or it's indexed by Google, changing the slug breaks those links. Fix typos before going Active.

**Q: Can I edit a campaign after publishing?**
A: Yes — click the row in the admin table → Edit. Changes go live immediately.

**Q: What happens if I leave Status = Draft?**
A: The campaign saves but doesn't appear on the public site. Use Draft while still preparing.

**Q: When should I switch a campaign to Archived?**
A: When the fundraiser is over (goal reached or the campaign closed). Archived campaigns stay readable but don't accept new donations.

---

## 6. If something is broken

- Form won't save → check **Goal Amount**, both **Title** fields (UA + EN), both **Description** fields (UA + EN), and **Cover image** are filled. The URL is generated automatically from the title.
- Public page shows "404" → check Status is not Draft, and that the slug in the URL matches the slug in the admin.
- Photo doesn't show → re-upload as `.webp`. If still missing, check the file is under 4 MB.
- Description shows as one big paragraph → put a **blank line** between paragraphs in the textarea, not just a line break.

For anything else, message the developer.
