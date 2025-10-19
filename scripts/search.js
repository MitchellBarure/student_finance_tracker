// search.js
import {compileRegex} from "./validators.js";

//Apply the regex pattern rules and searches for matches
export function buildSearchRegex(query, caseInsensitive =true) {
    const q = String(query || "").trim();
    if (!q) return null;
    const flags = caseInsensitive ? "i" : "";
    return compileRegex(q, flags);
}

//Keep all the financial records that are a match
export function searchRecords(records, query, caseInsensitive = true) {
    const re =buildSearchRegex(query, caseInsensitive);
    if (query && !re) {
        return {
            filtered: records,
            highlightRe: null,
            error: "The regex pattern is invalid!"
        };
    }
    if (!re) {
        return {filtered: records, highlightRe: null, error: null};
    }

    const filtered = records.filter(r => {
        const desc = String(r.description || "");
        const cat = String(r.category || "");
        return re.test(desc) || re.test(cat);
    });

    return { filtered, highlightRe: re, error: null };
}

