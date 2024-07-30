<template>
  <!-- Printer Limits -->
  <div>
    <v-card-text
      v-if="klippyReady"
      class="mb-1 mt-1"
    >
      <v-row>
        <v-col
          cols="12"
          sm="6"
          md="12"
          lg="6"
        >
          <app-number-input
            v-model.number="velocity"
            :reset-value="defaultVelocity"
            :label="$t('app.general.label.velocity')"
            :disabled="!klippyReady"
            :locked="isMobileViewport"
            :loading="hasWait($waits.onSetVelocity)"
            :rules="[
              $rules.required,
              $rules.numberValid,
              $rules.numberGreaterThanOrEqual(1),
            ]"
            :suffix="'mm/s'"
            :min="1"
            :max="null"
            :step="10"
            :dec="0"
            :has-spinner="true"
            @keyup.enter.exact="setVelocity"
            @submit="setVelocity"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="12"
          lg="6"
        >
          <app-number-input
            v-model.number="squareCornerVelocity"
            :reset-value="defaultSquareCornerVelocity"
            :label="$t('app.general.label.sqv')"
            :disabled="!klippyReady"
            :locked="isMobileViewport"
            :loading="hasWait($waits.onSetSquareCornerVelocity)"
            :rules="[
              $rules.required,
              $rules.numberValid,
              $rules.numberGreaterThanOrEqual(1),
            ]"
            :suffix="'mm/s'"
            :min="1"
            :max="null"
            :step="1"
            :dec="2"
            :has-spinner="true"
            @keyup.enter.exact="setSquareCornerVelocity"
            @submit="setSquareCornerVelocity"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          sm="6"
          md="12"
          lg="6"
        >
          <app-number-input
            v-model.number="accel"
            :reset-value="defaultAccel"
            :label="$t('app.general.label.acceleration')"
            :disabled="!klippyReady"
            :locked="isMobileViewport"
            :loading="hasWait($waits.onSetAcceleration)"
            :rules="[
              $rules.required,
              $rules.numberValid,
              $rules.numberGreaterThanOrEqual(1),
            ]"
            suffix="mm/s²"
            :min="1"
            :max="null"
            :step="100"
            :dec="0"
            :has-spinner="true"
            @keyup.enter.exact="setAccel"
            @submit="setAccel"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="12"
          lg="6"
        >
          <app-number-input
            v-if="minimumCruiseRatio != null"
            v-model.number="minimumCruiseRatio"
            :reset-value="defaultMinimumCruiseRatio"
            :label="$t('app.general.label.minimum_cruise_ratio')"
            :disabled="!klippyReady"
            :locked="isMobileViewport"
            :loading="hasWait($waits.onSetMinimumCruiseRatio)"
            :rules="[
              $rules.required,
              $rules.numberValid,
              $rules.numberGreaterThanOrEqual(0.1),
              $rules.numberLessThanOrEqual(1)
            ]"
            suffix="mm/s²"
            :min="0"
            :max="null"
            :step="0.1"
            :dec="2"
            :has-spinner="true"
            @keyup.enter.exact="setMinimumCruiseRatio"
            @submit="setMinimumCruiseRatio"
          />
          <app-number-input
            v-else-if="accelToDecel != null"
            v-model.number="accelToDecel"
            :reset-value="defaultAccelToDecel"
            :label="$t('app.general.label.minimum_cruise_ratio')"
            :disabled="!klippyReady"
            :locked="isMobileViewport"
            :loading="hasWait($waits.onSetAccelToDecel)"
            :rules="[
              $rules.required,
              $rules.numberValid,
              $rules.numberGreaterThanOrEqual(1),
            ]"
            suffix="mm/s²"
            :min="1"
            :max="null"
            :step="10"
            :dec="0"
            :has-spinner="true"
            @keyup.enter.exact="setAccelToDecel"
            @submit="setAccelToDecel"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import BrowserMixin from '@/mixins/browser'

@Component({})
export default class PrinterLimits extends Mixins(StateMixin, BrowserMixin) {
  get defaultVelocity (): number {
    return this.$store.getters['printer/getPrinterSettings']('printer.max_velocity') as number
  }

  get velocity (): number {
    return this.$store.state.printer.printer.toolhead.max_velocity as number
  }

  vel = -1
  set velocity (value: number) {
    this.vel = value
  }

  get defaultAccel (): number {
    return this.$store.getters['printer/getPrinterSettings']('printer.max_accel')
  }

  get accel (): number {
    return this.$store.state.printer.printer.toolhead.max_accel as number
  }

  acc = -1
  set accel (value: number) {
    this.acc = value
  }

  get defaultAccelToDecel (): number {
    const defaultAccelToDecel = this.$store.getters['printer/getPrinterSettings']('printer.max_accel_to_decel') as number | undefined

    return defaultAccelToDecel ?? this.defaultAccel / 2
  }

  get accelToDecel (): number | undefined {
    return this.$store.state.printer.printer.toolhead.max_accel_to_decel as number | undefined
  }

  decc = -1
  set accelToDecel (value: number) {
    this.decc = value
  }

  get defaultMinimumCruiseRatio (): number {
    const defaultMinimumCruiseRatio = this.$store.getters['printer/getPrinterSettings']('printer.minimum_cruise_ratio') as number | undefined

    return defaultMinimumCruiseRatio ?? 0.5
  }

  get minimumCruiseRatio (): number | undefined {
    return this.$store.state.printer.printer.toolhead.minimum_cruise_ratio as number | undefined
  }

  cr = -1
  set minimumCruiseRatio (value: number) {
    this.cr = value
  }

  get defaultSquareCornerVelocity (): number {
    return this.$store.getters['printer/getPrinterSettings']('printer.square_corner_velocity') as number || 5
  }

  get squareCornerVelocity () {
    return this.$store.state.printer.printer.toolhead.square_corner_velocity as number
  }

  scv = -1
  set squareCornerVelocity (value: number) {
    this.scv = value
  }

  handleResetVelocity () {
    if (this.defaultVelocity !== undefined) {
      this.velocity = this.defaultVelocity
      this.setVelocity()
    }
  }

  handleResetScv () {
    if (this.defaultSquareCornerVelocity !== undefined) {
      this.squareCornerVelocity = this.defaultSquareCornerVelocity
      this.setSquareCornerVelocity()
    }
  }

  handleResetAccel () {
    if (this.defaultAccel !== undefined) {
      this.accel = this.defaultAccel
      this.setAccel()
    }
  }

  handleResetCruiseRatio () {
    if (this.defaultMinimumCruiseRatio !== undefined) {
      this.minimumCruiseRatio = this.defaultMinimumCruiseRatio
      this.setMinimumCruiseRatio()
    }
  }

  handleResetDeccel () {
    if (this.defaultAccelToDecel !== undefined) {
      this.accelToDecel = this.defaultAccelToDecel
      this.setAccelToDecel()
    }
  }

  setVelocity () {
    this.sendGcode(`SET_VELOCITY_LIMIT VELOCITY=${this.vel}`, this.$waits.onSetVelocity)
  }

  setAccel () {
    this.sendGcode(`SET_VELOCITY_LIMIT ACCEL=${this.acc}`, this.$waits.onSetAcceleration)
  }

  setAccelToDecel () {
    this.sendGcode(`SET_VELOCITY_LIMIT ACCEL_TO_DECEL=${this.decc}`, this.$waits.onSetAccelToDecel)
  }

  setMinimumCruiseRatio () {
    this.sendGcode(`SET_VELOCITY_LIMIT MINIMUM_CRUISE_RATIO=${this.cr}`, this.$waits.onSetMinimumCruiseRatio)
  }

  setSquareCornerVelocity () {
    this.sendGcode(`SET_VELOCITY_LIMIT SQUARE_CORNER_VELOCITY=${this.scv}`, this.$waits.onSetSquareCornerVelocity)
  }
}
</script>
