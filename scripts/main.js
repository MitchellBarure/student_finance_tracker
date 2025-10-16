// main.js
import { loadRecords, saveRecords, loadSettings, saveSettings } from "./storage.js";
import { validators } from "./validators.js";
import { compileRegex, highlight, escapeHtml } from "./search.js";
import { fmtAmount, updateDashboard } from "./ui.js";


// Wait for the page to load
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("finance-form");
    const recordList = document.getElementById("record-list");


    let records = loadRecords();
    let settings = loadSettings();
    let sortKey = "date";
    let sortDir = "desc";
    let searchInputValue = "";
    let searchFlagsCI = true;

    //SETTINGS
    const capInput = document.getElementById("cap-amount");
    const saveCapBtn = document.getElementById("save-cap");
    const rateUSD = document.getElementById("rate-usd");
    const rateEUR = document.getElementById("rate-eur");
    const displayCur = document.getElementById("display-currency");
    const saveRatesBtn = document.getElementById("save-rates");
    const ratesErr = document.getElementById("rates-err");

    // preload saved settings
    capInput.value = settings.cap ? String(settings.cap) : "";
    rateUSD.value = settings.rates?.USD  ? String(settings.rates.USD) : "";
    rateEUR.value = settings.rates?.EUR  ? String(settings.rates.EUR) : "";
    displayCur.value = settings.display || "RWF";

    saveCapBtn.addEventListener("click", () => {
        settings.cap = parseFloat(capInput.value) || 0;
        saveSettings(settings)
        updateDashboard(records, settings);
        alert("Budget cap saved!");
    });

    saveRatesBtn.addEventListener("click", () => {
        const usd = parseFloat(rateUSD.value) || 0;
        const eur = parseFloat(rateEUR.value) || 0;
        const display = displayCur.value;
        if (usd < 0 || eur < 0) {
            ratesErr.textContent = "Rates must be positive numbers.";
            return;
        }
        settings.rates = { USD: usd, EUR: eur };
        settings.display = display;
        saveSettings(settings);
        ratesErr.textContent = "";
        updateDashboard(records, settings);
        alert("Currency settings saved!");
    });

    // Tolbar
    (function injectSearchToolbar() {
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
        input.addEventListener("input", () => {
            searchInputValue = input.value;
            renderRecords();
            updateDashboard(records, settings);
        });
        ci.addEventListener("change", () => {
            searchFlagsCI = ci.checked;
            renderRecords();
            updateDashboard(records, settings);
        });
    })();

    function getFilteredRecords() {
        const flags = (searchFlagsCI ? "i" : "");
        const re = compileRegex(searchInputValue.trim(), flags);
        const arr = re
            ? records.filter(r =>
                re.test(r.description) ||
                re.test(r.type) ||
                re.test(String(r.amount)) ||
                re.test(r.date)
            )
            : records.slice();

        const mul = sortDir === "asc" ? 1 : -1;
        arr.sort((a, b) => {
            if (sortKey === "amount") return (a.amount - b.amount) * mul;
            if (sortKey === "description" || sortKey === "type")
                return a[sortKey].localeCompare(b[sortKey]) * mul;
            return a.date.localeCompare(b.date) * mul;
        });
        return arr;
    }

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
          <button class="delete-btn" data-index="${index}">Delete</button>
        </td>
      `;
            recordList.appendChild(tr);
        });

        wireSortHeaders()

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                const idx = Number(e.currentTarget.getAttribute("data-index"));
                const current = getFilteredRecords();
                const rec = current[idx];
                if (!rec) return;
                const removeIndex = records.findIndex(r =>
                    r.id === rec.id ||
                    (r.description === rec.description &&
                        r.amount === rec.amount &&
                        r.type === rec.type &&
                        r.date === rec.date)
                );
                if (removeIndex > -1) {
                    records.splice(removeIndex, 1);
                    saveRecords(records);
                    renderRecords();
                    updateDashboard(records, settings);
                }
            });
        });
    }

    function wireSortHeaders() {
        const thead = recordList.closest("table")?.querySelector("thead");
        if (!thead) return;
        const map = { 0: "description", 1: "amount", 2: "type", 3: "date" };
        [...thead.querySelectorAll("th")].forEach((th, i) => {
            if (!(i in map)) return;
            th.style.cursor = "pointer";
            th.title = "Click to sort";
            th.onclick = () => {
                const key = map[i];
                if (sortKey === key) sortDir = sortDir === "asc" ? "desc" : "asc";
                else {
                    sortKey = key;
                    sortDir = key === "date" ? "desc" : "asc";
                }
                renderRecords();
                updateDashboard(records, settings);
            };
        });
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const descriptionRaw = document.getElementById("description").value;
        const amountStr = document.getElementById("amount").value;
        const type = document.getElementById("type").value;
        const date = document.getElementById("date").value;

        const { reDescNoEdge, reAmount, reDate, reDupWord } = validators;

        if (!reDescNoEdge.test(descriptionRaw)) {
            alert("Description cannot start or end with spaces.");
            return;
        }
        if (!reAmount.test(amountStr)) {
            alert("Amount must be a number (up to 2 decimals).");
            return;
        }
        if (!type) {
            alert("Please choose income or expense.")
            return;
        }
        if (!reDate.test(date)) {
            alert("Use date format YYYY-MM-DD.");
            return;
        }
        if (reDupWord.test(descriptionRaw)) {
            alert("Warning: duplicate word detected in description.");
        }

        const description = descriptionRaw.trim().replace(/\s{2,}/g, " ");
        const amount = parseFloat(amountStr);
        const nowISO = new Date().toISOString()
        const id = "rec_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        const newRecord = { id, description, amount, type, date, createdAt: nowISO, updatedAt: nowISO };

        records.push(newRecord);
        saveRecords(records);
        form.reset();
        renderRecords();
        updateDashboard(records, settings);
    });

    // json
    const exportBtn  = document.getElementById("btn-export");
    const importFile = document.getElementById("file-import");
    const importErr  = document.getElementById("import-err");

// ExportING FROM json
    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url
            a.download = "student_finance_records.json";
            a.click()
            URL.revokeObjectURL(url);
        });
    }

//Importing from JSON
    if (importFile) {
        importFile.addEventListener("change", (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            if (!file.name.endsWith(".json")) {
                importErr.textContent = "Please upload a .json file.";
                return;
            }

            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const text = String(ev.target.result || "");
                    const data = JSON.parse(text);

                    if (!Array.isArray(data)) {
                        importErr.textContent = "Invalid file format.";
                        return;
                    }

                    // Validate
                    const valid = data.every(rec =>
                        rec &&
                        typeof rec.description === "string" &&
                        typeof rec.amount === "number" &&
                        (rec.type === "income" || rec.type === "expense") &&
                        /^\d{4}-\d{2}-\d{2}$/.test(rec.date)
                    );
                    if (!valid) {
                        importErr.textContent = "Some records are invalid.";
                        return;
                    }

                    records = data;
                    saveRecords(records);
                    renderRecords()
                    updateDashboard(records, settings);
                    importErr.textContent = "";
                    alert("Records imported successfully!");
                } catch {
                    importErr.textContent = "Invalid or corrupted JSON file.";
                }
            };
            reader.readAsText(file);
        });
    }

    renderRecords();
    updateDashboard(records, settings)

    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
});