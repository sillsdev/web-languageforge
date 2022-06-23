import { writable } from 'svelte/store'

export const loading = writable(false)

const pending = []

export const start = id => {
  loading.set(true)

  pending.push(id)
}

export const stop = id => {
  const i = pending.findIndex(anId => anId === id)

  if (i >= 0) {
    pending.splice(i,1)

    loading.set(!!pending.length)
  }
}