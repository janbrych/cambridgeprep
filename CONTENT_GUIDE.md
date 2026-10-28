# Content guide: Reading & Use of English + Writing exercise bank

This app's exercises are **original material written to match the Cambridge
C1 Advanced (CAE) and C2 Proficiency (CPE) exam formats** — not copied from
real Cambridge papers or from any other site (that would be a copyright
problem, and official papers aren't freely reproducible). The format facts
below (number of parts, gaps, word counts) are public information about the
exam; the actual texts, gaps, questions and answers are written from
scratch, calibrated to feel like the real thing.

## Directory layout

```
data/
  exercises/
    multiple_choice_cloze/   c1-N.json, c2-N.json
    open_cloze/               ...
    word_formation/           ...
    key_word_transformation/  ...
    reading_multiple_choice/  ...
    gapped_text/              ...
    multiple_matching/        ...
  writing/
    c1-<type>-N.json, c2-<type>-N.json   (type = essay | email | report | review | proposal)
  progress/
    attempts.json             (objective exercise attempts, auto-scored)
    writing-submissions.json  (saved essays/reports/etc. + feedback once reviewed)
    feedback-log.json         (periodic personalised-feedback entries)
```

Every exercise is one JSON file. The exact shape of each part type is
defined in [`src/lib/types.ts`](src/lib/types.ts) — follow it exactly,
`npm run build`/`tsc` will fail loudly if a file doesn't match once it's
loaded with the typed helpers in `src/lib/exercises.ts`.

`id` must be globally unique and stable (don't change it after a user may
have attempts recorded against it) and should follow `<part-abbr>-<level
lowercase>-<n>`, e.g. `mcc-c1-3`, `kwt-c2-2`.

## Exam format reference (for calibration only — do not quote exam board text)

**C1 Advanced, Reading & Use of English** — 8 parts: 1) multiple-choice
cloze (8 gaps, 4 options, vocabulary/collocation/phrasal verbs), 2) open
cloze (8 gaps, one word each, grammar words), 3) word formation (8 gaps,
root word given, needs an affix change), 4) key word transformation (6
items, 3-6 words incl. the keyword), 5) reading multiple choice (long text,
6 questions), 6) cross-text multiple matching (4 short texts, compare
opinions), 7) gapped text (text with 6 paragraphs removed + 7 options, 1
extra), 8) multiple matching (text split into 4+ sections, 10 questions).

**C2 Proficiency, Reading & Use of English** — 7 parts: same 1-4 as above
(parts 1-3 identical in shape; part 4 is key word transformation here, not
part 6), then 5) reading multiple choice, 6) gapped text, 7) multiple
matching. C2 difficulty = lower-frequency vocabulary, more abstract/literary
topics, denser sentence structure, subtler distractors (near-synonyms with a
genuine, explainable gap in register/collocation — not just "obviously
wrong" words).

**Writing** (both levels): Part 1 is always a compulsory essay (discuss 2 of
3 given notes, give an opinion). Part 2 is a choice of email/letter, report,
review or proposal. C1 = 220-260 words per task; C2 = 280-320 words per
task, and the writing is expected to be more structurally ambitious (e.g.
handling a counter-argument, more natural complex grammar) rather than just
"harder vocabulary".

This app only covers Reading & Use of English and Writing (no Listening or
Speaking) — that was a deliberate scope decision, not an oversight.

## Rules for every exercise you write

1. **One unambiguous best answer.** For multiple-choice items (parts 1, 5,
   6, 8), the 3 wrong options must be wrong for a clear, statable reason
   (wrong collocation, wrong preposition pattern, wrong meaning, wrong word
   class) — not just "less good" synonyms. If two options could honestly
   both work, rewrite the sentence/options until only one does.
2. **Every question needs an `explanation`** (or, for gapped
   text/multiple matching, an explanation per answer) that a learner can
   learn from — name the rule/collocation/reference, don't just restate the
   answer.
3. **Original topics**, varied across the bank (don't write five texts
   about technology). Aim for the kind of discursive journalism /
   feature-article register the real exam uses.
4. **`acceptableAnswers`** (open cloze, word formation, key word
   transformation): only add genuine alternative correct words/phrasings,
   not loose paraphrases — these are matched programmatically
   (case-insensitive, whitespace-normalised).
5. Respect the gap/item/question counts above so a completed set feels like
   a real exam section, but a slightly shorter first draft is fine — it's
   better to add a correct, well-explained 6-gap set than force a flawed
   8th gap.
6. Don't reuse a passage, topic or key-word-transformation pattern that's
   already in the bank — check the existing files in the target directory
   first.

## The feedback loop (why this matters beyond just "more exercises")

This app has **no live AI integration** — the "AI assistant" is Claude
working through this project directly in a coding session, periodically:

1. Reading `data/progress/attempts.json` and
   `data/progress/writing-submissions.json`.
2. Aggregating which parts/levels have low scores or disputed
   (`flaggedForReview`) questions.
3. Writing personalised entries into `data/progress/feedback-log.json`
   (schema: `FeedbackLogEntry` in `src/lib/types.ts`) and, for writing
   submissions, filling in their `feedback` field (`WritingFeedback`).
4. Adding new exercises that specifically target whatever came up as weak,
   following this guide.

If you are an agent asked to "review progress" or "add exercises", read the
current contents of `data/progress/*.json` first and let them steer what
you write, rather than adding generic content.

### Review state / avoiding empty or duplicate reviews

`data/progress/review-state.json` holds `{ "lastReviewTimestamp": <ISO
string or null> }`. On each periodic review:

1. Read it, then read `attempts.json` and `writing-submissions.json`.
2. If every attempt/submission's `timestamp` is `<= lastReviewTimestamp`
   (or the file is empty), there's nothing new — **don't write a feedback
   entry, don't add exercises, just stop.** No activity since the last
   check is the expected common case, not an error.
3. Otherwise, do the review described above (aggregate weak areas, write a
   `FeedbackLogEntry`, fill in `WritingSubmission.feedback` for any
   submission that doesn't have it yet, add 1-3 new exercises targeting
   whatever came up weak), then set `lastReviewTimestamp` to the current
   time and write the file back.
