import type { FilamentProfilesState } from '@/store/filament-profiles/types'

export const defaultState = (): FilamentProfilesState => {
  return {
    filamentProfiles: [],
    filamentSelectDialogState: {
      show: false,
      macro: undefined
    },
    filamentPrintDialogState: {
      show: false,
      filename: undefined
    }
  }
}

export const state = defaultState()
