// validators.js
export const validators = {
    reDescNoEdge: /^\S(?:.*\S)?$/,
    reAmount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    reDate: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    reDupWord: /\b(\w+)\s+\1\b/i
};