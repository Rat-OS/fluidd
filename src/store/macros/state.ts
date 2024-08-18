import type { MacrosState } from './types'

export const defaultState = (): MacrosState => {
  return {
    stored: [],
    categories: [],
    expanded: [0],
    showFilamentDialog: false,
    filamentDialogMacro: undefined
  }
}

export const state = defaultState()
