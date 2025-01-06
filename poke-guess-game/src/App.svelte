<script>
  import Modal from './components/Modal.svelte';
  import PokemonSuggestions from "./components/PokemonSuggestions.svelte";
  import Guesses from './components/Guesses.svelte';
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";

  // Import API, utility, and game functions
  import { fetchAllPokemon, fetchPokemonData } from './utils/api.js';
  import { processGuess } from './utils/game.js';
  import {escapeHTML, getHighlightedName, sanitizeInput } from './utils/utils.js';


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

    // Use the sanitizeInput utility function
    searchQuery = sanitizeInput(input);

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
    <div class="container-lg">
      <h3>Your Guesses</h3>
      <!-- Player's Guesses -->
      <Guesses {guesses} />
      
      <div class="container left">
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
        <PokemonSuggestions
                {searchQuery}
                {filteredPokemon}
                {pokemonInfo}
                handleSuggestionClick={handleSuggestionClick}
        />
      </div>
      


  </div>

</main>
