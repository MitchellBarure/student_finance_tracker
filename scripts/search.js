// search.js
export function compileRegex(input, flags) {
    try {
        if (!input) return null;
        const f = (flags || "") + (flags?.includes("g") ? "" : "g");
        return new RegExp(input, f);
    } catch {
        return null;
    }
}

export function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[c]);
}

export function highlight(text, re) {
    if (!re) return escapeHtml(text);
    return escapeHtml(text).replace(re, m => `<mark>${m}</mark>`);
}