<template>
  <div>
    <v-subheader id="filaments">
      {{ $t('app.setting.title.filament_presets') }}
    </v-subheader>
    <v-card
      :elevation="5"
      dense
      class="mb-4"
    >
      <app-setting>
        <app-btn
          outlined
          small
          color="primary"
          class="mr-3"
          @click="scanFilamentProfiles"
        >
          <v-icon
            small
            left
          >
            $reset
          </v-icon>
          {{ $t('app.setting.btn.reload_filament_presets') }}
        </app-btn>
        <app-btn
          outlined
          small
          color="primary"
          @click="openAddDialog"
        >
          <v-icon
            small
            left
          >
            $plus
          </v-icon>
          {{ $t('app.setting.btn.add_filament_preset') }}
        </app-btn>
      </app-setting>

      <app-draggable
        v-model="filaments"
        :options="{
          animation: 200,
          handle: '.handle',
          ghostClass: 'ghost'
        }"
      >
        <section
          v-for="filament in filaments"
          :key="`filament-${filament.name}`"
        >
          <v-divider />

          <app-setting
            :r-cols="2"
            @click="openEditDialog(filament)"
          >
            <template #title>
              <v-icon
                class="handle"
                left
              >
                $drag
              </v-icon>
              {{ filament.name }}
            </template>

            <span class="mr-4">
              {{ filament.temp }}<small>°C</small>
            </span>
            <span>
              {{ filament.bed_temp }}<small>°C</small>
            </span>
            <app-btn
              fab
              text
              x-small
              color=""
              class="mr-3 ml-3"
              @click.stop="handleRemovePreset(filament)"
            >
              <v-icon color="">
                $close
              </v-icon>
            </app-btn>

            <v-switch
              class="mt-0 pt-0"
              :input-value="filament.visible"
              color="primary"
              hide-details
              @click.stop
              @change="handlePresetVisible(filament, $event)"
            />
          </app-setting>
        </section>
      </app-draggable>

      <filament-profile-edit-dialog
        v-if="dialogState.active"
        v-model="dialogState.active"
        :preset="dialogState.preset"
        @save="handleSavePreset"
      />
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import FilamentProfileEditDialog from './FilamentProfileEditDialog.vue'
import StateMixin from '@/mixins/state'
import type { FilamentProfile } from '@/store/filament-profiles/types'
import type { FileBrowserEntry, KlipperFileMeta } from '@/store/files/types'

@Component({
  components: {
    FilamentProfileEditDialog
  }
})
export default class FilamentSettings extends Mixins(StateMixin) {
  hasScannedFilaments = false

  dialogState: any = {
    active: false,
    preset: null
  }

  get filaments () {
    const filaments = this.$store.getters['filamentProfiles/getFilamentProfiles']
    if (!this.hasScannedFilaments && (!filaments || filaments.length === 0)) {
      this.scanFilamentProfiles()
    }
    this.hasScannedFilaments = true
    return filaments
  }

  set filaments (filaments: FilamentProfile[]) {
    this.$store.dispatch('filamentProfiles/saveAllFilamentProfilesOrder', filaments)
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

  getFileMetaData (filename: string) {
    const file = this.$store.getters['files/getFile']('gcodes', filename) as KlipperFileMeta
    return file ?? undefined
  }

  openAddDialog () {
    const preset: any = {
      id: -1,
      type: '',
      name: '',
      temp: 0,
      bed_temp: 0,
      visible: true
    }
    this.dialogState = {
      active: true,
      preset
    }
  }

  openEditDialog (preset: FilamentProfile) {
    this.dialogState = {
      active: true,
      preset
    }
  }

  handleRemovePreset (filament: FilamentProfile) {
    this.$store.dispatch('filamentProfiles/removeFilamentProfile', filament)
  }

  handleSavePreset (preset: FilamentProfile) {
    this.$store.dispatch('filamentProfiles/updateFilamentProfile', preset)
  }

  handlePresetVisible (preset: FilamentProfile, value: boolean) {
    const newPreset = {
      ...preset, visible: value
    }
    this.$store.dispatch('filamentProfiles/updateFilamentProfile', newPreset)
  }
}
</script>
