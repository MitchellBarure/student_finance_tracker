// main.js
import { loadRecords, saveRecords, loadSettings, saveSettings, exportRecords, importFromJSON } from "./storage.js";
import { validators } from "./validators.js";
import { searchRecords } from "./search.js";
import { renderAll } from "./ui.js";

// Wait for the page to load
document.addEventListener("DOMContentLoaded", () => {

    function announce(msg) {
        const s = document.getElementById("status");
        if (s) s.textContent = msg
    }

    const form = document.getElementById("finance-form");
    const recordList = document.getElementById("record-list");

    let editingId = null;
    let settings = loadSettings();
    let records = [];

    if (recordList) {
        recordList.addEventListener("click", (e) => {
            const btn = e.target.closest("button");
            if (!btn || !btn.dataset.id) return;
            const id = btn.dataset.id;

            if (btn.classList.contains("btn-delete")) {
                // DELETE (no confirm, super simple)
                records = records.filter(r => r.id !== id);
                saveRecords(records);
                applySearch(); // or renderAll(records, settings);
            }

            if (btn.classList.contains("btn-edit")) {
                // EDIT: prefill form and mark editing
                const rec = records.find(r => r.id === id);
                if (!rec) return;
                document.getElementById("description").value = rec.description ?? "";
                document.getElementById("category").value    = rec.category ?? "";
                document.getElementById("amount").value      = String(rec.amount ?? "");
                document.getElementById("type").value        = rec.type ?? "";
                document.getElementById("date").value        = rec.date ?? "";
                editingId = id;
            }
        });
    }

    loadRecords().then(data => {
        records = data;
        renderAll(records, settings);
    });


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
        renderAll(records, settings);
        alert("Budget cap saved!");
        announce("Budget cap saved.");
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
        renderAll(records, settings);
        alert("Currency settings saved!")
        announce("Currency settings saved.");
    });

    const searchInput = document.getElementById("search-input");
    const searchCase = document.getElementById("search-case");
    const searchErrEl = document.getElementById("search-err");

    function applySearch() {
        const { filtered, highlightRe, error } = searchRecords(records, searchInput?.value || "", !!searchCase?.checked);
        if (searchErrEl) searchErrEl.textContent = error || "";
        renderAll(filtered, settings, highlightRe);
    }

    if (searchInput) searchInput.addEventListener("input", applySearch);
    if (searchCase)  searchCase.addEventListener("change", applySearch);

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const descriptionRaw = document.getElementById("description").value;
        const category = document.getElementById("category").value;
        const amountStr = document.getElementById("amount").value;
        const type = document.getElementById("type").value;
        const date = document.getElementById("date").value;

        const { reDescripNoEdge, reAmount, reDate, reDupWord, reCategory } = validators;

        if (!reDescripNoEdge.test(descriptionRaw)) {
            alert("The description must not start or end with spaces.");
            return;
        }

        if (!reCategory.test(String(category || "").trim())) {
            alert("The category must contain letters or spaces or hyphens ONLY.");
            return;
        }

        if (!reAmount.test(amountStr)) {
            alert("The amount must be a number (limited to 2 decimals).");
            return;
        }
        if (!type) {
            alert("Please select the transaction type.")
            return;
        }
        if (!reDate.test(date)) {
            alert("Use the date format YYYY-MM-DD.");
            return;
        }
        if (reDupWord.test(descriptionRaw)) {
            alert("Alert! Duplicate words detected in description");
        }

        const description = descriptionRaw.trim().replace(/\s{2,}/g, " ");
        const amount = parseFloat(amountStr);
        const nowISO = new Date().toISOString()
        if (editingId) {
            // UPDATE existing record
            const idx = records.findIndex(r => r.id === editingId);
            if (idx !== -1) {
                records[idx] = {
                    ...records[idx],
                    description,
                    category,
                    amount,
                    type,
                    date,
                    updatedAt: nowISO
                };
                saveRecords(records);
                applySearch();
                announce("Record updated.");
            }
            editingId = null;   // exit edit mode
            form.reset();
            return;
        }

        // ADD new record
        const id = "rec_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        const newRecord = { id, description, category, amount, type, date, createdAt: nowISO, updatedAt: nowISO };

        records.push(newRecord);
        saveRecords(records);
        form.reset();
        applySearch();
        announce("REcord added.")
    });

    // json
    const exportBtn  = document.getElementById("btn-export");
    const importFile = document.getElementById("file-import");
    const importErr  = document.getElementById("import-err");

// ExportING FROM json
    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            const json = exportRecords();
            const blob = new Blob([json], { type: "application/json"});
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url
            a.download = "student_finance_records.json";
            a.click()
            URL.revokeObjectURL(url);
            announce("Records exported")
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
                const text = String(ev.target.result || "");
                const {ok, data, error} = importFromJSON(text)
                if (!ok) {
                    importErr.textContent = error || "Invalid file";
                    return;
                }
                records = data;
                saveRecords(records)
                importErr.textContent = "";
                applySearch();
                announce("Record added.");
                alert("Record added successfullly.");
                };

                reader.readAsText(file);
            });
        }

    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
});