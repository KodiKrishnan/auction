export const isRequired = (value) =>
    value !== undefined && value !== null && String(value).trim() !== "";

export const isEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

export const isPhone = (value) => {
    const digits = String(value).replace(/\D/g, "");
    return /^\d{10}$/.test(digits);
};

export const minLength = (min) => (value) =>
    String(value || "").trim().length >= min;

export const maxLength = (max) => (value) =>
    String(value || "").trim().length <= max;

export const isNumber = (value) =>
    !isNaN(value) && value !== "";

export const minValue = (min) => (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min;
};

export const maxValue = (max) => (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num <= max;
};


export const isLatitude = (value) => {
    // If empty, return true so isRequired handles the error, 
    // otherwise validate the range
    if (value === "" || value === null || value === undefined) return true;
    const num = parseFloat(value);
    return !isNaN(num) && num >= -90 && num <= 90;
};

export const isLongitude = (value) => {
    if (value === "" || value === null || value === undefined) return true;
    const num = parseFloat(value);
    return !isNaN(num) && num >= -180 && num <= 180;
};

export const isNonEmptyArray = (value) =>
    Array.isArray(value) && value.length > 0;


// --- RICH TEXT RULES (Specifically for React Quill) ---

// Helper: Safely extracts plain text from HTML strings
const extractPlainText = (value) => {
    if (!value) return "";
    if (String(value).includes('<') && String(value).includes('>')) {
        const doc = new DOMParser().parseFromString(value, 'text/html');
        return doc.body.textContent || "";
    }
    return String(value);
};

export const minVisibleCharacters = (min) => (value) => {
    const plainText = extractPlainText(value);
    return plainText.trim().length >= min;
};

export const maxVisibleCharacters = (max) => (value) => {
    if (!value) return true;
    const plainText = extractPlainText(value);
    return plainText.trim().length <= max;
};



export const isAdult = (value) => {

    if (!value) return false;

    const today = new Date();

    const birthDate = new Date(value);

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference =
        today.getMonth() - birthDate.getMonth();

    if (
        monthDifference < 0 ||
        (
            monthDifference === 0 &&
            today.getDate() < birthDate.getDate()
        )
    ) {
        age--;
    }

    return age >= 18;
};



export const isValidNameChars = (value) => {
    if (!value) return true; 
    // CHANGE THE LINE BELOW
    return /^[a-zA-Z0-9\s]+$/.test(String(value));
};


export const isRoundFigure = (value) => {
    if (!value) return true;
    const num = Number(value);
    return !isNaN(num) && Number.isInteger(num);
};