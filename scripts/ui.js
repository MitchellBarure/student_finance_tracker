// ui.js

//Convert all numerical amounts into string + "RWF"
export function fmtAmount(n) {
    return Number(n || 0).toLocaleString() + " RWF";
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

    document.getElementById("total-income").textContent = fmtAmount(totalIncome);
    document.getElementById("total-expense").textContent = fmtAmount(totalExpense);
    document.getElementById("balance").textContent = fmtAmount(balance);


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
    if (elAvg) elAvg.textContent = fmtAmount(avgExpense);

    const cap = Number(settings?.cap || 0);
    let capMsg = "No cap amount set";
    let live = "polite";

    if (cap > 0) {
        if (totalExpense <= cap) {
            capMsg = `There is ${fmtAmount(cap - totalExpense)} remaining until your cap is reached`;
        } else {
            capMsg = `You have surpassed your Cap Amount by ${fmtAmount(totalExpense - cap)} `
            live = "assertive";
        }
    }
    const elCap = document.getElementById("stat-cap-status")
    if (elCap) {
        elCap.textContent = capMsg;
        elCap.setAttribute("aria-live", live);
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

//Highlights matching data from user's regex check
        function highlightMatches(text, re) {
            if (!re || typeof text !== "string") return text ?? "";
            return text.replace(re, (m) => `<mark>${m}</mark>`);
        }

// Structures the table rows for the Financial records table
        export function renderRecords(records, highlightRe = null) {
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
                tdAmount.textContent = fmtAmount(r.amount);

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
            renderRecords(records, highlightRe);
        }