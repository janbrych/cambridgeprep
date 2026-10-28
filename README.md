# C1/C2 English Prep

A personal practice app for the Cambridge C1 Advanced (CAE) and C2
Proficiency (CPE) exams, covering **Reading & Use of English** and
**Writing**. All exercise content is original, written to match the real
exam formats (see [`CONTENT_GUIDE.md`](CONTENT_GUIDE.md) for details and the
rules new content follows).

There's no live AI integration — no API key, no chatbot. Instead, Claude
(via a coding session in this project) periodically reads
`data/progress/*.json` and:

- writes personalised entries into `data/progress/feedback-log.json`,
- fills in the `feedback` field on writing submissions,
- adds new exercises targeting whatever's come up as weak.

See the "Progress & Feedback" page in the app for what's been reviewed so
far.

## Running it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Layout

- `data/exercises/<part>/*.json` — Reading & Use of English exercises, one
  file per set.
- `data/writing/*.json` — Writing prompts.
- `data/progress/` — attempts, writing submissions and feedback log; this
  is the only data that changes as you use the app.
- `src/lib/types.ts` — the schema every exercise/prompt file follows.
- `src/lib/exercises.ts`, `src/lib/store.ts` — read/write helpers (plain
  JSON files on disk, no database).
- `src/components/exercises/` — the practice UI for each part type.
