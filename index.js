import deepdiff from '@markgarrigan/deepdiff'

const MAX_SIZE = 4500000
const event = new Event('stateChange');

function ls() {
  return localStorage.getItem('ls') ? JSON.parse(localStorage.getItem('ls')) : []
}

export default {
  pending: false,
  get(index = 0) {
    const indexNumber = Number(index)
    if (!indexNumber && indexNumber !== 0) {
      console.error('You must pass in a number.');
      return {}
    }
    return ls()[indexNumber] || {}
  },
  set(obj) {
    if (this.pending) {
      this.set(obj)
    }
    this.pending = true
    if (Object.prototype.toString.call(obj) !== '[object Object]') {
      console.error('LS error: You must pass in an object to set.');
      return this.get()
    }
    const oldState = this.get()
    const newState = {
      ...oldState,
      ...obj
    }
    const diff = deepdiff(oldState, newState)
    if (Object.keys(diff).length !== 0) {
      const state = ls()
      state.unshift(newState)
      const size = new Blob(state).size
      if (size > MAX_SIZE) {
        state.pop()
      }
      localStorage.setItem('ls', JSON.stringify(state))
      window.dispatchEvent(event)
    }
    this.pending = false
    return newState
  },
  diff(index1, index2) {
    const state1 = this.get(index1)
    const state2 = this.get(index2)
    return deepdiff(state1, state2)
  }
}
