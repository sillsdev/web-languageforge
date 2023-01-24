<!-- https://daisyui.com/components/collapse -->
<div class='collapse collapse-arrow'>
	<input type=checkbox on:click/>

	<div class='collapse-title text-xl font-medium bg-primary text-primary-content z-10 pointer-events-none'>
		<slot name='summary' />
	</div>

	<div class=collapse-content>
		<p><slot /></p>
	</div>
</div>

<!--
	Why "z-10 pointer-events-none" and ":global(.collapse-title button)"?

	see https://github.com/saadeghi/daisyui/discussions/1517
 -->
<style>
:global(.collapse-title button) {
	pointer-events: all;
}
</style>
