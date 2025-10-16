// Wait for the page to load
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("finance-form");
    const recordList = document.getElementById("record-list");

    const totalIncomeEl = document.getElementById("total-income");
    const totalExpenseEl = document.getElementById("total-expense");
    const balanceEl = document.getElementById("balance");

    let records = [];

    // Keep all totals up to date
    function updateDashboard() {
        let totalIncome = 0;
        let totalExpense = 0;

        records.forEach(record => {
            if (record.type === "income") {
                totalIncome += record.amount;
            } else {
                totalExpense += record.amount;
            }
        });

        const balance = totalIncome - totalExpense;

        totalIncomeEl.textContent = totalIncome.toLocaleString() + " RWF";
        totalExpenseEl.textContent = totalExpense.toLocaleString() + " RWF";
        balanceEl.textContent = balance.toLocaleString() + " RWF";
    }

    // Render all records
    function renderRecords() {
        recordList.innerHTML = "";

        records.forEach((record, index) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${record.description}</td>
                <td>${record.amount.toLocaleString()} RWF</td>
                <td>${record.type.charAt(0).toUpperCase() + record.type.slice(1)}</td>
                <td>${record.date}</td>
                <td><button class="delete-btn" data-index="${index}">Delete</button></td>
            `;

            recordList.appendChild(row);
        });

        // Delete records from table
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                const index = e.target.getAttribute("data-index");
                records.splice(index, 1);
                renderRecords();
                updateDashboard();
            });
        });
    }

    // Handle form submission
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const description = document.getElementById("description").value.trim();
        const amount = parseFloat(document.getElementById("amount").value);
        const type = document.getElementById("type").value;
        const date = document.getElementById("date").value;

        if (!description || !amount || !type || !date) {
            alert("Please fill in all fields!");
            return;
        }

        const newRecord = { description, amount, type, date };
        records.push(newRecord);

        // Clear form
        form.reset();

        // Update display
        renderRecords();
        updateDashboard();
    });
});