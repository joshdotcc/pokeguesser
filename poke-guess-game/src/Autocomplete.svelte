<script>
    import { onMount } from "svelte";
  
    let searchQuery = ''; // The query the user types in
    let pokemonList = []; // Initialize pokemonList as an empty array
    let filteredPokemon = []; // Array to hold filtered Pokémon based on search query
  
    // Fetch Pokémon data from PokeAPI when the component mounts
    onMount(async () => {
      const allPokemonData = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
      const pokemonData = await allPokemonData.json();
      
      // Populate pokemonList with names of all Pokémon
      pokemonList = pokemonData.results.map((pokemon) => pokemon.name);
    });
  
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
  </script>
  
  <div>
    <input 
      type="text" 
      bind:value={searchQuery} 
      placeholder="Type a Pokémon name..." 
    />
  
    {#if searchQuery}
      <ul>
        {#each filteredPokemon as pokemon}
          <li>
            {@html getHighlightedName(pokemon, searchQuery)}
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
  