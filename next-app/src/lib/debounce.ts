let id: ReturnType<typeof setTimeout>

export function debounce(fn: () => void, delay_in_ms: number) {
	clearTimeout(id) // cancels any previous ones that may not have fired the fn yet, i.e., it resets the delay so it's a delay from the last call not the first

	id = setTimeout(fn, delay_in_ms)
}
