// ui.js
export function fmtAmount(n) {
    return Number(n || 0).toLocaleString() + " RWF";
}

export function updateDashboard(records, settings) {
    let totalIncome = 0;
    let totalExpense = 0;

    records.forEach(record => {
        if (record.type === "income") totalIncome += record.amount;
        else totalExpense += record.amount;
    });

    const balance = totalIncome - totalExpense;

    document.getElementById("total-income").textContent = fmtAmount(totalIncome);
    document.getElementById("total-expense").textContent = fmtAmount(totalExpense);
    document.getElementById("balance").textContent = fmtAmount(balance);


    //Calculate stats for user feedback
    const expenses = records.filter(r => r.type === "expense")
    const top = expenses.length ? Math.max(...expenses.map(r => r.amount)) : 0;
    const avg = expenses.length
        ? expenses.reduce((a, b) => a + b.amount, 0) / expenses.length
        : 0;

    const cap = settings.cap || 0;
    const capStatus = cap
        ? balance >= 0
            ? `${fmtAmount(cap - totalExpense)} remaining`
            : `Cap exceeded by ${fmtAmount(Math.abs(totalExpense - cap))}`
        : "No cap set";

    const statTop = document.getElementById("stat-top-expense");
    const statAvg = document.getElementById("stat-avg-expense");
    const statCap = document.getElementById("stat-cap-status");

    if (statTop) statTop.textContent = `Top Expense: ${fmtAmount(top)}`
    if (statAvg) statAvg.textContent = `Average Expense: ${fmtAmount(avg)}`;
    if (statCap) statCap.textContent = `Cap Status: ${capStatus}`;

}