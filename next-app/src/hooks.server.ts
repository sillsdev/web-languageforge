export function handle({ event, resolve }) {
	console.log('handle:', { event })

  	return resolve(event)
}

export function handleFetch({ event, request, fetch }) {
	console.log('handleFetch:', { event, request, fetch })

	return fetch(request)
}
