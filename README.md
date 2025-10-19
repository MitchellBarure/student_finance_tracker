# 💰 Student Finance Tracker

A simple, accessible, and responsive **web application** that helps students manage their income, expenses, and savings.  
Built using **HTML 5**, **CSS 3**, and **JavaScript (ES6 Modules)** — no external frameworks required.

---
## 🌐 Live Website
🔗 [Live Demo on GitHub Pages](https://mitchellbarure.github.io/student_finance_tracker/)
📁 [Repository](https://github.com/MitchellBarure/student_finance_tracker)

---
## 🎯 Purpose

The goal of this project is to help students:
- Record and track income & expenses easily.
- View summaries and visual insights.
- Maintain awareness of their financial health through dashboards, caps, and trends.

---

## 🧠 Features

### 1. Add / Edit / Delete Financial Records
- Input **description**, **category**, **amount**, **type** (income / expense), and **date**.
- Inline validation using **regex patterns** for data accuracy.
- Accessible error messages (`aria-live`, `aria-invalid`).

### 2. Dashboard & Statistics
- Auto-calculates **total income**, **total expense**, and **balance**.
- Displays:
    - **Top expense category**
    - **Average expense amount**
    - **Total number of records**
- Budget Cap indicator shows how much remains or if the cap is exceeded.

### 3. Expense Trend Chart
- Shows a **7-day bar chart** of expenses (generated dynamically with JavaScript).

### 4. Sortable & Searchable Records
- Click column headers to **sort** by description, amount, or date.
- Use **regular expressions (regex)** to search descriptions or categories dynamically.

### 5. Import / Export Data
- Export your records as a JSON file.
- Import records from a JSON file (with validation).

### 6. Persistent Settings
- Data and preferences are saved using **localStorage** (no backend required).
- Settings include:
    - Monthly **cap limit**
    - Currency display (RWF / USD / EUR)
    - Custom exchange rates

### 7. Accessibility & Usability
- Skip-to-main link and ARIA roles.
- Keyboard-friendly sorting and navigation.
- Live region announcements for updates.

---
## 🔍 Regex Catalog

| Pattern | Purpose | Example Match |
|----------|----------|----------------|
| `/^\S(?:.*\S)?$/` | Description – prevents leading/trailing spaces | `"Lunch at Cafe"` ✅ `"  Dinner"` ❌ |
| `/^(0|[1-9]\d*)(\.\d{1,2})?$/` | Amount – allows numbers with up to 2 decimals | `120`, `35.50` ✅ `12.345` ❌ |
| `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/` | Date – ensures valid YYYY-MM-DD format | `2025-10-19` ✅ |
| `/\b(\w+)\s+\1\b/i` | Detects duplicate words | `"very very good"` ✅ `"very good"` ❌ |
| `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | Category – alphabetic, supports spaces/hyphens | `"Food & Drinks"` ✅ `"123Food"` ❌ |

___
## ⚙️ Technology Stack

| Component | Technology Used |
|------------|-----------------|
| **Frontend** | HTML 5, CSS 3, JavaScript (ES6 Modules) |
| **Storage** | Browser `localStorage` |
| **Validation** | Regular Expressions |
| **Chart** | Pure CSS bars generated dynamically |
| **Accessibility** | ARIA live regions, roles, keyboard navigation |

---

## 🧩 Project Structure

student-finance-tracker/
│
├── index.html
├── styles/
│ └── style.css
├── scripts/
│ ├── main.js
│ ├── ui.js
│ ├── storage.js
│ ├── search.js
│ └── validators.js
└── seed.json

yaml
Copy code

---

## 🚀 How to Run

1. Download or clone this repository.
2. Open `index.html` in your browser.
3. The seed data loads automatically the first time.
4. Add, edit, or delete records freely — everything is saved locally.

---

## 🧰 Testing Guide

| Task | Expected Behavior |
|------|--------------------|
| Add record | Appears immediately in table & updates dashboard |
| Edit record | Fields pre-fill, updates on save |
| Delete record | Prompts confirmation, removes row |
| Sort headers | Click once for ascending, twice for descending |
| Regex search | Filters table live (e.g. `^T` shows “Transport”) |
| Export JSON | Downloads validated file |
| Import JSON | Replaces existing data after confirmation |
| Change cap | Updates cap status message |
| Change currency | Recalculates dashboard amounts instantly |

---

## ⌨️ Keyboard Map

| Key | Action |
|-----|---------|
| `Tab` / `Shift + Tab` | Navigate through buttons and input fields |
| `Enter` | Submit form / Confirm dialog |
| `Space` | Toggle sort order when focused on column header |
| `Esc` | Cancel editing or close dialogs |

___

## 📈 Accessibility / A11y Features
- Live status messages with `aria-live="polite"` / `assertive`
- Keyboard-accessible sort headers
- Semantic HTML structure (landmarks: `header`, `main`, `section`)
- Descriptive labels for inputs and buttons

---

## 👨‍💻 Author
**Mitchell Barure**  
Software Engineering Student — African Leadership University  
📧 [m.barure@alustudent.com](mailto:m.barure@alustudent.com)  
🌐 [GitHub Profile](https://github.com/MitchellBarure)

---

## 🪪 License
This project is open-source and free for educational use.
