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
      <v-col cols="12">
        <v-select
          v-model="selectedExtruder"
          :items="extruders"
          :readonly="printerPrinting"
          :disabled="!klippyReady || printerPrinting"
          item-value="key"
          item-text="name"
          hide-details
          outlined
          dense
          class="mb-4 v-input--x-dense"
        />
      </v-col>
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
          :extruder="selectedExtruder"
          hide-details
          outlined
          dense
          :label="$t('app.general.label.pressure_advance')"
          suffix="s"
          @focus="$event.target.select()"
          @keyup.enter.exact="sendCmd('ADVANCE', pa)"
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
          :extruder="selectedExtruder"
          hide-details
          outlined
          dense
          :label="$t('app.general.label.smooth_time')"
          suffix="s"
          @focus="$event.target.select()"
          @keyup.enter.exact="sendCmd('SMOOTH_TIME', st)"
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

  selectedExtruder = ''
  get extruders () {
    this.selectedExtruder = this.$store.state.printer.printer.toolhead.extruder
    return this.$store.getters['printer/getExtruders']
  }

  pa = 0
  get pressureAdvance (): number {
    this.pa = Math.floor((this.$store.state.printer.printer?.[this.selectedExtruder]?.pressure_advance ?? 0) * 1000) / 1000
    return this.pa
  }

  set pressureAdvance (value: number) {
    this.pa = value
  }

  st = 0
  get smoothTime (): number {
    this.st = Math.floor((this.$store.state.printer.printer?.[this.selectedExtruder]?.smooth_time ?? 0.04) * 1000) / 1000
    return this.st
  }

  set smoothTime (value: number) {
    this.st = value
  }

  sendCmd (name: string, value: number): void {
    this.sendGcode(`SET_PRESSURE_ADVANCE ${name}=${this.pa = value} EXTRUDER=${this.selectedExtruder}`, `${this.$waits.onSetPressureAdvance}${this.selectedExtruder}`)
  }
}
</script>
