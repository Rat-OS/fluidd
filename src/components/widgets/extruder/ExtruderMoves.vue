<template>
  <v-form
    ref="form"
    v-model="valid"
    @submit.prevent
  >
    <v-row>
      <v-col
        cols="12"
      >
        <app-number-field
          v-model.number="extrudeLength"
          :label="$t('app.general.label.extrude_length')"
          :disabled="!klippyReady || selectedExtruder == '' || selectedExtruder == undefined"
          :rules="[
            $rules.required,
            $rules.numberValid,
            $rules.numberGreaterThanOrEqual(0.1),
            maxExtrudeLengthRule
          ]"
          suffix="mm"
          :min="1"
          :max="null"
          :step="1"
          :dec="1"
          :has-spinner="true"
          :quick-selectors="extrudeLengths"
          @change="setExtrudeLength"
        />
      </v-col>
      <v-col
        cols="12"
      >
        <app-number-field
          v-model.number="extrudeSpeed"
          :label="$t('app.general.label.extrude_speed')"
          :disabled="!klippyReady || selectedExtruder == '' || selectedExtruder == undefined"
          :rules="[
            $rules.required,
            $rules.numberValid,
            $rules.numberGreaterThanOrEqual(0.1),
            maxExtrudeSpeedRule
          ]"
          suffix="mm/s"
          :min="1"
          :max="null"
          :step="1"
          :dec="1"
          :has-spinner="true"
          :quick-selectors="extrudeSpeeds"
          @change="setExtrudeSpeed"
        />
      </v-col>
    </v-row>
    <v-row
      justify="end"
      class="pa-0 mt-1 mb-0"
    >
      <v-col>
        <app-btn-group
          class="app-toolchanger-control d-flex"
          :class="{
            [$vuetify.theme.dark ? 'theme--dark': 'theme--light']: true,
          }"
        >
          <app-btn
            min-width="10"
            :disabled="!klippyReady || !selectedExtruderReady || !valid"
            class="px-0 flex-grow-1"
            :loading="hasWait($waits.onRetract)"
            @click="sendRetractGcode(extrudeLength, extrudeSpeed, $waits.onRetract)"
          >
            <v-icon>$up</v-icon>
            {{ $t('app.general.btn.retract') }}
            <v-icon>$up</v-icon>
          </app-btn>
          <app-btn
            min-width="10"
            :disabled="!klippyReady || !selectedExtruderReady || !valid"
            class="px-0 flex-grow-1"
            :loading="hasWait($waits.onExtrude)"
            @click="sendExtrudeGcode(extrudeLength, extrudeSpeed, $waits.onExtrude)"
          >
            <v-icon>$down</v-icon>
            {{ $t('app.general.btn.extrude') }}
            <v-icon>$down</v-icon>
          </app-btn>
        </app-btn-group>
      </v-col>
    </v-row>
    <v-row
      v-if="!activeExtruderReady && (idexCopy || idexMirror)"
      justify="center"
      class="pa-0 ma-0"
    >
      <v-col
        cols="12"
        class="pa-0 ma-0"
      >
        <div
          class="text-center pa-0 ma-0"
          :class="'text--disabled'"
        >
          <p
            class="pa-0 ma-0"
            style="font-size: 14px; color"
            v-html="'One or both extruder below extrusion temp!'"
          />
        </div>
      </v-col>
    </v-row>
  </v-form>
</template>

<script lang="ts">
import { Component, Mixins, Ref } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import ToolheadMixin from '@/mixins/toolhead'
import type { VForm } from '@/types'

@Component({})
export default class ExtruderMoves extends Mixins(StateMixin, ToolheadMixin) {
  @Ref('form')
  readonly form!: VForm

  valid = true

  /**
   * Extrude Length
   */
  _extrudeLength = -1

  get extrudeLength () {
    const defaultExtrudeLength = this.$store.state.config.uiSettings.extruder.defaultExtrudeLength
    if (this._extrudeLength === -1 && defaultExtrudeLength > 0) {
      this.setExtrudeLength(defaultExtrudeLength)
    }
    const extrudeLength = this.$store.state.config.uiSettings.extruder.extrudeLength
    return extrudeLength
  }

  set extrudeLength (value: number) {
    this.$store.dispatch('config/saveByPath', {
      path: 'uiSettings.extruder.extrudeLength',
      value: +value,
      server: true
    })
  }

  setExtrudeLength (value: number): void {
    this.extrudeLength = value
    this._extrudeLength = value
  }

  get extrudeLengths () {
    const extrudeLengths = this.$store.state.config.uiSettings.extruder.extrudeLengths
    return [...extrudeLengths].sort((a, b) => {
      return b - a
    })
  }

  /**
   * Extrude Speed
   */
  _extrudeSpeed = -1

  get extrudeSpeed () {
    const defaultExtrudeSpeed = this.$store.state.config.uiSettings.extruder.defaultExtrudeSpeed
    if (this._extrudeSpeed === -1 && defaultExtrudeSpeed > 0) {
      this.setExtrudeSpeed(defaultExtrudeSpeed)
    }
    const extrudeSpeed = this.$store.state.config.uiSettings.extruder.extrudeSpeed
    return extrudeSpeed
  }

  set extrudeSpeed (value: number) {
    this.$store.dispatch('config/saveByPath', {
      path: 'uiSettings.extruder.extrudeSpeed',
      value: +value,
      server: true
    })
  }

  setExtrudeSpeed (value: number): void {
    this.extrudeSpeed = value
    this._extrudeSpeed = value
  }

  get extrudeSpeeds () {
    const extrudeSpeeds = this.$store.state.config.uiSettings.extruder.extrudeSpeeds
    return [...extrudeSpeeds].sort((a, b) => {
      return b - a
    })
  }

  /**
   * Common
   */
  maxExtrudeLengthRule (value: number) {
    return this.$rules.numberLessThanOrEqual(this.maxExtrudeLength)(value)
  }

  maxExtrudeSpeedRule (value: number) {
    return this.$rules.numberLessThanOrEqual(this.maxExtrudeSpeed)(value)
  }

  sendRetractGcode (amount: number, rate: number, wait?: string) {
    if (this.valid) {
      const activeExtruder = this.$store.state.printer.printer.toolhead.extruder || 'extruder'
      if (!(this.isIdex && (this.idexCopy || this.idexMirror)) && activeExtruder !== this.selectedExtruder) {
        this.sendGcode(`ACTIVATE_EXTRUDER EXTRUDER=${this.selectedExtruder}`, wait)
      }
      const gcode = `G1 E-${amount} F${rate * 60}`
      this.sendGcode('M83', wait)
      this.sendGcode(gcode, wait)
      if (!(this.isIdex && (this.idexCopy || this.idexMirror)) && activeExtruder !== this.selectedExtruder) {
        this.sendGcode(`ACTIVATE_EXTRUDER EXTRUDER=${activeExtruder}`, wait)
      }
    }
  }

  sendExtrudeGcode (amount: number, rate: number, wait?: string) {
    if (this.valid) {
      const activeExtruder = this.$store.state.printer.printer.toolhead.extruder || 'extruder'
      if (!(this.isIdex && (this.idexCopy || this.idexMirror)) && activeExtruder !== this.selectedExtruder) {
        this.sendGcode(`ACTIVATE_EXTRUDER EXTRUDER=${this.selectedExtruder}`, wait)
      }
      const gcode = `G1 E${amount} F${rate * 60}`
      this.sendGcode('M83', wait)
      this.sendGcode(gcode, wait)
      if (!(this.isIdex && (this.idexCopy || this.idexMirror)) && activeExtruder !== this.selectedExtruder) {
        this.sendGcode(`ACTIVATE_EXTRUDER EXTRUDER=${activeExtruder}`, wait)
      }
    }
  }

  mounted () {
    this.form.validate()
  }
}
</script>

<style lang="scss" scoped>
  @import 'vuetify/src/styles/styles.sass';

  @include theme(app-toolchanger-control) using ($material) {
    .extruder-color {
      border-color: black;
    }
  }

  .app-toolchanger-control .extruder-color {
    width: 15px;
    height: 15px;
    border-width: 1px;
    border-style: solid;
    border-radius: 50%;

    &.active {
      border-color: black;
    }
  }
</style>
