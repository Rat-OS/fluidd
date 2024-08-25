<template>
  <div>
    <v-subheader id="presets">
      {{ $t('app.setting.title.thermal_presets') }}
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
          {{ $t('app.setting.btn.add_thermal_preset') }}
        </app-btn>
      </app-setting>

      <app-draggable
        v-model="presets"
        :options="{
          animation: 200,
          handle: '.handle',
          ghostClass: 'ghost'
        }"
      >
        <section
          v-for="(preset, i) in presets"
          :key="`preset-${i}`"
        >
          <v-divider />

          <app-setting
            :r-cols="2"
            @click="openEditDialog(preset)"
          >
            <template #title>
              <v-icon
                class="handle"
                left
              >
                $drag
              </v-icon>
              {{ preset.name }}:
              <span
                v-for="(value, k) in preset.values"
                v-show="value.active"
                :key="k"
                class="mr-2"
              >
                {{ k }}: {{ value.value }}<small>°C</small>
              </span>
            </template>

            <app-btn
              fab
              text
              x-small
              color=""
              class="mr-3"
              @click.stop="handleRemovePreset(preset)"
            >
              <v-icon color="">
                $close
              </v-icon>
            </app-btn>

            <v-switch
              class="mt-0 pt-0"
              :input-value="preset.visible"
              color="primary"
              hide-details
              @click.stop
              @change="handlePresetVisible(preset, $event)"
            />
          </app-setting>
        </section>
      </app-draggable>

      <preset-dialog
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
import PresetDialog from './PresetDialog.vue'
import type { TemperaturePreset } from '@/store/config/types'
import type { Fan, Heater } from '@/store/printer/types'
import StateMixin from '@/mixins/state'

@Component({
  components: {
    PresetDialog
  }
})
export default class TemperaturePresetSettings extends Mixins(StateMixin) {
  get heaters (): Heater[] {
    return this.$store.getters['printer/getHeaters']
  }

  get fans (): Fan[] {
    return this.$store.getters['printer/getOutputs'](['temperature_fan'])
  }

  _presets?: TemperaturePreset[] = undefined
  get presets () {
    if (this._presets === undefined) {
      this._presets = this.$store.getters['config/getTempPresets']
    }
    return this._presets ?? []
  }

  set presets (presets: TemperaturePreset[]) {
    this.$store.dispatch('config/saveAllPresetOrder', presets)
    this._presets = presets
  }

  dialogState: any = {
    active: false,
    preset: null
  }

  openEditDialog (preset: TemperaturePreset) {
    this.dialogState = {
      active: true,
      preset
    }
  }

  openAddDialog () {
    const preset: any = {
      id: -1,
      order: -1,
      name: '',
      values: {},
      visible: true
    }
    for (const item of this.heaters) {
      preset.values[item.name] = { value: 0, type: 'heater', active: true }
    }
    for (const item of this.fans) {
      preset.values[item.name] = { value: 0, type: 'fan', active: true }
    }
    this.dialogState = {
      active: true,
      preset
    }
  }

  handleSavePreset (preset: TemperaturePreset) {
    this.$store.dispatch('config/updatePreset', preset)
  }

  handleRemovePreset (preset: TemperaturePreset) {
    this.$store.dispatch('config/removePreset', preset)
  }

  handlePresetVisible (preset: TemperaturePreset, value: boolean) {
    const newPreset = {
      ...preset, visible: value
    }
    this.$store.dispatch('config/updatePreset', newPreset)
  }
}
</script>

<style lang="scss" scoped>
  .presets-table table > tbody > tr > td {
    padding-top: 8px;
    padding-bottom: 8px;
    vertical-align: top;
  }
</style>
