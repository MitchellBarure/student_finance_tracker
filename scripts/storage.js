// storage.js
export const STORAGE_KEY = "sft:records";
export const SETTINGS_KEY = "sft:settings";

export function loadRecords() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

export function saveRecords(records) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export const defaultSettings = {
    cap: 0,
    rates: { USD: 0, EUR: 0 },
    display: "RWF"
};

export function loadSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || defaultSettings;
    } catch {
        return defaultSettings;
    }
}

export function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}