<script>
  import Modal from './components/Modal.svelte';
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";

  // Import API, utility, and game functions
  import { fetchAllPokemon, fetchPokemonData } from './utils/api.js';
  import { processGuess } from './utils/game.js';
  import {escapeHTML, getHighlightedName } from './utils/utils.js';

  // Game state and variables
  let searchQuery = '';
  let pokemonList = [];
  let filteredPokemon = [];
  let pokemonInfo = {};
  let guesses = [];
  let remainingGuesses = 5;
  let showModal = false;
  let modalTitle = "";
  let modalMessage = "";
  let randomPokemon = "";
  let randomPokemonInfo = {};

  const dispatch = createEventDispatcher();


  // Fetch Pokemon data when the app initializes
  onMount(async () => {
    pokemonList = await fetchAllPokemon(); // Fetch full Pokémon list
    randomPokemon = selectRandomPokemon(); // Pick a random Pokémon
    await fetchRandomPokemonInfo(randomPokemon); // Fetch info for the random Pokémon
  });

  // Select a random Pokemon name from the list
  function selectRandomPokemon() {
    return pokemonList[Math.floor(Math.random() * pokemonList.length)];
  }

  // Fetch and store information for the random Pokemon
  async function fetchRandomPokemonInfo(pokemonName) {
    randomPokemonInfo = pokemonInfo[pokemonName] = await fetchPokemonData(pokemonName);
  }

  // Fetch and store Pokemon info if not already cached
  async function fetchPokemonDataForCache(pokemonName) {
    pokemonInfo[pokemonName] = await fetchPokemonData(pokemonName);
  }

  // Filter the Pokemon list based on the search query
  $: filteredPokemon = pokemonList
          .filter((pokemon) => pokemon.toLowerCase().startsWith(searchQuery.toLowerCase()))
          .slice(0, 5); // Show only top 5 results

  // Triggered on user input in the search field
  async function onInput(event) {
    const input = event.target.value;

    // Trim and sanitize the input
    searchQuery = input.trim().replace(/[^a-zA-Z0-9\s-]/g, "");

    // Preload Pokemon info for the filtered Pokémon list
    if (searchQuery && filteredPokemon.length) {
      for (const pokemon of filteredPokemon) {
        if (!pokemonInfo[pokemon]) {
          await fetchPokemonDataForCache(pokemon);
        }
      }
    }
  }

  // Highlight matching part of the Pokemon name and handle guessing logic
  function handleSuggestionClick(pokemonName) {
    if (remainingGuesses <= 0 || showModal) {
      return; // Game is over or modal is open
    }

    // Update the search query to match the selected suggestion
    searchQuery = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);

    // Process the player's guess
    if (randomPokemonInfo) {
      const guessInfo = processGuess(pokemonName, pokemonInfo, randomPokemonInfo);
      guesses = [...guesses, guessInfo];
      remainingGuesses--;

      if (pokemonName.toLowerCase() === randomPokemon.toLowerCase()) {
        showWinModal();
      } else if (remainingGuesses === 0) {
        showLossModal();
      }
    }

    dispatch('guessSelected', pokemonName);

    // Clear the input and suggestions
    searchQuery = "";
    filteredPokemon = [];
  }

  // Show the win modal
  function showWinModal() {
    showModal = true;
    modalTitle = "Congratulations! You Win!";
    modalMessage = `The correct Pokémon was ${capitalize(randomPokemon)}!`;
  }

  // Show the loss modal
  function showLossModal() {
    showModal = true;
    modalTitle = "Game Over! You've Lost.";
    modalMessage = `The Pokémon was ${capitalize(randomPokemon)}.`;
  }

  // Function to capitalize a string
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
</script>

<main>
  <!-- Modal -->
  <Modal
          bind:showModal
          bind:modalTitle
          bind:modalMessage
          bind:randomPokemonInfo
          bind:randomPokemon
  />

  <!-- Top bar for displaying remaining guesses -->
  <div class="top-bar">
    <span class="remaining-guesses">Guesses Remaining: {remainingGuesses}</span>
  </div>

  <!-- Game Title -->
  <h1>Pokémon Guessing Game (Gen 1-4)</h1>

  <div class="mobile-flip">
    <div class="container-lg">
      <h3>Your Guesses</h3>

      <!-- Player's Guesses -->
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
      <!-- Search bar -->
      <input
              type="text"
              autocomplete="off"
              bind:value={searchQuery}
              placeholder="Type a Pokémon name..."
              on:input={onInput}
              class="search-input"
      />

      <!-- Pokémon suggestions -->
      {#if searchQuery}
        <ul class="suggestions-list">
          {#each filteredPokemon as pokemon}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <li class="suggestion-item" on:click={() => handleSuggestionClick(pokemon)}>
              <div class="pokemon-info">
                <!-- Pokémon details -->
                {#if pokemonInfo[pokemon]}
                  <div class="pokemon-main-details">
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
</main>
