// Escaping the input string to ensure everything is interpreted literally preventing XSS
export function escapeHTML(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Highlignts the users guess properly by slicing the string (also supports the guess being a string contained in a pokemon name)
export function getHighlightedName(name, query) {
    name = escapeHTML(name.charAt(0).toUpperCase() + name.slice(1));
    const lowerName = name.toLowerCase();
    const lowerQuery = escapeHTML(query.toLowerCase());
    const index = lowerName.indexOf(lowerQuery);

    if (index === -1) return name;
    return (
        name.slice(0, index) +
        "<strong>" +
        name.slice(index, index + lowerQuery.length) +
        "</strong>" +
        name.slice(index + lowerQuery.length)
    );
}

// Trim and sanitize the input
export function sanitizeInput(input) {
    // Ensure input is a string to avoid unexpected behavior.
    if (typeof input !== "string") {
        console.warn("sanitizeInput received non-string input.");
        return "";
    }

    return input
        .normalize("NFD") // Normalize Unicode to decompose combined characters
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritic marks (e.g., accents)
        .replace(/[^a-zA-Z0-9\s-]/g, "") // Allow only alphanumeric characters, spaces, and dashes
        .replace(/\s+/g, " ") // Replace multiple spaces with a single space
        .trim(); // Remove leading/trailing spaces
}