// Fetches first 493 Pokemon info from the API
export async function fetchAllPokemon() {
    const allPokemonData = await fetch("https://pokeapi.co/api/v2/pokemon?limit=493");
    const pokemonData = await allPokemonData.json();
    return pokemonData.results.map((p) => p.name); // Return an array of Pokémon names
}

//Fetches detailed Pokemon information given its name
export async function fetchPokemonData(pokemonName) {
    try {
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        const pokemonData = await pokemonResponse.json();

        const types = pokemonData.types.map((t) =>
            t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)
        ); // Capitalize each type
        const height = pokemonData.height / 10; // Convert height to meters
        const weight = pokemonData.weight / 10; // Convert weight to kg

        const speciesResponse = await fetch(pokemonData.species.url);
        const speciesData = await speciesResponse.json();
        const generation = convertRomanToArabic(speciesData.generation.name); // Convert Roman numeral to Arabic numeral

        const spriteUrl = pokemonData.sprites.front_default;

        return {
            types,
            height,
            weight,
            generation,
            spriteUrl,
        };
    } catch (error) {
        console.error("Error fetching Pokémon info:", error);
        return null;
    }
}

// Converts Generation to a numeric value
export function convertRomanToArabic(roman) {
    const romanToArabic = {
        "generation-i": 1,
        "generation-ii": 2,
        "generation-iii": 3,
        "generation-iv": 4,
        "generation-v": 5,
        "generation-vi": 6,
        "generation-vii": 7,
        "generation-viii": 8,
        "generation-ix": 9,
    };

    return romanToArabic[roman] || roman; // Default to the original if not found
}