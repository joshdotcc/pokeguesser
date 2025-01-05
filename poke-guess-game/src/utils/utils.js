// Formats autocomplete name to show what aspects match the user guess
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