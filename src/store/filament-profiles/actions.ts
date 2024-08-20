import type { ActionTree } from 'vuex'
import type { FilamentProfilesState } from './types'
import type { RootState } from '../types'

export const actions: ActionTree<FilamentProfilesState, RootState> = {
  /**
   * Reset our store
   */
  async reset ({ commit }) {
    commit('setReset')
  }

}
