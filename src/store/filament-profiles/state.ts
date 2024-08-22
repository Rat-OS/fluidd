import type { FilamentProfilesState } from '@/store/filament-profiles/types'

export const defaultState = (): FilamentProfilesState => {
  return {
    showFilamentDialog: false,
    filamentDialogMacro: undefined,
    filamentProfiles: []
  }
}

export const state = defaultState()
