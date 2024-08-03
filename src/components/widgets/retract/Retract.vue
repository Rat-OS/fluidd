<template>
  <!-- Firmware Retraction -->
  <div>
    <v-card-text class="mb-0 mt-1">
      <v-row>
        <v-col
          cols="12"
        >
          <app-number-field
            v-model.number="retract_length"
            :reset-value="defaults.retract_length"
            :label="$t('app.general.label.retract_length')"
            :disabled="!klippyReady"
            :locked="isMobileViewport"
            :loading="hasWait($waits.onSetRetractLength)"
            :rules="[
              $rules.required,
              $rules.numberValid,
              $rules.numberGreaterThanOrEqual(0),
              $rules.numberLessThanOrEqual(retract_length_max)
            ]"
            suffix="mm"
            :min="0"
            :max="null"
            :step="0.1"
            :dec="2"
            :has-spinner="true"
            @submit="setRetractLength"
          />
        </v-col>
        <v-col
          cols="12"
        >
          <app-number-field
            v-model.number="unretract_extra_length"
            :reset-value="defaults.unretract_extra_length"
            :label="$t('app.general.label.unretract_extra_length')"
            :disabled="!klippyReady"
            :locked="isMobileViewport"
            :loading="hasWait($waits.onSetUnretractExtraLength)"
            :rules="[
              $rules.required,
              $rules.numberValid,
              $rules.numberGreaterThanOrEqual(0),
              $rules.numberLessThanOrEqual(unretract_extra_length_max)
            ]"
            suffix="mm"
            :min="0"
            :max="null"
            :step="0.1"
            :dec="2"
            :has-spinner="true"
            @submit="setUnRetractExtraLength"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
        >
          <app-number-field
            v-model.number="retract_speed"
            :reset-value="defaults.retract_speed"
            :label="$t('app.general.label.retract_speed')"
            :disabled="!klippyReady"
            :locked="isMobileViewport"
            :loading="hasWait($waits.onSetRetractSpeed)"
            :rules="[
              $rules.required,
              $rules.numberValid,
              $rules.numberGreaterThanOrEqual(0),
              $rules.numberLessThanOrEqual(retract_speed_max)
            ]"
            suffix="mm/s"
            :min="1"
            :max="null"
            :step="5"
            :dec="0"
            :has-spinner="true"
            @submit="setRetractSpeed"
          />
        </v-col>
        <v-col
          cols="12"
        >
          <app-number-field
            v-model.number="unretract_speed"
            :reset-value="defaults.unretract_speed"
            :label="$t('app.general.label.unretract_speed')"
            :disabled="!klippyReady"
            :locked="isMobileViewport"
            :loading="hasWait($waits.onSetUnretractSpeed)"
            :rules="[
              $rules.required,
              $rules.numberValid,
              $rules.numberGreaterThanOrEqual(0),
              $rules.numberLessThanOrEqual(unretract_speed_max)
            ]"
            suffix="mm/s"
            :min="1"
            :max="null"
            :step="5"
            :dec="0"
            :has-spinner="true"
            @submit="setUnretractSpeed"
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
export default class Retract extends Mixins(StateMixin, BrowserMixin) {
  /**
   * Defaults
   */
  get defaults () {
    return this.$store.getters['printer/getPrinterSettings']('firmware_retraction') || {}
  }

  /**
   * Retract Length
   */
  retract_length_value = -1
  current_retract_length_value = -1

  get retract_length () {
    const value = this.$store.state.printer.printer.firmware_retraction.retract_length
    this.retract_length_value = value
    this.current_retract_length_value = value
    return value
  }

  set retract_length (value: number) {
    this.retract_length_value = value
  }

  get retract_length_max () {
    if (this.defaults.retract_length <= 0) return 15
    return Math.round(this.defaults.retract_length * 2 * 100) / 100
  }

  setRetractLength () {
    if (this.retract_length_value !== this.current_retract_length_value) {
      this.current_retract_length_value = this.retract_length_value
      this.sendGcode(`SET_RETRACTION RETRACT_LENGTH=${this.retract_length_value}`, this.$waits.onSetRetractLength)
    }
  }

  /**
   * Retract Speed
   */
  retract_speed_value = -1
  current_retract_speed_value = -1

  get retract_speed () {
    const value = this.$store.state.printer.printer.firmware_retraction.retract_speed
    this.retract_speed_value = value
    this.current_retract_speed_value = value
    return value
  }

  set retract_speed (value: number) {
    this.retract_speed_value = value
  }

  get retract_speed_max () {
    if (this.defaults.retract_speed <= 0) return 100
    return Math.round(this.defaults.retract_speed * 2)
  }

  setRetractSpeed () {
    if (this.retract_speed_value !== this.current_retract_speed_value) {
      this.current_retract_speed_value = this.retract_speed_value
      this.sendGcode(`SET_RETRACTION RETRACT_SPEED=${this.retract_speed_value}`, this.$waits.onSetRetractSpeed)
    }
  }

  /**
   * Unretract Length
   */
  unretract_extra_length_value = -1
  current_unretract_extra_length_value = -1

  get unretract_extra_length () {
    const value = this.$store.state.printer.printer.firmware_retraction.unretract_extra_length
    this.unretract_extra_length_value = value
    this.current_unretract_extra_length_value = value
    return value
  }

  set unretract_extra_length (value: number) {
    this.unretract_extra_length_value = value
  }

  get unretract_extra_length_max () {
    if (this.defaults.unretract_extra_length <= 0) return 15
    return Math.round(this.defaults.unretract_extra_length * 2 * 100) / 100
  }

  setUnRetractExtraLength () {
    if (this.unretract_extra_length_value !== this.current_unretract_extra_length_value) {
      this.current_unretract_extra_length_value = this.unretract_extra_length_value
      this.sendGcode(`SET_RETRACTION UNRETRACT_EXTRA_LENGTH=${this.unretract_extra_length_value}`, this.$waits.onSetUnretractExtraLength)
    }
  }

  /**
   * Unretract Speed
   */
  unretract_speed_value = -1
  current_unretract_speed_value = -1

  get unretract_speed () {
    const value = this.$store.state.printer.printer.firmware_retraction.unretract_speed
    this.unretract_speed_value = value
    this.current_unretract_speed_value = value
    return value
  }

  set unretract_speed (value: number) {
    this.unretract_speed_value = value
  }

  get unretract_speed_max () {
    if (this.defaults.unretract_speed <= 0) return 100
    return Math.round(this.defaults.unretract_speed * 2)
  }

  setUnretractSpeed () {
    if (this.unretract_speed_value !== this.current_unretract_speed_value) {
      this.current_unretract_speed_value = this.unretract_speed_value
      this.sendGcode(`SET_RETRACTION UNRETRACT_SPEED=${this.unretract_speed_value}`, this.$waits.onSetUnretractSpeed)
    }
  }
}
</script>
