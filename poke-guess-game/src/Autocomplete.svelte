<script>
import {
    onMount
} from "svelte";
import {
    createEventDispatcher
} from "svelte";

let searchQuery = ''; // The query the user types in
let pokemonList = []; // Initialize pokemonList as an empty array
let filteredPokemon = []; // Array to hold filtered Pokémon based on search query
let pokemonInfo = {}; // Object to hold fetched Pokémon info for each Pokémon
let guesses = []; // Array to store the user's guesses
let remainingGuesses = 5; // Number of remaining guesses
let showModal = false; // Whether the modal is visible
let modalTitle = ""; // Title for the modal
let modalMessage = ""; // Message for the modal

const dispatch = createEventDispatcher(); // Dispatcher to send data to parent

let randomPokemon = ""; // Store the randomly selected Pokémon
let randomPokemonInfo = {}; // Store info of the randomly selected Pokémon

// Fetch Pokémon data from PokeAPI when the component mounts
onMount(async () => {
    const allPokemonData = await fetch("https://pokeapi.co/api/v2/pokemon?limit=493");
    const pokemonData = await allPokemonData.json();

    // Store the first 493 Pokémon
    pokemonList = pokemonData.results.map(p => p.name);

    // Select a random Pokémon
    randomPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)];
    await fetchRandomPokemonInfo(randomPokemon);
});

// Function to fetch and return Pokémon info
function getPokemonInfo(pokemonName) {
    if (pokemonInfo[pokemonName]) {
        return pokemonInfo;
    }
    fetchPokemonData(pokemonName);
    return null;
}

// Helper function to convert Roman numeral to Arabic numeral
function convertRomanToArabic(roman) {
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

// Map Pokémon types to their respective colors
const typeColors = {
    normal: "#A8A77A",
    fire: "#EE8130",
    water: "#6390F0",
    electric: "#F7D02C",
    grass: "#7AC74C",
    ice: "#96D9D6",
    fighting: "#C22E28",
    poison: "#A33EA1",
    ground: "#E2BF65",
    flying: "#A98FF3",
    psychic: "#F95587",
    bug: "#A6B91A",
    rock: "#B6A136",
    ghost: "#735797",
    dragon: "#6F35FC",
    dark: "#705746",
    steel: "#B7B7CE",
    fairy: "#D685AD"
};

// Helper function to fetch Pokémon data
async function fetchPokemonData(pokemonName) {
    try {
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        const pokemonData = await pokemonResponse.json();

        const types = pokemonData.types.map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)); // Capitalize each type
        const height = pokemonData.height / 10; // Convert height to meters
        const weight = pokemonData.weight / 10; // Convert weight to kg

        const speciesResponse = await fetch(pokemonData.species.url);
        const speciesData = await speciesResponse.json();
        const generation = convertRomanToArabic(speciesData.generation.name); // Convert Roman numeral to Arabic numeral

        const spriteUrl = pokemonData.sprites.front_default;

        pokemonInfo[pokemonName] = {
            types,
            height,
            weight,
            generation,
            spriteUrl,
        };
    } catch (error) {
        console.error("Error fetching Pokémon info:", error);
        pokemonInfo[pokemonName] = null;
    }
}

// Fetch the data of the randomly selected Pokémon
async function fetchRandomPokemonInfo(pokemonName) {
    const randomPokemonData = await fetchPokemonData(pokemonName);
    randomPokemonInfo = pokemonInfo[pokemonName]; // Update the randomPokemonInfo with the fetched data
}

// Function to filter Pokémon list based on search query
$: filteredPokemon = pokemonList
    .filter(pokemon =>
        pokemon.toLowerCase().startsWith(searchQuery.toLowerCase())
    )
    .slice(0, 5); // Limit to 5 results

// Trigger search and info fetch automatically as the user types
async function onInput(event) {
    const unsafeInput = event.target.value;

    // Trim the input and sanitize by removing unwanted characters
    searchQuery = unsafeInput.trim().replace(/[^a-zA-Z0-9\s-]/g, "");

    if (searchQuery && filteredPokemon.length) {
        let i = 0;
        while (i < filteredPokemon.length) {
            await getPokemonInfo(filteredPokemon[i]);
            i++;
        }
    }
}

// Works to prevent malicious code execution, replaces <>&
function escapeHTML(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Function to highlight the part of the name that matches the query
function getHighlightedName(name, query) {
    name = escapeHTML(String(name).charAt(0).toUpperCase() + String(name).slice(1));
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

// Function to handle suggestion click
function handleSuggestionClick(pokemonName) {
    if (remainingGuesses <= 0 || showModal) {
        return; // Prevent further actions if the game is over or the modal is open
    }

    searchQuery = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);

    if (randomPokemonInfo) {
        const guessInfo = processGuess(pokemonName);
        guesses = [...guesses, guessInfo];
        remainingGuesses--;

        if (pokemonName.toLowerCase() === randomPokemon.toLowerCase()) {
            handleWin();
        } else if (remainingGuesses === 0) {
            handleLoss();
        }
    }

    dispatch('guessSelected', pokemonName);

    // Clear input and suggestions
    searchQuery = ""; // Reset the input field
    filteredPokemon = []; // Clear the suggestions list
}

function handleWin() {
    showModal = true;
    modalTitle = "Congratulations! You Win!";
    modalMessage = `The correct Pokémon was ${randomPokemon.charAt(0).toUpperCase() + randomPokemon.slice(1)}!`;
}

function handleLoss() {
    showModal = true;
    modalTitle = "Sorry! Better Luck Next Time!";
    modalMessage = `The Pokémon was ${randomPokemon.charAt(0).toUpperCase() + randomPokemon.slice(1)}.`;
}

// Function to process the guess and provide feedback
// Function to process the guess and provide feedback
function processGuess(pokemonName) {
    if (!randomPokemonInfo) {
        console.error("Random Pokémon info is not available yet.");
        return;
    }

    // Capitalize the Pokémon name
    const capitalizedPokemonName = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);

    const guessInfo = {
        pokemonName: capitalizedPokemonName,
        spriteUrl: pokemonInfo[pokemonName] ? .spriteUrl, // Include the sprite URL
        generation: getFeedback("generation", pokemonName),
        type1: getFeedback("type1", pokemonName),
        type2: getFeedback("type2", pokemonName),
        height: getFeedback("height", pokemonName),
        weight: getFeedback("weight", pokemonName),
        randomPokemonName: randomPokemon // Store the random Pokémon's name
    };

    return guessInfo;
}

// Function to provide feedback based on the guess
function getFeedback(type, pokemonName) {
    const guessInfo = pokemonInfo[pokemonName];
    const targetInfo = randomPokemonInfo;

    if (!guessInfo || !targetInfo) {
        console.error(`Missing Pokémon info for ${pokemonName} or randomPokemon`);
        return 'No Data';
    }

    if (type === "generation") {
        return convertRomanToArabic(guessInfo.generation) === convertRomanToArabic(targetInfo.generation) ?
            `<span>${guessInfo.generation}</span> <span class='correct'>Correct</span>` :
            guessInfo.generation < targetInfo.generation ?
            `<span>${guessInfo.generation}</span> <span class='incorrect'>Higher</span>` :
            `<span>${guessInfo.generation}</span> <span class='incorrect'>Lower</span>`;
    } else if (type === "type1" || type === "type2") {
        const typeIndex = type === "type1" ? 0 : 1;
        const guessType = guessInfo.types[typeIndex];
        const targetTypes = targetInfo.types;

        if (typeIndex === 1) { // Handling for type2 specifically
            if (!guessType) {
                // If the guess lacks a type2, check if the target also lacks it
                return targetTypes[1] ?
                    `<span>No Type</span> <span class='incorrect'>Incorrect</span>` // Target has a type2
                    :
                    `<span>No Type</span> <span class='correct'>Correct</span>`; // Both lack type2
            }
        }

        // General type match logic
        const isCorrect = targetTypes.includes(guessType);
        return isCorrect ?
            `<span class="type-badge type-${guessType.toLowerCase()}">${guessType}</span> <span class='correct'>Correct</span>` :
            `<span class="type-badge type-${guessType.toLowerCase()}">${guessType}</span> <span class='incorrect'>Incorrect</span>`;
    } else if (type === "height") {
        return guessInfo.height === targetInfo.height ?
            `<span>${guessInfo.height}</span> <span class='correct'>Correct</span>` :
            guessInfo.height < targetInfo.height ?
            `<span>${guessInfo.height}</span> <span class='incorrect'>Higher</span>` :
            `<span>${guessInfo.height}</span> <span class='incorrect'>Lower</span>`;
    } else if (type === "weight") {
        return guessInfo.weight === targetInfo.weight ?
            `<span>${guessInfo.weight}</span> <span class='correct'>Correct</span>` :
            guessInfo.weight < targetInfo.weight ?
            `<span>${guessInfo.weight}</span> <span class='incorrect'>Higher</span>` :
            `<span>${guessInfo.weight}</span> <span class='incorrect'>Lower</span>`;
    }
}
</script>

{#if showModal}
<div class="modal-overlay">
    <div class="modal">
        <h2>{modalTitle}</h2>
        <p>{modalMessage}</p>
        <img src={randomPokemonInfo?.spriteUrl} alt="{randomPokemon}" class="random-pokemon-sprite" />
        <ul>
            <li><strong>Type(s):</strong> {#each randomPokemonInfo?.types as type}<span class="type-badge type-{type.toLowerCase()}">{type}</span>{/each}</li>
            <li><strong>Height:</strong> {randomPokemonInfo?.height} m</li>
            <li><strong>Weight:</strong> {randomPokemonInfo?.weight} kg</li>
            <li><strong>Generation:</strong> {randomPokemonInfo?.generation}</li>
        </ul>
        <button  onclick="location.reload()">Play Again</button>
    </div>
</div>
{/if}

<div class="top-bar">
    <span class="remaining-guesses">Guesses Remaining: {remainingGuesses}</span>
</div>
<h1>Pokémon Guessing Game (Gen 1-4)</h1>
<div class="mobile-flip">
    <div class="container-lg">
        <h3>Your Guesses</h3>
        <div class="guesses">
            {#each guesses as guess, index}
            <div class="guess">
                <p><strong>Guess {index + 1}:</strong> {guess.pokemonName}</p>
                {#if guess.spriteUrl}
                <img src={guess.spriteUrl} alt="{guess.pokemonName}" class="guess-sprite" />
                {/if}
                <ul>
                    <li>Generation: {@html guess.generation}</li>
                    <li>Type 1: {@html guess.type1}</li>
                    <li>Type 2: {@html guess.type2}</li>
                    <li>Height: {@html guess.height}</li>
                    <li>Weight: {@html guess.weight}</li>
                </ul>
            </div>
            {/each}
        </div>
    </div>

    <div class="container">

        <!-- Search input and suggestions list -->
        <input
            type="text"
            autocorrect="off"
            autocomplete="off"
            bind:value={searchQuery}
            placeholder="Type a Pokémon name..."
            on:input={onInput}
            class="search-input"
            />

        {#if searchQuery}
        <ul class="suggestions-list">
            {#each filteredPokemon as pokemon}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <li class="suggestion-item" on:click={() => handleSuggestionClick(pokemon)}>
                <div class="pokemon-info">
                    {#if pokemonInfo[pokemon]}
                    <div class='pokemon-main-details'>
                        <div class="pokemon-name">
                            {@html getHighlightedName(pokemon, searchQuery)}
                        </div>
                        <img src={pokemonInfo[pokemon].spriteUrl} alt="{pokemon}" class="sprite" />
                    </div>
                    <div class="info">
                        <p><strong>Type(s):</strong>
                            {#each pokemonInfo[pokemon].types as type}
                            <span class="type-badge type-{type.toLowerCase()}">{type}</span>
                            {/each}
                        </p>
                        <p><strong>Height:</strong> {pokemonInfo[pokemon].height} m</p>
                        <p><strong>Weight:</strong> {pokemonInfo[pokemon].weight} kg</p>
                        <p><strong>Generation:</strong> {pokemonInfo[pokemon].generation}</p>
                    </div>
                    {/if}
                </div>
            </li>
            {/each}
        </ul>
        {/if}
    </div>
</div>
