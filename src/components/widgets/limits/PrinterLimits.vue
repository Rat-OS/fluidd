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
            @submit="setMinimumCruiseRatio"
          />
          <app-number-input
            v-else-if="accelToDecel != null"
            v-model.number="accelToDecel"
            :reset-value="defaultAccelToDecel"
            :label="$t('app.general.label.accel_to_decel')"
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
  _velocity = -1
  _current_velocity = -1
  get defaultVelocity (): number {
    return this.$store.getters['printer/getPrinterSettings']('printer.max_velocity') as number
  }

  get velocity (): number {
    this._velocity = this.$store.state.printer.printer.toolhead.max_velocity as number
    this._current_velocity = this.$store.state.printer.printer.toolhead.max_velocity as number
    return this.$store.state.printer.printer.toolhead.max_velocity as number
  }

  set velocity (value: number) {
    this._velocity = value
  }

  _accel = -1
  _current_accel = -1
  get defaultAccel (): number {
    return this.$store.getters['printer/getPrinterSettings']('printer.max_accel')
  }

  get accel (): number {
    this._accel = this.$store.state.printer.printer.toolhead.max_accel as number
    this._current_accel = this.$store.state.printer.printer.toolhead.max_accel as number
    return this.$store.state.printer.printer.toolhead.max_accel as number
  }

  set accel (value: number) {
    this._accel = value
  }

  _decel = -1
  _current_decel = -1
  get defaultAccelToDecel (): number {
    const defaultAccelToDecel = this.$store.getters['printer/getPrinterSettings']('printer.max_accel_to_decel') as number | undefined
    return defaultAccelToDecel ?? this.defaultAccel / 2
  }

  get accelToDecel (): number {
    this._decel = this.$store.state.printer.printer.toolhead.max_accel_to_decel as number
    this._current_decel = this.$store.state.printer.printer.toolhead.max_accel_to_decel as number
    return this.$store.state.printer.printer.toolhead.max_accel_to_decel as number
  }

  set accelToDecel (value: number) {
    this._decel = value
  }

  _cruise = -1
  _current_cruise = -1
  get defaultMinimumCruiseRatio (): number {
    const defaultMinimumCruiseRatio = this.$store.getters['printer/getPrinterSettings']('printer.minimum_cruise_ratio') as number | undefined
    return defaultMinimumCruiseRatio ?? 0.5
  }

  get minimumCruiseRatio (): number {
    this._cruise = this.$store.state.printer.printer.toolhead.minimum_cruise_ratio as number
    this._current_cruise = this.$store.state.printer.printer.toolhead.minimum_cruise_ratio as number
    return this.$store.state.printer.printer.toolhead.minimum_cruise_ratio as number
  }

  set minimumCruiseRatio (value: number) {
    this._cruise = value
  }

  _scv = -1
  _current_scv = -1
  get defaultSquareCornerVelocity (): number {
    return this.$store.getters['printer/getPrinterSettings']('printer.square_corner_velocity') as number || 5
  }

  get squareCornerVelocity () {
    this._scv = this.$store.state.printer.printer.toolhead.square_corner_velocity as number
    this._current_scv = this.$store.state.printer.printer.toolhead.square_corner_velocity as number
    return this.$store.state.printer.printer.toolhead.square_corner_velocity as number
  }

  set squareCornerVelocity (value: number) {
    this._scv = value
  }

  setVelocity () {
    if (this._velocity !== this._current_velocity) {
      this._current_velocity = this._velocity
      this.sendGcode(`SET_VELOCITY_LIMIT VELOCITY=${this._velocity}`, this.$waits.onSetVelocity)
    }
  }

  setAccel () {
    if (this._accel !== this._current_accel) {
      this._current_accel = this._accel
      this.sendGcode(`SET_VELOCITY_LIMIT ACCEL=${this._accel}`, this.$waits.onSetAcceleration)
    }
  }

  setAccelToDecel () {
    if (this._decel !== this._current_decel) {
      this._current_decel = this._decel
      this.sendGcode(`SET_VELOCITY_LIMIT ACCEL_TO_DECEL=${this._decel}`, this.$waits.onSetAccelToDecel)
    }
  }

  setMinimumCruiseRatio () {
    if (this._cruise !== this._current_cruise) {
      this._current_cruise = this._cruise
      this.sendGcode(`SET_VELOCITY_LIMIT MINIMUM_CRUISE_RATIO=${this._cruise}`, this.$waits.onSetMinimumCruiseRatio)
    }
  }

  setSquareCornerVelocity () {
    if (this._scv !== this._current_scv) {
      this._current_scv = this._scv
      this.sendGcode(`SET_VELOCITY_LIMIT SQUARE_CORNER_VELOCITY=${this._scv}`, this.$waits.onSetSquareCornerVelocity)
    }
  }
}
</script>
