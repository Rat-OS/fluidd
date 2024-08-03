<template>
  <v-form
    ref="form"
    v-model="valid"
    @submit.prevent
  >
    <v-row
      justify="end"
      class="pa-0 mt-1 mb-0 pt-0"
    >
      <v-col cols="12">
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
        />
      </v-col>
      <v-col
        cols="12"
        class="pt-0"
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
        />
      </v-col>
    </v-row>
    <v-row
      justify="end"
      class="mt-0 mb-0 mt-0 pt-0"
    >
      <v-col
        cols="6"
        class="py-0 mt-0 mb-0"
      >
        <v-item-group class="_btn-group">
          <v-btn
            v-for="value in extrudeLengthsSorted"
            :key="value"
            :disabled="printerPrinting"
            dense
            class="_btn-e flex-grow-1 px-0"
            @click="setExtrudeLength({ value })"
          >
            {{ value }}
          </v-btn>
        </v-item-group>
      </v-col>
      <v-col
        cols="6"
        class="py-0 mt-0 mb-0"
      >
        <v-item-group class="_btn-group">
          <v-btn
            v-for="value in extrudeSpeedsSorted"
            :key="value"
            :disabled="printerPrinting"
            dense
            class="_btn-e flex-grow-1 px-0"
            @click="setExtrudeSpeed({ value })"
          >
            {{ value }}
          </v-btn>
        </v-item-group>
      </v-col>
    </v-row>
    <v-row
      justify="end"
      class="pa-0 mt-0 mb-0"
    >
      <v-col cols="6">
        <app-btn
          :disabled="!klippyReady || !selectedExtruderReady || !valid"
          block
          small
          :loading="hasWait($waits.onRetract)"
          @click="sendRetractGcode(extrudeLength, extrudeSpeed, $waits.onRetract)"
        >
          {{ $t('app.general.btn.retract') }}
          <v-icon>$chevronUp</v-icon>
        </app-btn>
      </v-col>
      <v-col cols="6">
        <app-btn
          :disabled="!klippyReady || !selectedExtruderReady || !valid"
          block
          small
          :loading="hasWait($waits.onExtrude)"
          @click="sendExtrudeGcode(extrudeLength, extrudeSpeed, $waits.onExtrude)"
        >
          {{ $t('app.general.btn.extrude') }}
          <v-icon>$chevronDown</v-icon>
        </app-btn>
      </v-col>
    </v-row>
    <v-row
      v-if="!activeExtruderReady && (idexCopy || idexMirror)"
      justify="center"
      class="pa-0 mt-0 mb-0"
    >
      <v-col
        cols="12"
        class="pa-0"
      >
        <div
          class="text-center pa-0 mt-0 mb-0"
          :class="'text--disabled'"
        >
          <p
            class="mb-0"
            style="font-size: 14px"
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
  get extrudeLength () {
    const extrudeLength = this.$store.state.config.uiSettings.toolhead.extrudeLength
    const value = extrudeLength === -1
      ? this.$store.state.config.uiSettings.general.defaultExtrudeLength
      : extrudeLength
    return value
  }

  set extrudeLength (value: number) {
    this.$store.dispatch('config/saveByPath', {
      path: 'uiSettings.toolhead.extrudeLength',
      value,
      server: false
    })
  }

  setExtrudeLength (params: { value: number }): void {
    this.extrudeLength = params.value
  }

  get extrudeLengths () {
    return this.$store.state.config.uiSettings.general.extrudeLengths
  }

  get extrudeLengthsSorted () {
    return [...this.extrudeLengths].sort((a, b) => {
      return b - a
    })
  }

  /**
   * Extrude Speed
   */
  get extrudeSpeed () {
    const extrudeSpeed = this.$store.state.config.uiSettings.toolhead.extrudeSpeed
    const value = extrudeSpeed === -1
      ? this.$store.state.config.uiSettings.general.defaultExtrudeSpeed
      : extrudeSpeed
    return value
  }

  set extrudeSpeed (value: number) {
    this.$store.dispatch('config/saveByPath', {
      path: 'uiSettings.toolhead.extrudeSpeed',
      value,
      server: false
    })
  }

  setExtrudeSpeed (params: { value: number }): void {
    this.extrudeSpeed = params.value
  }

  get extrudeSpeeds () {
    return this.$store.state.config.uiSettings.general.extrudeSpeeds
  }

  get extrudeSpeedsSorted () {
    return [...this.extrudeSpeeds].sort((a, b) => {
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

<style scoped>
._btn-group {
    border-radius: 4px;
    display: inline-flex;
    flex-wrap: nowrap;
    max-width: 100%;
    min-width: 100%;
    width: 100%;

    .v-btn {
        border-radius: 0;
        border-color: rgba(255, 255, 255, 0.12);
        border-style: solid;
        border-width: thin;
        box-shadow: none;
        height: 28px;
        min-width: auto !important;
    }

    .v-btn:first-child {
        border-top-left-radius: inherit;
        border-bottom-left-radius: inherit;
    }

    .v-btn:last-child {
        border-top-right-radius: inherit;
        border-bottom-right-radius: inherit;
    }

    .v-btn:not(:first-child) {
        border-left-width: 0;
    }
}

._btn-e {
    font-size: 0.8rem !important;
    max-height: 24px;
}
</style>
