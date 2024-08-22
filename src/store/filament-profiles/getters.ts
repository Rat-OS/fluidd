import type { GetterTree } from 'vuex'
import type { FilamentProfile, FilamentProfilesState } from './types'
import type { RootState } from '../types'

export const getters: GetterTree<FilamentProfilesState, RootState> = {
  getFilamentProfiles: (state) => {
    const filaments = state.filamentProfiles
      .map(filament => {
        const { id, order, type, name, temp, visible } = filament

        return {
          id,
          order,
          type,
          name,
          temp,
          visible
        }
      })
    const sortedFilaments = filaments.sort((a: FilamentProfile, b: FilamentProfile) => {
      // Sorts preferrentially by order, then by name
      // This offers backward compatibility with filaments that have no order
      if ((a.order !== undefined && b.order !== undefined) && a.order !== b.order) {
        return a.order - b.order
      }

      return a.name.localeCompare(b.name)
    })
    return sortedFilaments
  }
}
