<template>
  <!-- Printer Limits -->
  <div>
    <v-card-text
      v-if="klippyReady"
      class="mb-0 mt-1"
    >
      <v-row>
        <v-col
          cols="12"
        >
          <app-named-slider
            v-model="velocity"
            :label="$t('app.general.label.velocity')"
            :suffix="'mm/s'"
            :reset-value="defaultVelocity"
            :disabled="!klippyReady"
            :loading="hasWait($waits.onSetVelocity)"
            :locked="isMobileViewport"
            :min="0"
            :max="1000"
            :step="10"
            :input-width="150"
            @submit="setVelocity"
          />
        </v-col>
        <v-col
          cols="12"
        >
          <app-named-slider
            v-model="accel"
            :label="$t('app.general.label.acceleration')"
            suffix="mm/s²"
            overridable
            :reset-value="defaultAccel"
            :disabled="!klippyReady"
            :loading="hasWait($waits.onSetAcceleration)"
            :locked="isMobileViewport"
            :min="0"
            :max="100000"
            :step="10"
            :input-width="150"
            @submit="setAccel"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
        >
          <app-named-slider
            v-model="squareCornerVelocity"
            :label="$t('app.general.label.sqv')"
            :suffix="'mm/s'"
            overridable
            :reset-value="defaultSquareCornerVelocity"
            :disabled="!klippyReady"
            :loading="hasWait($waits.onSetSquareCornerVelocity)"
            :locked="isMobileViewport"
            :min="0"
            :max="100"
            :step="1"
            :input-width="150"
            @submit="setSquareCornerVelocity"
          />
        </v-col>
        <v-col
          cols="12"
        >
          <app-named-slider
            v-if="minimumCruiseRatio != null"
            v-model="minimumCruiseRatio"
            :label="$t('app.general.label.minimum_cruise_ratio')"
            suffix="mm/s²"
            overridable
            :reset-value="defaultMinimumCruiseRatio"
            :disabled="!klippyReady"
            :loading="hasWait($waits.onSetMinimumCruiseRatio)"
            :locked="isMobileViewport"
            :min="0"
            :max="1"
            :step="0.1"
            :input-width="150"
            @submit="setMinimumCruiseRatio"
          />
          <app-named-slider
            v-if="accelToDecel != null"
            v-model="accelToDecel"
            :label="$t('app.general.label.accel_to_decel')"
            suffix="mm/s²"
            overridable
            :reset-value="defaultAccelToDecel"
            :disabled="!klippyReady"
            :loading="hasWait($waits.onSetAccelToDecel)"
            :locked="isMobileViewport"
            :min="0"
            :max="100000"
            :step="10"
            :input-width="150"
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

  get defaultVelocity (): number {
    return this.$store.getters['printer/getPrinterSettings']('printer.max_velocity') as number
  }

  get velocity (): number {
    return this.$store.state.printer.printer.toolhead.max_velocity as number
  }

  setVelocity (value: number) {
    if (value !== this.velocity_value) {
      this.velocity_value = value
      this.sendGcode(`SET_VELOCITY_LIMIT VELOCITY=${value}`, this.$waits.onSetVelocity)
    }
  }

  /**
   * Acceleration
   */
  accel_value = -1

  get defaultAccel (): number {
    return this.$store.getters['printer/getPrinterSettings']('printer.max_accel')
  }

  get accel (): number {
    return this.$store.state.printer.printer.toolhead.max_accel as number
  }

  setAccel (value: number) {
    if (value !== this.accel_value) {
      this.accel_value = value
      this.sendGcode(`SET_VELOCITY_LIMIT ACCEL=${value}`, this.$waits.onSetAcceleration)
    }
  }

  /**
   * Acceleration To Deceleration
   */
  accelToDecel_value = -1

  get defaultAccelToDecel (): number {
    const defaultAccelToDecel = this.$store.getters['printer/getPrinterSettings']('printer.max_accel_to_decel') as number | undefined
    return defaultAccelToDecel ?? this.defaultAccel / 2
  }

  get accelToDecel (): number {
    return this.$store.state.printer.printer.toolhead.max_accel_to_decel as number
  }

  setAccelToDecel (value: number) {
    if (value !== this.accelToDecel_value) {
      this.accelToDecel_value = value
      this.sendGcode(`SET_VELOCITY_LIMIT ACCEL_TO_DECEL=${value}`, this.$waits.onSetAccelToDecel)
    }
  }

  /**
   * Minimum Cruise Ratio
   */
  minimumCruiseRatio_value = -1

  get defaultMinimumCruiseRatio (): number {
    const defaultMinimumCruiseRatio = this.$store.getters['printer/getPrinterSettings']('printer.minimum_cruise_ratio') as number | undefined
    return defaultMinimumCruiseRatio ?? 0.5
  }

  get minimumCruiseRatio (): number {
    return this.$store.state.printer.printer.toolhead.minimum_cruise_ratio as number
  }

  setMinimumCruiseRatio (value: number) {
    if (value !== this.minimumCruiseRatio_value) {
      this.minimumCruiseRatio_value = value
      this.sendGcode(`SET_VELOCITY_LIMIT MINIMUM_CRUISE_RATIO=${value}`, this.$waits.onSetMinimumCruiseRatio)
    }
  }

  /**
   * Square Corner Velocity
   */
  squareCornerVelocity_value = -1

  get defaultSquareCornerVelocity (): number {
    return this.$store.getters['printer/getPrinterSettings']('printer.square_corner_velocity') as number || 5
  }

  get squareCornerVelocity () {
    return this.$store.state.printer.printer.toolhead.square_corner_velocity as number
  }

  setSquareCornerVelocity (value: number) {
    if (value !== this.squareCornerVelocity_value) {
      this.squareCornerVelocity_value = value
      this.sendGcode(`SET_VELOCITY_LIMIT SQUARE_CORNER_VELOCITY=${value}`, this.$waits.onSetSquareCornerVelocity)
    }
  }
}
</script>
