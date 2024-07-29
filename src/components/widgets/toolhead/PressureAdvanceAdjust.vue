<template>
  <v-form
    ref="form"
    v-model="valid"
    @submit.prevent
  >
    <v-row
      justify="end"
      class="pa-0 mt-1 mb-3"
    >
      <v-col
        cols="12"
        class="py-0"
      >
        <div class="d-flex align-center px-0 ml-0 pa-0">
          <v-select
            v-model="selectedExtruder"
            :items="extruders"
            :readonly="printerPrinting"
            :disabled="!klippyReady || printerPrinting || !hasMultipleExtruders"
            item-value="key"
            item-text="name"
            hide-details
            solo
            flat
            dense
            class="mb-1 no-border no-padding"
            style="border-bottom: none; box-shadow: none; font-size: 14px; transform: translateY(-2px)"
            @change="activateExtruder"
          >
            <template #selection="{ item }">
              <v-icon
                small
                class="px-0 ml-0 mr-1"
                :color="!item.extruder.can_extrude ? 'info' : 'error'"
              >
                $fire
              </v-icon>
              <span
                class="primary--text mt-1"
              >
                {{ item.name }}
              </span>
              <v-icon
                small
                class="px-0 ml-4 mr-1"
              >
                $thermometer
              </v-icon>
              <span
                class="primary--text mt-1"
              >
                {{ item.extruder.temperature.toFixed(2) }}°C
              </span>
              <v-icon
                small
                class="px-0 ml-4 mr-1"
              >
                $printer3dNozzle
              </v-icon>
              <span
                class="primary--text mt-1"
              >
                {{ item.extruder.config.nozzle_diameter }}mm
              </span>
            </template>
            <template #item="{ item }">
              <v-icon
                class="px-0 ml-0 mr-1"
                :color="!item.extruder.can_extrude ? 'info' : 'error'"
              >
                $fire
              </v-icon>
              <span
                class="mt-1"
              >
                {{ item.name }}
              </span>
              <v-icon
                class="px-0 ml-4 mr-1"
              >
                $thermometer
              </v-icon>
              <span
                class="mt-1"
              >
                {{ item.extruder.temperature.toFixed(2) }}°C
              </span>
              <v-icon
                class="px-0 ml-4 mr-1"
              >
                $printer3dNozzle
              </v-icon>
              <span
                class="mt-1"
              >
                {{ item.extruder.config.nozzle_diameter }}mm
              </span>
            </template>
          </v-select>
        </div>
      </v-col>
      <v-col
        cols="6"
        class="py-0"
      >
        <app-number-input
          v-model.number="pressureAdvance"
          :label="$t('app.general.label.pressure_advance')"
          :disabled="!klippyReady"
          :locked="isMobileViewport"
          :rules="[
            $rules.required,
            $rules.numberValid,
            $rules.numberGreaterThanOrEqual(0)
          ]"
          :extruder="selectedExtruder"
          suffix="s"
          :min="1"
          :max="null"
          :step="1"
          :dec="1"
          :has-spinner="true"
          :spinner-factor="1"
          style="transform: translateY(1px)"
          @keyup.enter.exact="setPa('ADVANCE', pa)"
        />
      </v-col>
      <v-col
        cols="6"
        class="py-0"
      >
        <app-number-input
          v-model.number="smoothTime"
          :label="$t('app.general.label.smooth_time')"
          :disabled="!klippyReady"
          :locked="isMobileViewport"
          :loading="hasWait(`${$waits.onSetPressureAdvance}${extruderStepper?.name ?? ''}`)"
          :rules="[
            $rules.required,
            $rules.numberValid,
            $rules.numberGreaterThanOrEqual(0)
          ]"
          :extruder="selectedExtruder"
          suffix="s"
          :min="1"
          :max="null"
          :step="1"
          :dec="1"
          :has-spinner="true"
          :spinner-factor="1"
          @keyup.enter.exact="setPa('SMOOTH_TIME', st)"
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import ToolheadMixin from '@/mixins/toolhead'
import BrowserMixin from '@/mixins/browser'
import type { ExtruderStepper, Extruder, KnownExtruder } from '@/store/printer/types'

@Component({})
export default class PressureAdvanceAdjust extends Mixins(StateMixin, ToolheadMixin, BrowserMixin) {
  [x: string]: any
  @Prop({ type: Object })
  readonly extruderStepper?: ExtruderStepper

  valid = true

  selectedExtruder = ''

  get extruders () {
    if (this.selectedExtruder === '') {
      this.selectedExtruder = this.$store.state.printer.printer.toolhead.extruder
    }
    const _extruders: { key: string; name: string; extruder: Extruder }[] = []
    const keys = this.$store.getters['printer/getExtruders'] as KnownExtruder[]
    keys.forEach((k) => {
      const e = this.$store.getters['printer/getExtruderByName'](k.key) as Extruder
      if (e) {
        _extruders.push({ key: k.key, name: k.name, extruder: e })
      }
    })
    return _extruders
  }

  get currentExtruder (): string {
    return this.$store.state.printer.printer.toolhead?.extruder
  }

  get pressureAdvance (): number {
    return this.$store.state.printer.printer?.[this.selectedExtruder]?.pressure_advance ?? 0
  }

  pa = -1
  set pressureAdvance (value: number) {
    this.pa = value
  }

  get smoothTime (): number {
    return this.$store.state.printer.printer?.[this.selectedExtruder]?.smooth_time ?? 0.04
  }

  st = -1
  set smoothTime (value: number) {
    this.st = value
  }

  activateExtruder (extruder: string) {
    this.sendGcode(`ACTIVATE_EXTRUDER EXTRUDER=${extruder}`, this.$waits.onExtruderChange)
  }

  setPa (name: string, value: number): void {
    this.sendGcode(`SET_PRESSURE_ADVANCE ${name}=${value} EXTRUDER=${this.selectedExtruder}`, `${this.$waits.onSetPressureAdvance}${this.selectedExtruder}`)
  }
}
</script>

<style scoped>
.no-padding :deep(.v-input__slot) {
  padding-left: 0px !important;
  padding-right: 0px !important;
}

.no-underline .v-select__selections {
  border-bottom: none !important;
  box-shadow: none !important;
}
</style>
