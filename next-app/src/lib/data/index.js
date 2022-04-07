// import { getToken } from '../authn/token'
// import { start, stop } from '../components/progress'
// import { throwError } from '../error'
// import t from '../i18n'

export async function CREATE(uri, body) { return await customFetch('post'  , uri, body) }
export async function GET   (uri      ) { return await customFetch('get'   , uri      ) }
export async function UPDATE(uri, body) { return await customFetch('put'   , uri, body) }
export async function DELETE(uri      ) { return await customFetch('delete', uri      ) }

// https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData
export const upload = async formData => await CREATE('post', formData)

// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Supplying_request_options
async function customFetch(method, uri, body) {
  const headers = {
    // authorization: `Bearer ${getToken()}`,
    'content-type': 'application/json',
  }

  // when dealing with FormData, i.e., when uploading files, allow the browser to set the request up
  // so boundary information is built properly.
  if (body instanceof FormData) {
    delete headers['content-type']
  } else {
    body = JSON.stringify(body)
  }

  // const url = includesHost(uri) ? uri : `${process.env.API_HOST}/${uri}`
  let response = {}
  try {
    // start(url)

    response = await fetch(uri, {
      method,
      // credentials: 'include', // ensures the response back from the api will be allowed to "set-cookie"
      headers,
      body,
    })
  } catch (e) {
    // these only occur for network errors, like these:
    //     request made with a bad host, e.g., //httpbin
    //     the host is refusing connections
    //     client is offline, i.e., airplane mode or something
    //     CORS preflight failures
    // throwError(e)
    console.error(e)
  } finally {
    // stop(url)
  }

  const results = await response.json()

  // reminder: fetch does not throw exceptions for non-200 responses (https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch)
  if (! response.ok) {
    const code = response.status
    // const message = code === 401 ? t(response.statusText) : response.statusText
    const message = response.statusText

    // throwError(message, code)
    console.error(message, code)
  }

  return results
}

// matches:
//    http://example.com
//    https://example.com
//    //example.com
// not these:
//    redirect-to?url=//example.org/home?abc=123
//    redirect-to?url=https://example.org/home?abc=123
// const includesHost = uri => uri.match(/^(?:https?:)?\/\//)
