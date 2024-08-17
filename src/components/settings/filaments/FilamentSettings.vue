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

              {{ filament.name.toUpperCase() }} - {{ filament.temp }}°C
            </template>

            <app-btn
              fab
              text
              x-small
              color=""
              class="mr-3"
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

  openAddDialog () {
    const preset: any = {
      id: -1,
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
