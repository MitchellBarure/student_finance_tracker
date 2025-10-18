// storage.js
import {validators, normalizeDescription} from "./validators.js";

export const STORAGE_KEY = "sft:records";
export const SETTINGS_KEY = "sft:settings";

// Validation helpers to validate all data
export function validateRecords(data) {
    if (!Array.isArray(data)) return [];

    return data.filter(item => {
        if (!item || typeof item !== "object") return false;

        const description = normalizeDescription(item.description ?? "");
        const amount = String(item.amount ?? "");
        const category = String(item.category ?? "");
        const date = String(item.date ?? "");
        const type = String(item.type ?? "");

        //Use Regex rules for validation
        const validDescription = validators.reDescripNoEdge.test(description);
        const validAmount = validators.reAmount.test(amount);
        const validCategory = validators.reCategory.test(category);
        const validDate = validators.reDate.test(date);
        const validType = type === "income" || type === "expense";

        return validDescription && validAmount && validCategory && validDate && validType;

    })
}

// Load saved/seed data from localStorage to put in Dashboard
export async function loadRecords() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return validateRecords(parsed);
        }

        // Make use of seed data in seed.json if no data is submitted
        const response = await fetch("./seed.json");
        const seedData = await response.json();
        const validSeed = validateRecords(seedData);
        saveRecords(validSeed);
        return validSeed;
    } catch {
        return [];
    }
}

// Ensure user's financial records are stored and not lost even after tab is closed
export function saveRecords(records) {
    try {
        const validRecords = validateRecords(records);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validRecords));
} catch {
    }
}

// Allows exporting of financialrecords as a JSON string
export function exportRecords() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const data = saved ? validateRecords(JSON.parse(saved)) : [];
        return JSON.stringify(data, null, 2);
    } catch {
        return "[]:";
    }
}

//ALLOWS importing of financial ecords from a JSON String
export function importFromJSON(text) {
    try {
        const parsed = JSON.parse(text);
        const valid = validateRecords(parsed);
        saveRecords(valid);
        return {ok: true, data: valid};
    } catch (err) {
        return {ok: false, error: err?.message || "Invalid data" };
    }
}

export const defaultSettings = {
    cap: 0,
    rates: { USD: 0, EUR: 0 },
    display: "RWF"
};

export function loadSettings() {
    try {
        const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") ;
        return {
            ...defaultSettings,
            ...raw,
            rates: {...defaultSettings.rates, ...(raw?.rates || {}) },
        };
    } catch {
        return { ...defaultSettings};
    }
}

export function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}