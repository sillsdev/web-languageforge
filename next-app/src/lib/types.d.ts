import type { HttpMethod } from '@sveltejs/kit/types/private';

type AdaptedFetchArgs = {
	url: string,
	method: HttpMethod,
	body?: object,
}
type FetchArgs = {
	url: string,
	body?: object,
}
