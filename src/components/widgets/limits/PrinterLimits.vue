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
  /**
   * Velocity
   */
  velocity_value = -1
  current_velocity_value = -1

  get defaultVelocity (): number {
    return this.$store.getters['printer/getPrinterSettings']('printer.max_velocity') as number
  }

  get velocity (): number {
    const value = this.$store.state.printer.printer.toolhead.max_velocity as number
    this.velocity_value = value
    this.current_velocity_value = value
    return value
  }

  set velocity (value: number) {
    this.velocity_value = value
  }

  setVelocity () {
    if (this.velocity_value !== this.current_velocity_value) {
      this.current_velocity_value = this.velocity_value
      this.sendGcode(`SET_VELOCITY_LIMIT VELOCITY=${this.velocity_value}`, this.$waits.onSetVelocity)
    }
  }

  /**
   * Acceleration
   */
  accel_value = -1
  current_accel_value = -1

  get defaultAccel (): number {
    return this.$store.getters['printer/getPrinterSettings']('printer.max_accel')
  }

  get accel (): number {
    const value = this.$store.state.printer.printer.toolhead.max_accel as number
    this.accel_value = value
    this.current_accel_value = value
    return value
  }

  set accel (value: number) {
    this.accel_value = value
  }

  setAccel () {
    if (this.accel_value !== this.current_accel_value) {
      this.current_accel_value = this.accel_value
      this.sendGcode(`SET_VELOCITY_LIMIT ACCEL=${this.accel_value}`, this.$waits.onSetAcceleration)
    }
  }

  /**
   * Acceleration To Deceleration
   */
  accelToDecel_value = -1
  current_accelToDecel_value = -1

  get defaultAccelToDecel (): number {
    const defaultAccelToDecel = this.$store.getters['printer/getPrinterSettings']('printer.max_accel_to_decel') as number | undefined
    return defaultAccelToDecel ?? this.defaultAccel / 2
  }

  get accelToDecel (): number {
    const value = this.$store.state.printer.printer.toolhead.max_accel_to_decel as number
    this.accelToDecel_value = value
    this.current_accelToDecel_value = value
    return value
  }

  set accelToDecel (value: number) {
    this.accelToDecel_value = value
  }

  setAccelToDecel () {
    if (this.accelToDecel_value !== this.current_accelToDecel_value) {
      this.current_accelToDecel_value = this.accelToDecel_value
      this.sendGcode(`SET_VELOCITY_LIMIT ACCEL_TO_DECEL=${this.accelToDecel_value}`, this.$waits.onSetAccelToDecel)
    }
  }

  /**
   * Minimum Cruise Ratio
   */
  minimumCruiseRatio_value = -1
  current_minimumCruiseRatio_value = -1

  get defaultMinimumCruiseRatio (): number {
    const defaultMinimumCruiseRatio = this.$store.getters['printer/getPrinterSettings']('printer.minimum_cruise_ratio') as number | undefined
    return defaultMinimumCruiseRatio ?? 0.5
  }

  get minimumCruiseRatio (): number {
    const value = this.$store.state.printer.printer.toolhead.minimum_cruise_ratio as number
    this.minimumCruiseRatio_value = value
    this.current_minimumCruiseRatio_value = value
    return value
  }

  set minimumCruiseRatio (value: number) {
    this.minimumCruiseRatio_value = value
  }

  setMinimumCruiseRatio () {
    if (this.minimumCruiseRatio_value !== this.current_minimumCruiseRatio_value) {
      this.current_minimumCruiseRatio_value = this.minimumCruiseRatio_value
      this.sendGcode(`SET_VELOCITY_LIMIT MINIMUM_CRUISE_RATIO=${this.minimumCruiseRatio_value}`, this.$waits.onSetMinimumCruiseRatio)
    }
  }

  /**
   * Square Corner Velocity
   */
  squareCornerVelocity_value = -1
  current_squareCornerVelocity_value = -1

  get defaultSquareCornerVelocity (): number {
    return this.$store.getters['printer/getPrinterSettings']('printer.square_corner_velocity') as number || 5
  }

  get squareCornerVelocity () {
    const value = this.$store.state.printer.printer.toolhead.square_corner_velocity as number
    this.squareCornerVelocity_value = value
    this.current_squareCornerVelocity_value = value
    return value
  }

  set squareCornerVelocity (value: number) {
    this.squareCornerVelocity_value = value
  }

  setSquareCornerVelocity () {
    if (this.squareCornerVelocity_value !== this.current_squareCornerVelocity_value) {
      this.current_squareCornerVelocity_value = this.squareCornerVelocity_value
      this.sendGcode(`SET_VELOCITY_LIMIT SQUARE_CORNER_VELOCITY=${this.squareCornerVelocity_value}`, this.$waits.onSetSquareCornerVelocity)
    }
  }
}
</script>
