import type { ActionTree } from 'vuex'
import type { FilamentProfile, FilamentProfilesState } from './types'
import type { RootState } from '../types'
import { SocketActions } from '@/api/socketActions'

export const actions: ActionTree<FilamentProfilesState, RootState> = {
  /**
   * Reset our store
   */
  async reset ({ commit }) {
    commit('setReset')
  },

  /**
   * Init stored filament profiles
   */
  initFilamentProfiles ({ commit }, payload) {
    commit('initFilamentProfiles', payload)
  },

  /**
   * Add or update a given filament profile
   */
  async addFilamentProfileFromMetaData ({ commit, rootState }, payload) {
    commit('setFilamentProfileFromMetaData', payload)
    SocketActions.serverWrite('filamentProfiles', rootState.filamentProfiles)
  },

  async updateFilamentProfile ({ commit, rootState }, payload) {
    commit('setFilamentProfile', payload)
    SocketActions.serverWrite('filamentProfiles', rootState.filamentProfiles)
  },

  saveAllFilamentProfilesOrder ({ commit, rootState }, payload: FilamentProfile[]) {
    // Commit the change...
    payload.forEach((filament, index) => {
      commit('setFilamentProfile', {
        ...filament,
        order: index
      })
    })
    // Save to moonraker.
    SocketActions.serverWrite('filamentProfiles', rootState.filamentProfiles)
  },

  /**
   * Remove a filament profile
   */
  async removeFilamentProfile ({ commit, rootState }, payload) {
    commit('setRemoveFilamentProfile', payload)
    SocketActions.serverWrite('filamentProfiles', rootState.filamentProfiles)
  }

}
