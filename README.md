Student Finance Tracker

Accessible, responsive, vanilla HTML/CSS/JS app to track student income & expenses with live regex search, sorting, localStorage persistence, and JSON import/export. Built for the ALU “Building Responsive UI” summative.

Author: Mitchell Barure · GitHub
· m.barure@alustudent.com

Live Demo: Add your GitHub Pages URL here

✨ Features

Add/Delete records (id, description, amount, type, date, timestamps)

Dashboard: Total Income, Total Expenses, Balance

Insights: Top Expense, Average Expense, Budget Cap Status

Regex live search (with case-insensitive toggle) + safe compile + <mark> highlighting

Sorting on Description, Amount, Type, Date (A↕Z / ↑↓)

Persistence via localStorage

Settings: Monthly budget cap, currency display (RWF/USD/EUR) + manual rates

Import/Export JSON with validation

A11y: Skip link, live regions, keyboardable sorting (Enter/Space), visible focus, table caption

Responsive (mobile-first; tablet/desktop breakpoints)

🗂 Project Structure
.
├── index.html
├── styles/
│   └── style.css
├── scripts/
│   ├── main.js          # orchestrates DOM/events/rendering
│   ├── storage.js       # load/save records & settings (localStorage + seed.json)
│   ├── validators.js    # regex rules for form validation
│   ├── search.js        # safe regex compile + escape + highlight
│   ├── ui.js            # totals + insights (top/avg/cap) + formatting
│   └── seed.json        # starter data (loaded on first run if no local data)
└── README.md

🚀 Run & Deploy
Run locally

fetch("./scripts/seed.json") requires serving over HTTP (not file://).

VS Code Live Server (recommended), or

Python:

python3 -m http.server
# open http://localhost:8000

Deploy to GitHub Pages

Push to GitHub.

Repo Settings → Pages → Source: Deploy from a branch, Branch: main (root).

Save and open the Pages URL.

Put that URL at the top of this README.

Any future commit to the configured branch auto-updates the live site.

🧩 Data Model

Each record contains a unique id and timestamps:

{
"id": "rec_abc123",
"description": "Lunch at Campus",
"amount": 3500,
"type": "expense",      // "income" | "expense"
"date": "2025-01-06",   // YYYY-MM-DD
"createdAt": "ISO",
"updatedAt": "ISO"
}


Storage: localStorage key sft:records

Settings: localStorage key sft:settings

{
"cap": 0,
"rates": { "USD": 0, "EUR": 0 },
"display": "RWF"
}

🌱 Seed Data

File: scripts/seed.json

Loaded automatically only if there’s no saved data yet:

storage.js → loadRecords() fetches seed.json, persists it to localStorage, and returns it.

If you open directly with file://, fetch may fail. Use a local server (see “Run locally”).

📥 Import / Export

Export: “Export JSON” → downloads student_finance_records.json

Import: “Import JSON” → validates and loads array data
Minimal validation checks:

description (string), amount (number),

type (“income” | “expense”),

date matches YYYY-MM-DD

✅ Form Validation (Regex)

Defined in scripts/validators.js:

No leading/trailing spaces
^\S(?:.*\S)?$

Amount (0 or integer/decimal up to 2 dp)
^(0|[1-9]\d*)(\.\d{1,2})?$

Date (YYYY-MM-DD)
^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$

Advanced (duplicate word back-ref)
\b(\w+)\s+\1\b → warns if found in description

🔎 Regex Search

Live input compiles with a safe compiler (search.js: compileRegex()); invalid patterns show an assertive error message.

Case-insensitive toggle via checkbox.

Matches are highlighted using <mark> without breaking accessibility.

Examples to try:

Cents present: /\.\d{2}\b/

Beverage keywords: /(coffee|tea)/i

Duplicate word: /\b(\w+)\s+\1\b/

Dates in Jan 2025: /^2025-01/

📊 Dashboard & Insights

Totals: Income, Expenses, Balance (formatted with fmtAmount)

Insights:

Top Expense (max of expenses)

Average Expense (mean of expenses)

Cap Status (remaining vs exceeded)

Budget Cap and Currency settings stored in sft:settings.

♿ Accessibility

Landmarks: header, nav, main, section, footer

Skip link: “Skip to main content”

Live regions:

#status (polite) for actions like add/delete/import/export

#sft-search-error (assertive) for invalid regex

#cap-status (polite) for cap updates

Table caption (sr-only) describes sortable records table

Visible focus (:focus-visible)

Sortable headers announced; keyboard activation via Enter/Space

⌨️ Keyboard Map

Skip to content: Tab (first focus) → Enter

Navigate form & buttons: Tab / Shift+Tab; Enter to activate

Sort columns: Focus header → Enter/Space

Delete row: Tab to the row’s “Delete” → Enter

Regex search: Type in the search input; toggle case insensitive

🧪 Quick Test Snippet (optional)

Create a tests.html (optional) and add:

<script type="module">
  import { validators } from './scripts/validators.js';
  console.assert(validators.reAmount.test("12.50"), "Amount regex failed");
  console.assert(validators.reDate.test("2025-01-06"), "Date regex failed");
  console.log("Basic validator tests passed");
</script>

🎥 Demo Video (2–3 min)

Show (keyboard-first where possible):

Add income & expense (show validation), totals update

Sort by Date → Amount → Description

Regex search: (coffee|tea), then a broken pattern (see assertive error)

Settings: set cap + USD/EUR rates; see Cap Status update

Export JSON → Import the same file

Keyboard navigation (skip link, sorting with Enter/Space, delete)

Upload unlisted (YouTube/Drive) and paste the link here.

📎 Notes / Limitations

seed.json requires serving via HTTP (local server or GitHub Pages).

Currency display/rates are stored for settings; totals currently shown in RWF (extend easily to convert displayed totals using settings.display & rates).

🔒 Academic Integrity

UI/logic authored for this assignment. Any adapted accessibility patterns are cited in code comments where applicable.

✅ Submission Checklist

Public GitHub repo link

GitHub Pages live link in this README

seed.json present and loads on first run

README includes features, regex catalog, keyboard map, a11y notes

Demo video link (unlisted)

App runs with local server and on GitHub Pages