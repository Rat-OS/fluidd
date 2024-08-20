import type { FilamentProfilesState } from './types'

export const defaultState = (): FilamentProfilesState => {
  return {
    showFilamentSelectDialog: false,
    filamentDialogMacro: undefined
  }
}

export const state = defaultState()
