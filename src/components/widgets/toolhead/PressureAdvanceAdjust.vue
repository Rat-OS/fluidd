<template>
  <v-form
    ref="form"
    v-model="valid"
    @submit.prevent
  >
    <v-row
      justify="end"
      class="pa-0 mt-4 mb-3"
      style="transform: translateY(-1px);;"
    >
      <v-col
        cols="6"
        class="py-0"
      >
        <app-number-input
          v-model.number="pressureAdvance"
          :label="$t('app.general.label.pressure_advance')"
          :disabled="!klippyReady"
          :locked="isMobileViewport"
          :loading="hasWait(`${$waits.onSetPressureAdvance}${currentExtruder ?? ''}`)"
          :rules="[
            $rules.required,
            $rules.numberValid,
            $rules.numberGreaterThanOrEqual(0)
          ]"
          :extruder="selectedExtruder"
          suffix="s"
          :min="0"
          :max="null"
          :step="0.01"
          :dec="2"
          :has-spinner="true"
          style="transform: translateY(1px)"
          @submit="setPa('ADVANCE', pa)"
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
          :loading="hasWait(`${$waits.onSetPressureAdvance}${currentExtruder ?? ''}`)"
          :rules="[
            $rules.required,
            $rules.numberValid,
            $rules.numberGreaterThanOrEqual(0),
            $rules.numberLessThanOrEqual(0.2)
          ]"
          :extruder="selectedExtruder"
          suffix="s"
          :min="0"
          :max="0.2"
          :step="0.01"
          :dec="2"
          :has-spinner="true"
          @submit="setPa('SMOOTH_TIME', st)"
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import ToolheadMixin from '@/mixins/toolhead'
import BrowserMixin from '@/mixins/browser'

@Component({})
export default class PressureAdvanceAdjust extends Mixins(StateMixin, ToolheadMixin, BrowserMixin) {
  [x: string]: any

  valid = true

  get currentExtruder (): string {
    return this.$store.state.printer.printer.toolhead?.extruder
  }

  get pressureAdvance (): number {
    return this.$store.state.printer.printer?.[this.currentExtruder]?.pressure_advance ?? 0
  }

  pa = -1
  set pressureAdvance (value: number) {
    this.pa = value
  }

  get smoothTime (): number {
    return this.$store.state.printer.printer?.[this.currentExtruder]?.smooth_time ?? 0.04
  }

  st = -1
  set smoothTime (value: number) {
    this.st = value
  }

  setPa (name: string, value: number): void {
    this.sendGcode(`SET_PRESSURE_ADVANCE ${name}=${value} EXTRUDER=${this.currentExtruder}`, `${this.$waits.onSetPressureAdvance}${this.currentExtruder}`)
  }
}
</script>
