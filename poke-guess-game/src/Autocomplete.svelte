<script>
  import { onMount } from "svelte";

  let searchQuery = ''; // The query the user types in
  let pokemonList = []; // Initialize pokemonList as an empty array
  let filteredPokemon = []; // Array to hold filtered Pokémon based on search query
  let pokemonInfo = {}; // Object to hold fetched Pokemon info

  // Fetch Pokémon data from PokeAPI when the component mounts
  onMount(async () => {
    const allPokemonData = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
    const pokemonData = await allPokemonData.json();

    // Populate pokemonList with names of all Pokémon
    pokemonList = pokemonData.results.map((pokemon) => pokemon.name);
  });

  // Function to fetch and return Pokémon info
  function getPokemonInfo(pokemonName) {
    // Check if info is already fetched, if so, return it immediately
    if (pokemonInfo[pokemonName]) {
      return pokemonInfo[pokemonName];
    }

    // Start fetching Pokémon info asynchronously if not already fetched
    fetchPokemonData(pokemonName);
    return null; // Return nothing until data is fetched
  }

  // Helper function that actually fetches the Pokémon data
  async function fetchPokemonData(pokemonName) {
    try {
      // Fetch Pokémon details (height, weight, typing, etc.)
      const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
      const pokemonData = await pokemonResponse.json();

      // Get the typing, height, and weight of the Pokémon
      const types = pokemonData.types.map(t => t.type.name).join(", ");
      const height = pokemonData.height / 10; // Convert height to meters
      const weight = pokemonData.weight / 10; // Convert weight to kg

      // Fetch the generation of the Pokémon from the species endpoint
      const speciesResponse = await fetch(pokemonData.species.url);
      const speciesData = await speciesResponse.json();
      const generation = speciesData.generation.name;

      // Store the fetched data in pokemonInfo
      pokemonInfo[pokemonName] = {
        types,
        height,
        weight,
        generation,
      };
    } catch (error) {
      console.error("Error fetching Pokémon info:", error);
      pokemonInfo[pokemonName] = null; // Store error state if something fails
    }
  }

  // Function to filter Pokémon list based on search query
  $: filteredPokemon = pokemonList
    .filter(pokemon =>
      pokemon.toLowerCase().startsWith(searchQuery.toLowerCase()) // Case-insensitive search
    )
    .slice(0, 5); // Limit to 5 results

  // Function to highlight the part of the name that matches the query
  function getHighlightedName(name, query) {
    name = String(name).charAt(0).toUpperCase() + String(name).slice(1);
    const lowerName = name.toLowerCase(); // Convert name to lowercase for comparison
    const lowerQuery = query.toLowerCase();
    const index = lowerName.indexOf(lowerQuery);

    if (index === -1) return name; // No match

    return (
      name.slice(0, index) +
      '<strong>' +
      name.slice(index, index + query.length) +
      '</strong>' +
      name.slice(index + query.length)
    );
  }

  // Trigger search and info fetch automatically as the user types
  async function onInput(event) {
  searchQuery = event.target.value;
  
  // Automatically fetch Pokémon info for the current search query
  if (searchQuery && filteredPokemon.length) {
    let i = 0;
    
    // Use a for loop to handle async operations with await
    while (i < filteredPokemon.length) {
      await getPokemonInfo(filteredPokemon[i]);  // Ensure this is awaited
      i++;
    }
  }
}
</script>

<div>
  <input
    type="text"
    bind:value={searchQuery}
    placeholder="Type a Pokémon name..."
    on:input={onInput}
  />

  {#if searchQuery}
    <ul>
      {#each filteredPokemon as pokemon}
        <li>
          <div>
            {@html getHighlightedName(pokemon, searchQuery)}
          </div>

          <!-- Fetch Pokémon info automatically when it's available -->
          <div>
            {#if pokemonInfo[pokemon]}
              <div>
                <p><strong>Type(s):</strong> {pokemonInfo[pokemon].types}</p>
                <p><strong>Height:</strong> {pokemonInfo[pokemon].height} m</p>
                <p><strong>Weight:</strong> {pokemonInfo[pokemon].weight} kg</p>
                <p><strong>Generation:</strong> {pokemonInfo[pokemon].generation}</p>
              </div>
            {:else}
              <p>Loading info...</p>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  input {
    padding: 8px;
    margin: 10px;
    width: 200px;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    background: #f0f0f0;
    padding: 5px;
    margin: 2px;
    cursor: pointer;
  }
  strong {
    color: red; /* Highlight the matched text in red */
  }
</style>
