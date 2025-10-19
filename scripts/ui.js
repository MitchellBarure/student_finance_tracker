// ui.js

//Convert all numerical amounts into string + "RWF"

export function fmtAmount(n, settings) {
    const RWFvalue = Number(n || 0);
    const display = settings?.display || "RWF";
    const rates = settings?.rates || {USD: 0, EUR: 0};

    let shown = RWFvalue; // base = RWF
    if (display === "USD") shown = RWFvalue * Number(rates.USD || 0);
    if (display === "EUR") shown = RWFvalue * Number(rates.EUR || 0);

    const opts = {
        minimumFractionDigits: display === "RWF" ? 0 : 2,
        maximumFractionDigits: 2
    };
    return `${shown.toLocaleString(undefined, opts)} ${display}`;
    }

//Ensures that the dashboard are always up to date
export function updateDashboard(records, settings) {
    let totalIncome = 0;
    let totalExpense = 0;

    for (const r of records) {
        if (r.type === "income") totalIncome += r.amount;
        else if (r.type === "expense") totalExpense += r.amount;
    }

    const balance = totalIncome - totalExpense

    document.getElementById("total-income").textContent = fmtAmount(totalIncome,settings);
    document.getElementById("total-expense").textContent = fmtAmount(totalExpense, settings);
    document.getElementById("balance").textContent = fmtAmount(balance, settings);


    //Calculate financial statistics for the user (show data analysis)
    const expenses = records.filter(r => r.type === "expense")

    const totalsByCategory = expenses.reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + r.amount;
        return acc;
    }, {});
    const topCategory = Object.keys(totalsByCategory).length
        ? Object.entries(totalsByCategory).sort((a, b) => b[1] - a [1])[0][0]
        : "-";

    const avgExpense = expenses.length
        ? expenses.reduce((sum, r) => sum + r.amount, 0) / expenses.length
        : 0

    const elTop = document.getElementById("stat-top-category")
    const elAvg = document.getElementById("stat-ave-expense");
    if (elTop) elTop.textContent = topCategory;
    if (elAvg) elAvg.textContent = fmtAmount(avgExpense, settings);

    const elTotal = document.getElementById("stat-total-records");
    if (elTotal) elTotal.textContent = String(records.length);

    const cap = Number(settings?.cap || 0);
    let capMsg = "No cap amount set";
    let live = "polite";

    if (cap > 0) {
        if (totalExpense <= cap) {
            capMsg = `There is ${fmtAmount(cap - totalExpense, settings)} remaining until your cap is reached`;
        } else {
            capMsg = `You have surpassed your Cap Amount by ${fmtAmount(totalExpense - cap, settings)} `
            live = "assertive";
        }
    }
    const elCap = document.getElementById("stat-cap-status")
    if (elCap) {
        elCap.textContent = capMsg;
        elCap.setAttribute("aria-live", live);
    }

    //The trend of expenses in the last seven days
    const trendEl = document.getElementById("trend");
    if (trendEl) {
        trendEl.innerHTML = "";
        const today = new Date();
        const Stats7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dayStr = d.toISOString().slice(0, 10); // format: YYYY-MM-DD
            Stats7Days.push(dayStr);
        }

        const dailyTotals = Stats7Days.map(day => {
            let total = 0;
            for (const r of expenses) {
                if (r.date === day) total += Number(r.amount || 0);
            }
            return { day, total };
        });

        const maxTotal = Math.max(1, ...dailyTotals.map(d => d.total));

        for (const item of dailyTotals) {
            const bar = document.createElement("div");
            bar.className = "bar";

            const heightPercent = (item.total / maxTotal) * 100;
            bar.style.height = heightPercent + "%";

            bar.title = `${item.day}: ${fmtAmount(item.total, settings)}`;
            bar.setAttribute("aria-label", `${item.day}: ${fmtAmount(item.total, settings)}`);

            trendEl.appendChild(bar);
        }
    }
}


// Formate the Date for user-inteface
        function formatDate(dateStr) {
            return (typeof dateStr === "string" && dateStr.trim()) ? dateStr : "—";
        }


        function getTbody() {
            return document.getElementById("record-list");
        }

// Allows clearing of all rows in finance record table
        function clearTable() {
            const tbody = getTbody();
            if (tbody) tbody.innerHTML = "";
        }


        function showEmptyRow(message = "No financial records yet.") {
            const tbody = getTbody();
            if (!tbody) return;
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.colSpan = 5;
            td.textContent = message;
            td.style.textAlign = "center";
            tr.appendChild(td)
            tbody.appendChild(tr);
        }

        //Escape Origninal text before injecting <mark> into innerHTML
function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

//Highlights matching data from user's regex check
        function highlightMatches(text, re) {
            if (!re || typeof text !== "string") return escapeHTML(text ?? "");
            const gRe = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
            const s = String(text);

            let out = ""
            let last = 0;
            let m;
            gRe.lastIndex = 0;

            while ((m = gRe.exec(s))) {
                const start = m.index;
                const match = m[0];

                //Prevent an infinite loop in case of a zero-length match
                if (match === "") {
                    out += escapeHTML(s.slice(last, start + 1));
                    last = start + 1;
                    gRe.lastIndex = last;
                    if (last >= s.length) break; // nothing more to match
                    continue;
                }

                out += escapeHTML(s.slice(last, start ));
                out += `<mark>${escapeHTML(match)}</mark>`;
                last = start + match.length;
            }
            out += escapeHTML(s.slice(last));
            return out;
        }


// Structures the table rows for the Financial records table
        export function renderRecords(records,settings, highlightRe = null) {
            const tbody = getTbody();
            if (!tbody) return;

            clearTable();

            if (!Array.isArray(records) || records.length === 0) {
                showEmptyRow();
                return;
            }

            for (const r of records) {
                const tr = document.createElement("tr");
                tr.dataset.id = r.id || ""

                const tdDesc = document.createElement("td");
                if (highlightRe) {
                    tdDesc.innerHTML = highlightMatches(r.description ?? "", highlightRe);
                } else {
                    tdDesc.textContent = r.description ?? "";
                }

                const tdAmount = document.createElement("td");
                tdAmount.textContent = fmtAmount(r.amount, settings);

                const tdType = document.createElement("td");
                tdType.textContent = r.type ?? "";

                const tdDate = document.createElement("td");
                tdDate.textContent = formatDate(r.date);

                const tdAction = document.createElement("td");

                //Allows the user to edit or delete their financial record
                const btnEdit = document.createElement("button");
                btnEdit.type = "button";
                btnEdit.textContent = "Edit"
                btnEdit.dataset.id = r.id || "";
                btnEdit.setAttribute("aria-label", `Edit ${r.description ?? "record"}`);
                btnEdit.className = "btn-edit";

                const btnDelete = document.createElement("button");
                btnDelete.type = "button";
                btnDelete.textContent = "Delete"
                btnDelete.dataset.id = r.id || "";
                btnDelete.setAttribute("aria-label", `Delete ${r.description ?? "record"}`);
                btnDelete.className = "btn-delete";

                // Organise the edit and delete bUttons
                tdAction.style.display = "flex";
                tdAction.style.gap = "8px";
                tdAction.append(btnEdit, btnDelete);

                // Organise the table row for the finance record table
                tr.append(tdDesc, tdAmount, tdType, tdDate, tdAction);
                tbody.appendChild(tr);
            }
        }

// Used by main.js every time there is a change
        export function renderAll(records, settings, highlightRe = null) {
            updateDashboard(records, settings);
            renderRecords(records,settings, highlightRe);
        }