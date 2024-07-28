<template>
  <!-- Speed and Flow Adjust -->
  <div>
    <v-card-text class="mb-1 mt-1">
      <v-row>
        <v-col
          cols="12"
          sm="6"
          md="12"
          lg="6"
        >
          <v-text-field
            v-model.number="velocity"
            :disabled="!klippyReady"
            :locked="isMobileViewport"
            :rules="[
              $rules.required,
              $rules.numberValid,
              $rules.numberGreaterThanOrEqual(1),
            ]"
            :reset-value="defaultVelocity"
            :loading="hasWait($waits.onSetVelocity)"
            type="number"
            hide-details
            outlined
            dense
            :label="$t('app.general.label.velocity')"
            suffix="mm/s"
            @focus="$event.target.select()"
            @keyup.enter.exact="setVelocity"
          >
            <template
              #append
            >
              <v-icon
                v-if="!printerPrinting && defaultVelocity !== velocity"
                :disabled="hasWait($waits.onSetVelocity)"
                :color="'secondary'"
                style="transform: translateX(5px) translateY(-2px);;"
                @click="handleResetVelocity"
              >
                $reset
              </v-icon>
            </template>
          </v-text-field>
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="12"
          lg="6"
        >
          <v-text-field
            v-model.number="squareCornerVelocity"
            :disabled="!klippyReady"
            :locked="isMobileViewport"
            :rules="[
              $rules.required,
              $rules.numberValid,
              $rules.numberGreaterThanOrEqual(1),
            ]"
            :reset-value="defaultSquareCornerVelocity"
            :loading="hasWait($waits.onSetSquareCornerVelocity)"
            type="number"
            hide-details
            outlined
            dense
            :label="$t('app.general.label.sqv')"
            suffix="mm/s"
            @focus="$event.target.select()"
            @keyup.enter.exact="setSquareCornerVelocity"
          >
            <template
              #append
            >
              <v-icon
                v-if="!printerPrinting && defaultSquareCornerVelocity !== squareCornerVelocity"
                :disabled="hasWait($waits.onSetVelocity)"
                :color="'secondary'"
                style="transform: translateX(5px) translateY(-2px);;"
                @click="handleResetScv"
              >
                $reset
              </v-icon>
            </template>
          </v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          sm="6"
          md="12"
          lg="6"
        >
          <v-text-field
            v-model.number="accel"
            :disabled="!klippyReady"
            :locked="isMobileViewport"
            :rules="[
              $rules.required,
              $rules.numberValid,
              $rules.numberGreaterThanOrEqual(1),
            ]"
            :reset-value="defaultAccel"
            :loading="hasWait($waits.onSetAcceleration)"
            type="number"
            hide-details
            outlined
            dense
            :label="$t('app.general.label.acceleration')"
            suffix="mm/s"
            @focus="$event.target.select()"
            @keyup.enter.exact="setAccel"
          >
            <template
              #append
            >
              <v-icon
                v-if="!printerPrinting && defaultAccel !== accel"
                :disabled="hasWait($waits.onSetVelocity)"
                :color="'secondary'"
                style="transform: translateX(5px) translateY(-2px);;"
                @click="handleResetAccel"
              >
                $reset
              </v-icon>
            </template>
          </v-text-field>
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="12"
          lg="6"
        >
          <v-text-field
            v-if="minimumCruiseRatio != null"
            v-model.number="minimumCruiseRatio"
            :disabled="!klippyReady"
            :locked="isMobileViewport"
            :rules="[
              $rules.required,
              $rules.numberValid,
              $rules.numberGreaterThanOrEqual(0.01),
              $rules.numberLessThanOrEqual(1)
            ]"
            :reset-value="defaultMinimumCruiseRatio"
            :loading="hasWait($waits.onSetMinimumCruiseRatio)"
            type="number"
            hide-details
            outlined
            dense
            :label="$t('app.general.label.minimum_cruise_ratio')"
            @focus="$event.target.select()"
            @keyup.enter.exact="setMinimumCruiseRatio"
          >
            <template
              #append
            >
              <v-icon
                v-if="!printerPrinting && defaultMinimumCruiseRatio !== minimumCruiseRatio"
                :disabled="hasWait($waits.onSetVelocity)"
                :color="'secondary'"
                style="transform: translateX(5px) translateY(-2px);;"
                @click="handleResetCruiseRatio"
              >
                $reset
              </v-icon>
            </template>
          </v-text-field>
          <v-text-field
            v-else-if="accelToDecel != null"
            v-model.number="accelToDecel"
            :disabled="!klippyReady"
            :locked="isMobileViewport"
            :rules="[
              $rules.required,
              $rules.numberValid,
              $rules.numberGreaterThanOrEqual(1),
            ]"
            :reset-value="defaultAccelToDecel"
            :loading="hasWait($waits.onSetAccelToDecel)"
            type="number"
            hide-details
            outlined
            dense
            :label="$t('app.general.label.minimum_cruise_ratio')"
            suffix="mm/s²"
            @focus="$event.target.select()"
            @keyup.enter.exact="setAccelToDecel"
          >
            <template
              #append
            >
              <v-icon
                v-if="!printerPrinting && defaultAccelToDecel !== accelToDecel"
                :disabled="hasWait($waits.onSetVelocity)"
                :color="'secondary'"
                style="transform: translateX(5px) translateY(-2px);;"
                @click="handleResetDeccel"
              >
                $reset
              </v-icon>
            </template>
          </v-text-field>
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
