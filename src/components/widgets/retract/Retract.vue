<template>
  <!-- Firmware Retraction -->
  <div>
    <v-card-text class="mb-1 mt-1">
      <v-row>
        <v-col
          cols="12"
          sm="6"
          md="12"
          lg="6"
        >
          <app-number-input
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
            :min="1"
            :max="null"
            :step="10"
            :dec="10"
            :has-spinner="true"
            :spinner-factor="1"
            @keyup.enter.exact="setRetractLength"
            @submit="setRetractLength"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="12"
          lg="6"
        >
          <app-number-input
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
            :min="1"
            :max="null"
            :step="10"
            :dec="10"
            :has-spinner="true"
            :spinner-factor="1"
            @keyup.enter.exact="setUnRetractExtraLength"
            @submit="setUnRetractExtraLength"
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
            :step="10"
            :dec="10"
            :has-spinner="true"
            :spinner-factor="1"
            @keyup.enter.exact="setRetractSpeed"
            @submit="setRetractSpeed"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="12"
          lg="6"
        >
          <app-number-input
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
            :step="10"
            :dec="10"
            :has-spinner="true"
            :spinner-factor="1"
            @keyup.enter.exact="setUnretractSpeed"
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
  get retract_length () {
    return this.$store.state.printer.printer.firmware_retraction.retract_length
  }

  rl = -1
  set retract_length (value: number) {
    this.rl = value
  }

  get retract_length_max () {
    if (this.defaults.retract_length <= 0) return 15
    return Math.round(this.defaults.retract_length * 2 * 100) / 100
  }

  get retract_speed () {
    return this.$store.state.printer.printer.firmware_retraction.retract_speed
  }

  rs = -1
  set retract_speed (value: number) {
    this.rs = value
  }

  get retract_speed_max () {
    if (this.defaults.retract_speed <= 0) return 100
    return Math.round(this.defaults.retract_speed * 2)
  }

  get unretract_speed () {
    return this.$store.state.printer.printer.firmware_retraction.unretract_speed
  }

  urs = -1
  set unretract_speed (value: number) {
    this.urs = value
  }

  get unretract_speed_max () {
    if (this.defaults.unretract_speed <= 0) return 100
    return Math.round(this.defaults.unretract_speed * 2)
  }

  get unretract_extra_length () {
    return this.$store.state.printer.printer.firmware_retraction.unretract_extra_length
  }

  uel = -1
  set unretract_extra_length (value: number) {
    this.uel = value
  }

  get unretract_extra_length_max () {
    if (this.defaults.unretract_extra_length <= 0) return 15
    return Math.round(this.defaults.unretract_extra_length * 2 * 100) / 100
  }

  get defaults () {
    return this.$store.getters['printer/getPrinterSettings']('firmware_retraction') || {}
  }

  handleResetRetractLength () {
    if (this.defaults.retract_length !== undefined) {
      this.retract_length = this.defaults.retract_length
      this.setRetractLength()
    }
  }

  handleResetUnretractLength () {
    if (this.defaults.unretract_extra_length !== undefined) {
      this.unretract_extra_length = this.defaults.unretract_extra_length
      this.setUnRetractExtraLength()
    }
  }

  handleResetRetractSpeed () {
    if (this.defaults.retract_speed !== undefined) {
      this.retract_speed = this.defaults.retract_speed
      this.setRetractSpeed()
    }
  }

  handleResetUnretractSpeed () {
    if (this.defaults.unretract_speed !== undefined) {
      this.unretract_speed = this.defaults.unretract_speed
      this.setUnretractSpeed()
    }
  }

  setRetractLength () {
    this.sendGcode(`SET_RETRACTION RETRACT_LENGTH=${this.rl}`, this.$waits.onSetRetractLength)
  }

  setRetractSpeed () {
    this.sendGcode(`SET_RETRACTION RETRACT_SPEED=${this.rs}`, this.$waits.onSetRetractSpeed)
  }

  setUnretractSpeed () {
    this.sendGcode(`SET_RETRACTION UNRETRACT_SPEED=${this.urs}`, this.$waits.onSetUnretractSpeed)
  }

  setUnRetractExtraLength () {
    this.sendGcode(`SET_RETRACTION UNRETRACT_EXTRA_LENGTH=${this.uel}`, this.$waits.onSetUnretractExtraLength)
  }
}
</script>
