<template>
  <app-dialog
    v-model="open"
    scrollable
    :max-width="450"
    :title="$t('app.general.title.filament_profile_mismatch')"
    title-shadow
  >
    <v-card
      dense
      class="fill-height pt-0"
    >
      <v-col
        cols="12"
        class="px-0 pb-1"
      >
        <v-col
          cols="12"
          class="pt-0"
        >
          {{ $t('app.general.label.slicer_filament') }}
        </v-col>
        <v-list
          v-for="(filament, index) in gcodeFilaments"
          :key="`gcodeFilaments-${index}`"
          dense
          nav
          class="pa-0 ma-0 mb-2"
        >
          <v-list-item
            :key="`gcodeFilamentsAlert-${index}`"
            :value="filament"
            class="pa-0 my-0 mx-2"
          >
            <v-list-item-content
              class="pa-0"
            >
              <v-alert
                text
                dense
                icon="$info"
                type="info"
                class="mb-0"
              >
                <div class="mb-1">
                  Slicer Filament T{{ filament.id }}
                </div>
                <div>
                  <span style="font-size: 14px;">{{ filament.name }} - {{ filament.temp }}°C</span>
                </div>
              </v-alert>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>

      <v-divider />

      <v-col
        cols="12"
        class="px-0 pb-1"
      >
        <v-col
          cols="12"
          class="pt-0"
        >
          {{ $t('app.general.label.printer_filament') }}
        </v-col>
        <v-list
          v-for="(filament, index) in loadedFilaments"
          :key="`loadedFilaments-${index}`"
          dense
          nav
          class="pa-0 ma-0 mb-2"
        >
          <v-list-item
            :key="`loadedFilamentsAlert-${index}`"
            :value="filament"
            class="pa-0 my-0 mx-2"
          >
            <v-list-item-content
              class="pa-0"
            >
              <v-alert
                text
                dense
                :icon="filament.name === gcodeFilaments[index].name ? `$success` : `$error`"
                :type="filament.name === gcodeFilaments[index].name ? `success` : `error`"
                class="mb-0"
              >
                <div class="mb-1">
                  Printer Filament T{{ filament.id }}
                </div>
                <div>
                  <span style="font-size: 14px;">{{ filament.name }} - {{ filament.temp }}°C</span>
                </div>
              </v-alert>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>

      <v-divider />
    </v-card>
    <template #actions>
      <v-spacer v-if="isMobileViewport" />

      <app-btn
        text
        color="success"
        @click="printFile()"
      >
        {{ $t('app.general.btn.print_anyway') }}
      </app-btn>

      <v-spacer v-if="!isMobileViewport" />

      <app-btn
        text
        color="warning"
        @click="open = false"
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
  gcodeFilaments: FilamentProfile[] = []
  loadedFilaments: FilamentProfile[] = []
  dialogState: FilamentPrintDialogState | undefined = undefined

  /**
   * dialog state
   */
  get open () {
    this.dialogState = this.$store.state.filamentProfiles.filamentPrintDialogState
    if (this.klippyReady && this.$store.state.filamentProfiles.filamentPrintDialogState.show) {
      this.$store.state.filamentProfiles.filamentPrintDialogState.show = false
      if (this.dialogState?.filename) {
        const metaData = this.getFileMetaData(this.dialogState.filename)
        if (metaData) {
          this.setLoadedFilaments()
          this.setGcodeFilaments(metaData)
          if (this.loadedFilaments?.length > 0 && this.gcodeFilaments?.length > 0) {
            for (let i = 0; i < this.loadedFilaments.length; i++) {
              if (this.loadedFilaments[i].name !== this.gcodeFilaments[i].name) {
                this.$store.state.filamentProfiles.filamentPrintDialogState.show = true
                break
              }
            }
          }
        }
      }
      if (!this.$store.state.filamentProfiles.filamentPrintDialogState.show) {
        this.printFile()
      }
    }

    return this.$store.state.filamentProfiles.filamentPrintDialogState.show
  }

  set open (val: boolean) {
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
   * filaments
   */
  setGcodeFilaments (metaData: KlipperFileMeta) {
    const gcodeFilaments: FilamentProfile[] = []
    const names: string[] | undefined = metaData.filament_name?.split(';')
    const types: string[] | undefined = metaData.filament_type?.split(';')
    const temp: number | undefined = metaData.first_layer_extr_temp
    const bed_temp: number | undefined = metaData.first_layer_bed_temp
    if (names && types) {
      for (let i = 0; i < names.length; i++) {
        gcodeFilaments.push({
          id: i,
          order: i,
          type: types[i] ?? '',
          name: names[i] ?? '',
          temp: temp ?? 0,
          bed_temp: bed_temp ?? 0,
          visible: true
        })
      }
    }
    this.gcodeFilaments = gcodeFilaments
  }

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
            bed_temp: tcc.filament_bed_temp ?? 0,
            visible: true
          })
        }
      }
    }
    this.loadedFilaments = loadedFilaments
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
          bed_temp: metaData.first_layer_bed_temp,
          visible: true
        })
      }
    }
  }

  /**
   * actions
   */
  printFile () {
    this.$store.state.filamentProfiles.filamentPrintDialogState.show = false
    if (this.dialogState?.filename) {
      SocketActions.printerPrintStart(this.dialogState.filename)

      // If we aren't on the dashboard, push the user back there.
      if (this.$router.currentRoute.path !== '/') {
        this.$router.push({ path: '/' })
      }
    }
  }
}
</script>
