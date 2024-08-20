import type { MutationTree } from 'vuex'
import { defaultState } from './state'
import type { FilamentProfilesState } from './types'

export const mutations: MutationTree<FilamentProfilesState> = {
  /**
   * Reset state
   */
  setReset (state) {
    Object.assign(state, defaultState())
  }

}
