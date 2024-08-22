<template>
  <app-dialog
    v-model="isOpen"
    scrollable
    :max-width="450"
    :title="$t('app.general.title.filament_profile_mismatch')"
    title-shadow
  >
    <v-card
      dense
      class="fill-height pt-0"
    >
      <div>
        Test
      </div>
    </v-card>
    <template #actions>
      <v-spacer v-if="!isMobileViewport" />

      <app-btn
        text
        color="warning"
        @click="isOpen = false"
      >
        {{ $t('app.general.btn.cancel') }}
      </app-btn>
    </template>
  </app-dialog>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import BrowserMixin from '@/mixins/browser'
import ToolheadMixin from '@/mixins/toolhead'
import type { FilamentPrintDialogState, FilamentProfile } from '@/store/filament-profiles/types'
import type { FileBrowserEntry, KlipperFileMeta } from '@/store/files/types'
import { SocketActions } from '@/api/socketActions'

@Component({})
export default class FilamentProfilePrintDialog extends Mixins(StateMixin, BrowserMixin, ToolheadMixin) {
  /**
   * Common
   */
  hasScannedFilaments = false
  detectedFilaments: FilamentProfile[] = []

  /**
   * dialog state
   */
  get isOpen () {
    const dialogState: FilamentPrintDialogState = this.$store.state.filamentProfiles.filamentPrintDialogState
    if (this.klippyReady && this.$store.state.filamentProfiles.filamentPrintDialogState.show) {
      this.$store.state.filamentProfiles.filamentPrintDialogState.show = false
      if (dialogState.filename) {
        const metaData = this.getFileMetaData(dialogState.filename)
        if (metaData) {
          this.setLoadedFilaments()
          if (this.loadedFilaments.length > 0) {
            if (this.loadedFilaments[0].name !== metaData.filament_name) {
              this.$store.state.filamentProfiles.filamentPrintDialogState.show = true
            }
          }
        }
      }
      if (!this.$store.state.filamentProfiles.filamentPrintDialogState.show) {
        if (dialogState.filename) {
          SocketActions.printerPrintStart(dialogState.filename)

          // If we aren't on the dashboard, push the user back there.
          if (this.$router.currentRoute.path !== '/') {
            this.$router.push({ path: '/' })
          }
        }
      }
    }

    return this.$store.state.filamentProfiles.filamentPrintDialogState.show
  }

  set isOpen (val: boolean) {
    this.$store.state.filamentProfiles.filamentPrintDialogState.show = val
  }

  /**
   * meta data
   */
  getFileMetaData (filename: string) {
    const file = this.$store.getters['files/getFile']('gcodes', filename) as KlipperFileMeta
    return file ?? undefined
  }

  /**
   * loaded filaments
   */
  setLoadedFilaments () {
    const loadedFilaments: FilamentProfile[] = []
    const toolchangeCommands = this.toolChangeCommands
    if (toolchangeCommands && toolchangeCommands.length > 0) {
      for (const tcc of toolchangeCommands) {
        if (tcc.filament_name !== '' && tcc.filament_type !== '' && (tcc.filament_temp ?? 0) > 0) {
          loadedFilaments.push({
            id: parseInt(tcc.name.substring(1)),
            order: parseInt(tcc.name.substring(1)),
            type: tcc.filament_type ?? '',
            name: tcc.filament_name ?? '',
            temp: tcc.filament_temp ?? 0,
            visible: true
          })
        }
      }
    }
    this.loadedFilaments = loadedFilaments
  }

  get loadedFilaments () {
    return this.detectedFilaments
  }

  set loadedFilaments (val: FilamentProfile[]) {
    this.detectedFilaments = val
  }

  /**
   * filament profiles
   */
  get visibleFilamentProfiles () {
    const filaments = this.$store.getters['filamentProfiles/getFilamentProfiles']
    if (!this.hasScannedFilaments && (!filaments || filaments.length === 0)) {
      this.hasScannedFilaments = true
      this.scanFilamentProfiles()
    }
    this.hasScannedFilaments = true
    return filaments
      .filter((filament: FilamentProfile) => filament.visible)
  }

  currentRoot = 'gcodes'

  get currentPath () {
    return this.$store.getters['files/getCurrentPathByRoot'](this.currentRoot) || this.currentRoot
  }

  set currentPath (path: string) {
    this.$store.dispatch('files/updateCurrentPathByRoot', { root: this.currentRoot, path })
  }

  getAllFiles () {
    const items = this.$store.getters['files/getDirectory'](this.currentPath) as FileBrowserEntry[] | undefined
    return items ?? []
  }

  get files (): FileBrowserEntry[] {
    const files = this.getAllFiles()
    return files
  }

  scanFilamentProfiles () {
    this.currentPath = this.currentRoot
    const files: FileBrowserEntry[] = this.files
    for (let i = 0; i < files.length; i++) {
      // SocketActions.serverFilesMetadata(files[i].name)
      const metaData = this.getFileMetaData(files[i].name)
      if (metaData) {
        this.$store.dispatch('filamentProfiles/addFilamentProfileFromMetaData', {
          type: metaData.filament_type,
          name: metaData.filament_name,
          temp: metaData.first_layer_extr_temp,
          visible: true
        })
      }
    }
  }
}
</script>
