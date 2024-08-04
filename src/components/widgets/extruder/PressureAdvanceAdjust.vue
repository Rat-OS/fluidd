<template>
  <v-row
    justify="end"
    class="pa-0 mt-1 mb-2"
    style="transform: translateY(-1px);"
  >
    <v-col
      cols="12"
    >
      <app-number-field
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
        suffix="s"
        :min="0"
        :max="null"
        :step="0.01"
        :dec="2"
        :has-spinner="true"
        style="transform: translateY(1px)"
        @submit="setPressureAdvance()"
      />
    </v-col>
    <v-col
      cols="12"
    >
      <app-number-field
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
        suffix="s"
        :min="0"
        :max="0.2"
        :step="0.01"
        :dec="2"
        :has-spinner="true"
        @submit="setSmoothTime()"
      />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import ToolheadMixin from '@/mixins/toolhead'
import BrowserMixin from '@/mixins/browser'
import type { ExtruderStepper } from '@/store/printer/types'

@Component({})
export default class PressureAdvanceAdjust extends Mixins(StateMixin, ToolheadMixin, BrowserMixin) {
  @Prop({ type: Object })
    extruderStepper?: ExtruderStepper

  // ----------------------------
  // Pressure Advance
  // ----------------------------
  pressureAdvance_value = -1
  current_pressureAdvance_value = -1

  get pressureAdvance (): number {
    if (this.extruderStepper) {
      const value = this.extruderStepper?.pressure_advance ?? 0
      this.pressureAdvance_value = value
      this.current_pressureAdvance_value = value
      return value
    } else {
      const value = this.$store.state.printer.printer?.[this.currentExtruder]?.pressure_advance ?? 0
      this.pressureAdvance_value = value
      this.current_pressureAdvance_value = value
      return value
    }
  }

  set pressureAdvance (value: number) {
    this.pressureAdvance_value = value
  }

  setPressureAdvance (): void {
    if (this.pressureAdvance_value !== this.current_pressureAdvance_value) {
      this.current_pressureAdvance_value = this.pressureAdvance_value
      this.sendGcode(`SET_PRESSURE_ADVANCE ADVANCE=${this.pressureAdvance_value} EXTRUDER=${this.currentExtruder}`, `${this.$waits.onSetPressureAdvance}${this.currentExtruder}`)
    }
  }

  // ----------------------------
  // Smooth Time
  // ----------------------------
  smoothTime_value = -1
  current_smoothTime_value = -1

  get smoothTime (): number {
    if (this.extruderStepper) {
      const value = this.extruderStepper?.smooth_time ?? 0.04
      this.smoothTime_value = value
      this.current_smoothTime_value = value
      return value
    } else {
      const value = this.$store.state.printer.printer?.[this.currentExtruder]?.smooth_time ?? 0.04
      this.smoothTime_value = value
      this.current_smoothTime_value = value
      return value
    }
  }

  set smoothTime (value: number) {
    this.smoothTime_value = value
  }

  setSmoothTime (): void {
    if (this.smoothTime_value !== this.current_smoothTime_value) {
      this.current_smoothTime_value = this.smoothTime_value
      this.sendGcode(`SET_PRESSURE_ADVANCE SMOOTH_TIME=${this.smoothTime_value} EXTRUDER=${this.currentExtruder}`, `${this.$waits.onSetPressureAdvance}${this.currentExtruder}`)
    }
  }

  // ----------------------------
  // Common
  // ----------------------------
  get currentExtruder (): string {
    if (this.extruderStepper) {
      const { name } = this.extruderStepper
      return name
    } else {
      if (this.hasMultipleExtruders) {
        return this.$store.state.config.uiSettings.general.selectedExtruder
      } else {
        return this.$store.state.printer.printer.toolhead?.extruder
      }
    }
  }
}
</script>
