<script>
    export let searchQuery = "";
    export let filteredPokemon = [];
    export let pokemonInfo = {};
    export let handleSuggestionClick = () => {};

    import { getHighlightedName } from "../utils/utils.js";
</script>

{#if searchQuery}
    <ul class="suggestions-list">
        {#each filteredPokemon as pokemon}
            <!-- Ignore accessibility error for triggering onClick without keyboard events -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <li class="suggestion-item" on:click={() => handleSuggestionClick(pokemon)}>
                <div class="pokemon-info">
                    <!-- Display Pokémon details if their info is loaded -->
                    {#if pokemonInfo[pokemon]}
                        <div class="pokemon-main-details">
                            <div class="pokemon-name">
                                {@html getHighlightedName(pokemon, searchQuery)}
                            </div>
                            <img
                                    src={pokemonInfo[pokemon].spriteUrl}
                                    alt="{pokemon}"
                                    class="sprite"
                            />
                        </div>
                        <div class="info">
                            <p>
                                <strong>Type(s):</strong>
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