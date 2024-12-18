<script>
  import Autocomplete from './Autocomplete.svelte';
  import GuessFeedback from './GuessFeedback.svelte';

  let userGuess = ''; // Variable to store the user's guess

  // Handle the custom event 'guessSelected' from Autocomplete
  function handleGuessSelected(event) {
    userGuess = event.detail; // Store the guess
  }
</script>

<main>
  <style src="./style.css"></style>

  <h1>Pokémon Guessing Game</h1>

  <!-- Pass the user guess to GuessFeedback as a prop -->
  <Autocomplete on:guessSelected={handleGuessSelected} />
  <GuessFeedback guess={userGuess} />
</main>
