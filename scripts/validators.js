// validators.js

// Clean up the description before it is validated by regex
export function normalizeDescription(s) {
    return String(s || '').trim().replace(/\s+/g, ' ');
}

// Regex Patterns for user input sanitization
export const validators = {
    reDescripNoEdge: /^\S(?:.*\S)?$/,
    reAmount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    reDate: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    reDupWord: /\b(\w+)\s+\1\b/i,
    reCategory: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/
};

// Regex compiler for user REgex search
export function compileRegex(input, flags = 'i') {
    try {
        return input ? new RegExp(input, flags) : null;
    } catch {
        return null;
    }
}

