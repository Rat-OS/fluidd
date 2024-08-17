import type { MacrosState } from './types'

export const defaultState = (): MacrosState => {
  return {
    stored: [],
    categories: [],
    expanded: [0],
    showLoadFilamentDialog: false
  }
}

export const state = defaultState()
