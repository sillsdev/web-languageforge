import { writable, type Writable } from 'svelte/store'

export const loading: Writable<boolean> = writable(false)

const pending: Id[] = []

export function start(id: Id) {
  loading.set(true)

  pending.push(id)
}

export function stop(id: Id) {
  const i = pending.findIndex(_id => _id === id)

  if (i >= 0) {
    pending.splice(i,1)

    loading.set(!!pending.length)
  }
}
