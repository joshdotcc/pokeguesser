<script>
    export let guesses = [];
</script>

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