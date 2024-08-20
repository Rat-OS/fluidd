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
          @click="handleReload"
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

            {{ filament.temp }}°C
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

      <filament-dialog
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
import FilamentDialog from './FilamentDialog.vue'
import StateMixin from '@/mixins/state'
import type { FilamentPreset } from '@/store/config/types'
import type { AppFileWithMeta, FileBrowserEntry } from '@/store/files/types'
import { SocketActions } from '@/api/socketActions'

@Component({
  components: {
    FilamentDialog
  }
})
export default class FilamentSettings extends Mixins(StateMixin) {
  dialogState: any = {
    active: false,
    preset: null
  }

  get filaments () {
    return this.$store.getters['config/getFilamentPresets']
  }

  set filaments (filaments: FilamentPreset[]) {
    this.$store.dispatch('config/saveAllFilamentPresetsOrder', filaments)
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
    console.error('items ' + items)
    return items ?? []
  }

  get files (): FileBrowserEntry[] {
    const files = this.getAllFiles()
    return files
  }

  handleReload () {
    this.currentPath = this.currentRoot
    const files: FileBrowserEntry[] = this.files
    for (let i = 0; i < files.length; i++) {
      console.error('files[i].name ' + files[i].name)
      // const filename = files[i].path ? `${files[i].path}/${files[i].filename}` : files[i].filename
      SocketActions.serverFilesMetadata(files[i].name)
    }
  }

  handleRefreshMetadata (file: AppFileWithMeta) {
    const filename = file.path ? `${file.path}/${file.filename}` : file.filename

    SocketActions.serverFilesMetadata(filename)
  }

  openAddDialog () {
    const preset: any = {
      id: -1,
      type: '',
      name: '',
      temp: 0,
      visible: true
    }
    this.dialogState = {
      active: true,
      preset
    }
  }

  openEditDialog (preset: FilamentPreset) {
    this.dialogState = {
      active: true,
      preset
    }
  }

  handleRemovePreset (filament: FilamentPreset) {
    this.$store.dispatch('config/removeFilamentPreset', filament)
  }

  handleSavePreset (preset: FilamentPreset) {
    this.$store.dispatch('config/updateFilamentPreset', preset)
  }

  handlePresetVisible (preset: FilamentPreset, value: boolean) {
    const newPreset = {
      ...preset, visible: value
    }
    this.$store.dispatch('config/updateFilamentPreset', newPreset)
  }
}
</script>
