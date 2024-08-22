import Vue from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { MutationTree } from 'vuex'
import { defaultState } from './state'
import type {
  FilamentPrintDialogState,
  FilamentProfilesState,
  FilamentSelectDialogState
} from '@/store/filament-profiles/types'

export const mutations: MutationTree<FilamentProfilesState> = {
  /**
   * Reset state
   */
  setReset (state) {
    Object.assign(state, defaultState())
  },

  // Sets filament profile state from db
  initFilamentProfiles (state, payload: FilamentProfilesState) {
    payload.filamentPrintDialogState = {
      show: false,
      filename: undefined
    }
    payload.filamentSelectDialogState = {
      show: false,
      macro: undefined
    }
    if (payload && payload.filamentProfiles) {
      if (typeof payload.filamentProfiles[0] === 'string') payload.filamentProfiles = []
    }
    if (payload) Object.assign(state, payload)
  },

  /**
   * set dialog states
   */
  setFilamentSelectDialogState (state, payload: FilamentSelectDialogState) {
    state.filamentSelectDialogState = payload
  },

  setFilamentPrintDialogState (state, payload: FilamentPrintDialogState) {
    state.filamentPrintDialogState = payload
  },

  /**
   * Update / Add a filament profile
   */
  setFilamentProfile (state, payload) {
    if (payload.id === -1) {
      payload.id = uuidv4()
      state.filamentProfiles.push(payload)
    } else {
      const i = state.filamentProfiles.findIndex(profile => profile.id === payload.id)
      if (i >= 0) {
        Vue.set(state.filamentProfiles, i, {
          id: payload.id,
          order: payload.order,
          type: payload.type,
          name: payload.name,
          temp: payload.temp,
          visible: payload.visible
        })
      }
    }
  },

  setFilamentProfileFromMetaData (state, payload) {
    if (payload.name.includes('";"')) {
      const names: string[] = payload.name.split(';')
      const types: string[] = payload.type.split(';')
      for (let i = 0; i < names.length; i++) {
        const profile = state.filamentProfiles.find(profile => profile.name === names[i].replace(/"/g, ''))
        if (!profile) {
          const filamentProfile: any = {
            id: uuidv4(),
            type: types[i].replace(/"/g, ''),
            name: names[i].replace(/"/g, ''),
            temp: payload.temp,
            visible: true
          }
          state.filamentProfiles.push(filamentProfile)
        }
      }
    } else {
      const profile = state.filamentProfiles.find(profile => profile.name === payload.name)
      if (!profile) {
        payload.id = uuidv4()
        state.filamentProfiles.push(payload)
      }
    }
  },

  /**
   * Remove a filament profile
   */
  setRemoveFilamentProfile (state, payload) {
    const i = state.filamentProfiles.findIndex(profile => profile.id === payload.id)
    state.filamentProfiles.splice(i, 1)
  }

}
