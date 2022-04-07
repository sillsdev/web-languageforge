<script>
import { beforeNavigate } from '$app/navigation'
import { error, dismiss } from '$lib/error'

let errContainer = null

$: errContainer && scrollIntoView(errContainer)
$: beforeNavigate(() => $error.message && dismiss())

const scrollIntoView = element => element.scrollIntoView({behavior: 'smooth'})
</script>

<style>
span {
  background-color: darkred;
  color: whitesmoke;

  border-radius: 0.25rem;

  padding: 1rem;
}
span small {
  position: relative;
  top: -1rem;
  right: -.5rem;
  cursor: pointer;
}
</style>

{#if $error.message}
  <span bind:this={errContainer}>
    {$error.message} <small on:click={dismiss}>⨉</small>
  </span>
{/if}
