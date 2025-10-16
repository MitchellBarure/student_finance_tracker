// Wait for the page to load
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("finance-form");
    const recordList = document.getElementById("record-list");

    const totalIncomeEl = document.getElementById("total-income");
    const totalExpenseEl = document.getElementById("total-expense");
    const balanceEl = document.getElementById("balance");


    const STORAGE_KEY = "sft:records";
    let records = [];
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        records = saved ? JSON.parse(saved) : [];
    } catch {
        records = []; // fallback if JSON is corrupted
    }


    let sortKey = "date";
    let sortDir = "desc";
    let searchInputValue = "";
    let searchFlagsCI = true;


    (function injectSearchToolbar(){
        const section = document.getElementById("records-section");
        if (!section) return;
        const toolbar = document.createElement("div");
        toolbar.style.display = "flex";
        toolbar.style.gap = "12px";
        toolbar.style.flexWrap = "wrap";
        toolbar.style.alignItems = "center";
        toolbar.style.margin = "6px 0 10px";

        toolbar.innerHTML = `
      <label for="sft-search" style="font-weight:600;">Regex search:</label>
      <input id="sft-search" placeholder="e.g. (coffee|tea)|\\b(\\w+)\\s+\\1\\b"
             style="padding:.4rem .6rem;border:1px solid #e6e6e6;border-radius:8px;min-width:220px;" />
      <label style="display:flex;align-items:center;gap:6px;">
        <input type="checkbox" id="sft-ci" checked />
        <span>Case-insensitive</span>
      </label>
      <span id="sft-search-error" style="color:#b00020;min-height:1.2em;"></span>
    `;

        const h2 = section.querySelector("h2");
        if (h2 && h2.nextSibling) section.insertBefore(toolbar, h2.nextSibling);
        else section.prepend(toolbar);

        const input = document.getElementById("sft-search");
        const ci = document.getElementById("sft-ci");
        input.addEventListener("input", () => { searchInputValue = input.value; renderRecords(); updateDashboard(); });
        ci.addEventListener("change", () => { searchFlagsCI = ci.checked; renderRecords(); updateDashboard(); });
    })();

   //Helper function
    function compileRegex(input, flags) {
        try {
            if (!input) return null;
            // Ensure global for multiple highlights
            const f = (flags || "") + (flags?.includes("g") ? "" : "g");
            return new RegExp(input, f);
        } catch { return null; }
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({
            "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
        })[c]);
    }

    function highlight(text, re) {
        if (!re) return escapeHtml(text);
        return escapeHtml(text).replace(re, m => `<mark>${m}</mark>`);
    }

    function fmtAmount(n) { return Number(n || 0).toLocaleString() + " RWF"; }

    // Keep all totals up to date
    function updateDashboard() {
        let totalIncome = 0;
        let totalExpense = 0;


        const filtered = getFilteredRecords();

        filtered.forEach(record => {
            if (record.type === "income") totalIncome += record.amount;
            else totalExpense += record.amount;
        });

        const balance = totalIncome - totalExpense;

        totalIncomeEl.textContent = fmtAmount(totalIncome).replace(" RWF RWF", " RWF");
        totalExpenseEl.textContent = fmtAmount(totalExpense).replace(" RWF RWF", " RWF");
        balanceEl.textContent = fmtAmount(balance).replace(" RWF RWF", " RWF");
    }


    function getFilteredRecords() {
        const flags = (searchFlagsCI ? "i" : "");
        const re = compileRegex(searchInputValue.trim(), flags);
        const arr = re
            ? records.filter(r =>
                re.test(r.description) || re.test(r.type) || re.test(String(r.amount)) || re.test(r.date)
            )
            : records.slice();


        const mul = (sortDir === "asc") ? 1 : -1;
        arr.sort((a, b) => {
            if (sortKey === "amount") return (a.amount - b.amount) * mul;
            if (sortKey === "description" || sortKey === "type") return a[sortKey].localeCompare(b[sortKey]) * mul;

            return a.date.localeCompare(b.date) * mul;
        });
        return arr;
    }

    // Render all records
    function renderRecords() {
        const searchErr = document.getElementById("sft-search-error");
        const flags = (searchFlagsCI ? "i" : "");
        const re = compileRegex(searchInputValue.trim(), flags);
        if (searchErr) searchErr.textContent = (searchInputValue && !re) ? "Invalid regex pattern" : "";

        const rows = getFilteredRecords();
        recordList.innerHTML = "";

        rows.forEach((record, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${re ? highlight(record.description, re) : escapeHtml(record.description)}</td>
        <td>${fmtAmount(record.amount)}</td>
        <td>${re ? highlight(record.type.charAt(0).toUpperCase() + record.type.slice(1), re)
                : record.type.charAt(0).toUpperCase() + record.type.slice(1)}</td>
        <td>${re ? highlight(record.date, re) : escapeHtml(record.date)}</td>
        <td>
          <button class="delete-btn" data-id="${record.id || ""}" data-index="${index}">Delete</button>
        </td>
      `;
            recordList.appendChild(tr);
        });


        wireSortHeaders();

        // Delete records from table
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                const idxAttr = e.currentTarget.getAttribute("data-index");
                let idx = Number(idxAttr);


                const current = getFilteredRecords();
                const rec = current[idx];
                if (!rec) return;


                const removeIndex = records.findIndex(r => (r.id && rec.id) ? r.id === rec.id :
                    (r.description === rec.description && r.amount === rec.amount && r.type === rec.type && r.date === rec.date));
                if (removeIndex > -1) {
                    records.splice(removeIndex, 1);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); // persist (Step 3)
                    renderRecords();
                    updateDashboard();
                }
            });
        });
    }


    function wireSortHeaders() {
        const thead = recordList.closest("table")?.querySelector("thead");
        if (!thead) return;
        const map = {
            0: "description",
            1: "amount",
            2: "type",
            3: "date"
        };
        [...thead.querySelectorAll("th")].forEach((th, i) => {
            if (!(i in map)) return;
            th.style.cursor = "pointer";
            th.title = "Click to sort";
            th.onclick = () => {
                const key = map[i];
                if (sortKey === key) {
                    sortDir = (sortDir === "asc") ? "desc" : "asc";
                } else {
                    sortKey = key;
                    sortDir = (key === "date") ? "desc" : "asc"; // sensible defaults
                }
                renderRecords();
                updateDashboard();
            };
        });
    }

    // Handle form submission
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const descriptionRaw = document.getElementById("description").value;
        const amountStr     = document.getElementById("amount").value;
        const type          = document.getElementById("type").value;
        const date          = document.getElementById("date").value;

        // --- Regex patterns for Validation
        const reDescNoEdge = /^\S(?:.*\S)?$/;                          // no leading/trailing spaces
        const reAmount     = /^(0|[1-9]\d*)(\.\d{1,2})?$/;             // 0 or 12 or 12.34
        const reDate       = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/; // YYYY-MM-DD
        const reDupWord    = /\b(\w+)\s+\1\b/i;                        // ADVANCED: duplicate word back-reference


        if (!reDescNoEdge.test(descriptionRaw)) {
            alert("Description cannot start or end with spaces.");
            return;
        }
        if (!reAmount.test(amountStr)) {
            alert("Amount must be a number (up to 2 decimals).");
            return;
        }
        if (!type) {
            alert("Please choose income or expense.");
            return;
        }
        if (!reDate.test(date)) {
            alert("Use date format YYYY-MM-DD.");
            return;
        }
        if (reDupWord.test(descriptionRaw)) {

            alert("Warning: duplicate word detected in description.");
        }

        // sanitize description
        const description = descriptionRaw.trim().replace(/\s{2,}/g, " ");
        const amount = parseFloat(amountStr);


        const nowISO = new Date().toISOString();
        const id = "rec_" + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
        const newRecord = { id, description, amount, type, date, createdAt: nowISO, updatedAt: nowISO };

        records.push(newRecord);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); // persist after add

        form.reset();
        renderRecords();
        updateDashboard();
    });

    // Update Display
    renderRecords();
    updateDashboard();

    // Footer
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});
