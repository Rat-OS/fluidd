import type { GetterTree } from 'vuex'
import type { FilamentProfile, FilamentProfilesState } from './types'
import type { RootState } from '../types'
import type { FileBrowserEntry } from '../files/types'
import { SocketActions } from '@/api/socketActions'
import files from '..'

export const getters: GetterTree<FilamentProfilesState, RootState> = {
  getHasFilamentProfiles: (state, getters) => {
    const filamentProfiles = getters.getFilamentProfiles
    return filamentProfiles && filamentProfiles.length > 0
  },

  getFilamentProfiles: (state) => {
    const allFilamentProfiles = state.filamentProfiles
    if (!allFilamentProfiles || allFilamentProfiles.length === 0) {
      const gcodeFiles = files.getters['files/getDirectory']('gcodes') as FileBrowserEntry[] | undefined
      if (gcodeFiles && gcodeFiles.length > 0) {
        for (let i = 0; i < gcodeFiles.length; i++) {
          SocketActions.serverFilesMetadata(gcodeFiles[i].name)
        }
      }
      SocketActions.serverWrite('filamentProfiles', state.filamentProfiles)
    }
    const filaments = allFilamentProfiles
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
