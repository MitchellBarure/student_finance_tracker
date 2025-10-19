// main.js
import { loadRecords, saveRecords, loadSettings, saveSettings, exportRecords, importFromJSON } from "./storage.js";
import { validators } from "./validators.js";
import { searchRecords } from "./search.js";
import { renderAll } from "./ui.js";

// Wait for the page to load so that the finance tracker can start with no problems
document.addEventListener("DOMContentLoaded", () => {

    //inclusion of an accessibility feature (a11y)
    function announce(msg) {
        const status = document.getElementById("status");
        if (status) status.textContent = msg
    }

    //Helpers to assist with Error messages for invalid fields
    function setErr(id, msg) {
        const el = document.getElementById(id);
        if (el) el.textContent = msg || "";
    }

    //Clears all the errors before sanitizing the input again
    function clearAllFormErrors() {
        ["desc-err","cat-err","amt-err","type-err","date-err"].forEach(id => setErr(id, ""));
        ["description","category","amount","type","date"].forEach(id => {
            const f = document.getElementById(id);
            if (f) f.removeAttribute("aria-invalid");
        });
    }

    //References and Variables for DOM
    const form = document.getElementById("finance-form");
    const recordList = document.getElementById("record-list");
    let editingId = null;
    let settings = loadSettings();
    let records = [];

    //Allows the user to delete a financial recordd
    if (recordList) {
        recordList.addEventListener("click", (e) => {
            const btn = e.target.closest("button");
            if (!btn || !btn.dataset.id) return;
            const id = btn.dataset.id;

            if (btn.classList.contains("btn-delete")) {
                const rec = records.find(r => r.id ===id)
                const label = rec?.description ? `"${rec.description}"` : "this record";
                if (!confirm(`Delete ${label}? This can't be reversed.`))return;

                records = records.filter(r => r.id !== id);
                saveRecords(records);
                applySearch();
                announce("The Record has been deleted")
            }

            //Allows user to edit a finacial record (makes use of editingId)
            if (btn.classList.contains("btn-edit")) {

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

    //Keeps dashboard up to date and renders the table of records
    loadRecords().then(data => {
        records = data;
        renderAll(records, settings);
    });

//Allows user to arrange columns (Description, Amount and Date) in ascending or descending order
    let sortKey = "date";
    let sortDir = "desc";

    function updateAriaSort() {
        document.querySelectorAll('thead th[data-sortkey]').forEach(th => {
            const key = th.getAttribute('data-sortkey');
            th.setAttribute('aria-sort', key === sortKey ? (sortDir === "asc" ? "ascending" : "descending") : "none");
        });
    }

    const sortableHeaders = document.querySelectorAll('thead th[data-sortkey]');
    sortableHeaders.forEach(th => {
        const key = th.getAttribute('data-sortkey');
        const activate = () => {
            if (sortKey === key) sortDir = (sortDir === "asc") ? "desc" : "asc";
            else { sortKey = key; sortDir = "asc"; }
            updateAriaSort();
            applySearch();
        };
        th.addEventListener("click", activate);
        th.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
        });
    });
    updateAriaSort();

    //Allows user to see the new arranged array
    function sortRecords(list) {
        const dir = sortDir === "asc" ? 1 : -1;
        return [...list].sort((a, b) => {
            if (sortKey === "amount") return (a.amount - b.amount) * dir;
            if (sortKey === "description") return a.description.localeCompare(b.description) * dir;
            return a.date.localeCompare(b.date) * dir;
        });
    }

    // Set variables for the SETTINGS
    const capInput = document.getElementById("cap-amount");
    const saveCapBtn = document.getElementById("save-cap");
    const rateUSD = document.getElementById("rate-usd");
    const rateEUR = document.getElementById("rate-eur");
    const displayCur = document.getElementById("display-currency");
    const saveRatesBtn = document.getElementById("save-rates");
    const ratesErr = document.getElementById("rates-err");

    // This ensure saved settings can be loaded
    capInput.value = settings.cap ? String(settings.cap) : "";
    rateUSD.value = settings.rates?.USD  ? String(settings.rates.USD) : "";
    rateEUR.value = settings.rates?.EUR  ? String(settings.rates.EUR) : "";
    displayCur.value = settings.display || "RWF";

    //Allows user to save their cap mount
    saveCapBtn.addEventListener("click", () => {
        settings.cap = parseFloat(capInput.value) || 0;  //Will show message: "No cap amount set!"
        saveSettings(settings)
        renderAll(records, settings)
        alert("Budget cap saved!");
        announce("Budget cap saved.");
    });

    //Allows user save the currency settings to change currency of financial records (in table and dashboard) and statistics
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

   //Search finance records using regex (USER-INPUT), provides error message for invalid regex input and shows matches found in table
    const searchInput = document.getElementById("search-input");
    const searchCase = document.getElementById("search-case");
    const searchErrEl = document.getElementById("search-err");


    function applySearch() {
        const { filtered, highlightRe, error } = searchRecords(records, searchInput?.value || "", !!searchCase?.checked);
        if (searchErrEl) searchErrEl.textContent = error || "";
        const sorted = sortRecords(filtered)
        renderAll(sorted, settings, highlightRe);
    }

    if (searchInput) searchInput.addEventListener("input", applySearch);
    if (searchCase)  searchCase.addEventListener("change", applySearch);

    //Remove error messages as soon the user starts fixing a field
    ["description","category","amount","type","date"].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", () => {
            const map = { description:"desc-err", category:"cat-err", amount:"amt-err", type:"type-err", date:"date-err" };
            setErr(map[id], "");
            el.removeAttribute("aria-invalid");
        });
    });

    //Checks user input for creation/editing of record, save it and announce
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        clearAllFormErrors();
        let firstError = null;

        const descriptionRaw = document.getElementById("description").value;
        const category = document.getElementById("category").value;
        const amountStr = document.getElementById("amount").value;
        const type = document.getElementById("type").value;
        const date = document.getElementById("date").value;

        const { reDescripNoEdge, reAmount, reDate, reDupWord, reCategory } = validators;

        let hasError = false;

        if (!reDescripNoEdge.test(descriptionRaw)) {
            setErr("desc-err", "The description must not start or end with spaces.");
            document.getElementById("description").setAttribute("aria-invalid","true");
            firstError = document.getElementById("description");
            hasError = true;
        }

        if (!reCategory.test(String(category || "").trim())) {
            setErr("cat-err", "The category must contain letters or spaces or hyphens ONLY.");
            document.getElementById("category").setAttribute("aria-invalid","true");
            firstError = firstError || document.getElementById("category");
            hasError = true;
        }

        if (!reAmount.test(amountStr)) {
            setErr("amt-err", "The amount must be a number, limited to 2 decimals. (e.g. 350.05)");
            document.getElementById("amount").setAttribute("aria-invalid","true");
            firstError = firstError || document.getElementById("amount");
            hasError = true;
        }
        if (!type){
            setErr("type-err", "Please select the transaction type.");
            document.getElementById("type").setAttribute("aria-invalid","true");
            firstError = firstError || document.getElementById("type");
            hasError = true;
        }
        if (!reDate.test(date)) {
            setErr("date-err", "Use the date format YYYY-MM-DD.");
            document.getElementById("date").setAttribute("aria-invalid","true");
            firstError = firstError || document.getElementById("date");
            hasError = true;
        }
        if (reDupWord.test(descriptionRaw)) {
            setErr("desc-err", "DAlert! Duplicate words detected in description");
            document.getElementById("description").setAttribute("aria-invalid","true");
        }
        if (hasError) {
            if (firstError) firstError.focus();
            announce("Please fix the highlighted fields.");
            return;
        }

        const description = descriptionRaw.trim().replace(/\s{2,}/g, " ");
        const amount = parseFloat(amountStr);
        const nowISO = new Date().toISOString()

        if (editingId) {
            // UPDATE the existing financial records
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

        // ADD new financial record
        const id = "rec_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        const newRecord = { id, description, category, amount, type, date, createdAt: nowISO, updatedAt: nowISO };

        records.push(newRecord);
        saveRecords(records);
        form.reset();
        applySearch();
        announce("REcord added.")
    });


    // Allow user to upload a json so that it is added to financial record table
    const exportBtn  = document.getElementById("btn-export");
    const importFile = document.getElementById("file-import");
    const importErr  = document.getElementById("import-err");


    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            const json = exportRecords();
            const blob = new Blob(([String(json)]), { type: "application/json"});
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url
            a.download = "student_finance_records.json";
            a.click()
            URL.revokeObjectURL(url);
        });
    }

//Download financial records as json
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

    //A little detail for the footer
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
});