<template>
  <v-form
    ref="form"
    v-model="valid"
    @submit.prevent
  >
    <v-row
      justify="end"
      class="pa-0 mt-4 mb-3"
    >
      <v-col cols="6">
        <v-text-field
          v-model.number="pressureAdvance"
          :disabled="!klippyReady"
          :loading="hasWait(`${$waits.onSetPressureAdvance}${extruderStepper?.name ?? ''}`)"
          :locked="isMobileViewport"
          :rules="[
            $rules.required,
            $rules.numberValid,
            $rules.numberGreaterThanOrEqual(0)
          ]"
          type="number"
          hide-details
          outlined
          dense
          :label="$t('app.general.label.pressure_advance')"
          suffix="s"
          @focus="$event.target.select()"
          @keyup.enter.exact="handleSetPressureAdvance"
        />
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model.number="smoothTime"
          :disabled="!klippyReady"
          :loading="hasWait(`${$waits.onSetPressureAdvance}${extruderStepper?.name ?? ''}`)"
          :locked="isMobileViewport"
          :rules="[
            $rules.required,
            $rules.numberValid,
            $rules.numberGreaterThanOrEqual(0)
          ]"
          type="number"
          hide-details
          outlined
          dense
          :label="$t('app.general.label.smooth_time')"
          suffix="s"
          @focus="$event.target.select()"
          @keyup.enter.exact="handleSetSmoothTime"
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
import type { ExtruderStepper } from '@/store/printer/types'

@Component({})
export default class PressureAdvanceAdjust extends Mixins(StateMixin, ToolheadMixin, BrowserMixin) {
  @Prop({ type: Object })
  readonly extruderStepper?: ExtruderStepper

  valid = true

  get pressureAdvance () {
    const pressure_advance = this.selectedExtruderStepper?.pressure_advance || 0
    return pressure_advance
  }

  pa = this.selectedExtruderStepper?.pressure_advance || 0
  set pressureAdvance (value: number) {
    this.pa = value
  }

  get smoothTime () {
    const smooth_time = this.selectedExtruderStepper?.smooth_time || 0
    return smooth_time
  }

  st = this.selectedExtruderStepper?.smooth_time || 0
  set smoothTime (value: number) {
    this.st = value
  }

  get selectedExtruderStepper () {
    return this.extruderStepper ?? this.activeExtruder
  }

  handleSetPressureAdvance () {
    this.sendSetPressureAdvance('ADVANCE', this.pa)
  }

  handleSetSmoothTime () {
    this.sendSetPressureAdvance('SMOOTH_TIME', this.st)
  }

  sendSetPressureAdvance (arg: string, val: number) {
    if (this.extruderStepper) {
      const { name } = this.extruderStepper
      this.sendGcode(`SET_PRESSURE_ADVANCE ${arg}=${val} EXTRUDER=${name}`, `${this.$waits.onSetPressureAdvance}${name}`)
    } else {
      this.sendGcode(`SET_PRESSURE_ADVANCE ${arg}=${val}`, this.$waits.onSetPressureAdvance)
    }
  }
}
</script>
