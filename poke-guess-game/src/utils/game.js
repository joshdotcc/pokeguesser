import { convertRomanToArabic } from './api.js';

// Evaluates the user's guess and provide feedback
export function processGuess(pokemonName, pokemonInfo, randomPokemonInfo) {
    if (!randomPokemonInfo) {
        console.error("Random Pokémon info is not available yet.");
        return;
    }

    const capitalizedPokemonName = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);

    const guessInfo = {
        pokemonName: capitalizedPokemonName,
        spriteUrl: pokemonInfo[pokemonName]?.spriteUrl,
        generation: getFeedback("generation", pokemonInfo[pokemonName], randomPokemonInfo),
        type1: getFeedback("type1", pokemonInfo[pokemonName], randomPokemonInfo),
        type2: getFeedback("type2", pokemonInfo[pokemonName], randomPokemonInfo),
        height: getFeedback("height", pokemonInfo[pokemonName], randomPokemonInfo),
        weight: getFeedback("weight", pokemonInfo[pokemonName], randomPokemonInfo),
        randomPokemonName: randomPokemonInfo.name,
    };

    return guessInfo;
}

// Gives specific user feedback
function getFeedback(type, guessInfo, targetInfo) {
    if (!guessInfo || !targetInfo) {
        console.error(`Missing Pokémon info for guess or target`);
        return 'No Data';
    }

    if (type === "generation") {
        return convertRomanToArabic(guessInfo.generation) === convertRomanToArabic(targetInfo.generation)
            ? `<span>${guessInfo.generation}</span> <span class='correct'>Correct</span>`
            : guessInfo.generation < targetInfo.generation
                ? `<span>${guessInfo.generation}</span> <span class='incorrect'>Higher</span>`
                : `<span>${guessInfo.generation}</span> <span class='incorrect'>Lower</span>`;
    } else if (type === "type1" || type === "type2") {
        const typeIndex = type === "type1" ? 0 : 1;
        const guessType = guessInfo.types[typeIndex];
        const targetTypes = targetInfo.types;

        if (typeIndex === 1 && !guessType) {
            return targetTypes[1]
                ? `<span>No Type</span> <span class='incorrect'>Incorrect</span>`
                : `<span>No Type</span> <span class='correct'>Correct</span>`;
        }

        return targetTypes.includes(guessType)
            ? `<span class="type-badge type-${guessType.toLowerCase()}">${guessType}</span> <span class='correct'>Correct</span>`
            : `<span class="type-badge type-${guessType.toLowerCase()}">${guessType}</span> <span class='incorrect'>Incorrect</span>`;
    } else if (type === "height") {
        return guessInfo.height === targetInfo.height
            ? `<span>${guessInfo.height}</span> <span class='correct'>Correct</span>`
            : guessInfo.height < targetInfo.height
                ? `<span>${guessInfo.height}</span> <span class='incorrect'>Higher</span>`
                : `<span>${guessInfo.height}</span> <span class='incorrect'>Lower</span>`;
    } else if (type === "weight") {
        return guessInfo.weight === targetInfo.weight
            ? `<span>${guessInfo.weight}</span> <span class='correct'>Correct</span>`
            : guessInfo.weight < targetInfo.weight
                ? `<span>${guessInfo.weight}</span> <span class='incorrect'>Higher</span>`
                : `<span>${guessInfo.weight}</span> <span class='incorrect'>Lower</span>`;
    }
}