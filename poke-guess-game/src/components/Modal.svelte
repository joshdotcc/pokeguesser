<script>
    export let showModal;
    export let modalTitle;
    export let modalMessage;
    export let randomPokemonInfo;
    export let randomPokemon;

    function reloadGame() {
        location.reload();
    }
</script>

{#if showModal}
    <div class="modal-overlay">
        <div class="modal">
            <h2>{modalTitle}</h2>
            <p>{modalMessage}</p>
            <img src={randomPokemonInfo?.spriteUrl} alt="{randomPokemon}" class="random-pokemon-sprite" />
            <ul>
                <li>
                    <strong>Type(s):</strong>
                    {#each randomPokemonInfo?.types as type}
                        <span class="type-badge type-{type.toLowerCase()}">{type}</span>
                    {/each}
                </li>
                <li><strong>Height:</strong> {randomPokemonInfo?.height} m</li>
                <li><strong>Weight:</strong> {randomPokemonInfo?.weight} kg</li>
                <li><strong>Generation:</strong> {randomPokemonInfo?.generation}</li>
            </ul>
            <button on:click={reloadGame}>Play Again</button>
        </div>
    </div>
{/if}