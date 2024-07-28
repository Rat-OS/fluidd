<template>
  <v-form
    ref="form"
    v-model="valid"
    @submit.prevent
  >
    <v-row
      justify="end"
      class="pa-0 mt-2 mb-0"
    >
      <v-col cols="6">
        <v-text-field
          v-model.number="extrudeLength"
          :disabled="!klippyReady || !activeExtruder"
          :rules="[
            $rules.required,
            $rules.numberValid,
            $rules.numberGreaterThanOrEqual(0.1),
            maxExtrudeLengthRule
          ]"
          type="number"
          hide-details
          outlined
          dense
          :label="$t('app.general.label.extrude_length')"
          suffix="mm"
          @focus="$event.target.select()"
        />
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model.number="extrudeSpeed"
          :disabled="!klippyReady || !activeExtruder"
          :rules="[
            $rules.required,
            $rules.numberValid,
            $rules.numberGreaterThanOrEqual(0.1),
            maxExtrudeSpeedRule
          ]"
          type="number"
          hide-details
          outlined
          dense
          :label="$t('app.general.label.extrude_speed')"
          suffix="mm/s"
          @focus="$event.target.select()"
        />
      </v-col>
    </v-row>
    <v-row
      justify="end"
      class="mt-0 mb-0"
    >
      <v-col
        cols="6"
        class="py-0 mt-0 mb-0"
      >
        <v-item-group class="_btn-group">
          <v-btn
            v-for="value in extrudeLengths"
            :key="value"
            :disabled="printerIsPrinting"
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
            v-for="value in extrudeSpeeds"
            :key="value"
            :disabled="printerIsPrinting"
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
          :disabled="!klippyReady || !extruderReady || !valid"
          block
          small
          @click="sendRetractGcode(extrudeLength, extrudeSpeed, $waits.onExtrude)"
        >
          {{ $t('app.general.btn.retract') }}
          <v-icon>$chevronUp</v-icon>
        </app-btn>
      </v-col>
      <v-col cols="6">
        <app-btn
          :disabled="!klippyReady || !extruderReady || !valid"
          block
          small
          @click="sendExtrudeGcode(extrudeLength, extrudeSpeed, $waits.onExtrude)"
        >
          {{ $t('app.general.btn.extrude') }}
          <v-icon>$chevronDown</v-icon>
        </app-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script lang="ts">
import { Component, Mixins, Ref, Watch } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import ToolheadMixin from '@/mixins/toolhead'
import type { VForm } from '@/types'

@Component({})
export default class ExtruderMoves extends Mixins(StateMixin, ToolheadMixin) {
  @Ref('form')
  readonly form!: VForm

  valid = true

  get printerIsPrinting () {
    return this.printerState === 'printing'
  }

  get extrudeLengths () {
    return this.$store.state.config.uiSettings.general.extrudeLengths
  }

  get extrudeSpeeds () {
    return this.$store.state.config.uiSettings.general.extrudeSpeeds
  }

  get extrudeSpeed () {
    const extrudeSpeed = this.$store.state.config.uiSettings.toolhead.extrudeSpeed

    return extrudeSpeed === -1
      ? this.$store.state.config.uiSettings.general.defaultExtrudeSpeed
      : extrudeSpeed
  }

  set extrudeSpeed (value: number) {
    this.$store.dispatch('config/saveByPath', {
      path: 'uiSettings.toolhead.extrudeSpeed',
      value,
      server: false
    })
  }

  get extrudeLength () {
    const extrudeLength = this.$store.state.config.uiSettings.toolhead.extrudeLength

    return extrudeLength === -1
      ? this.$store.state.config.uiSettings.general.defaultExtrudeLength
      : extrudeLength
  }

  set extrudeLength (value: number) {
    this.$store.dispatch('config/saveByPath', {
      path: 'uiSettings.toolhead.extrudeLength',
      value,
      server: false
    })
  }

  @Watch('activeExtruder')
  activeExtruderChanged () {
    this.form.validate()
  }

  maxExtrudeLengthRule (value: number) {
    return this.$rules.numberLessThanOrEqual(this.maxExtrudeLength)(value)
  }

  maxExtrudeSpeedRule (value: number) {
    return this.$rules.numberLessThanOrEqual(this.maxExtrudeSpeed)(value)
  }

  sendRetractGcode (amount: number, rate: number, wait?: string) {
    if (this.valid) {
      const gcode = `G1 E-${amount} F${rate * 60}`
      this.sendGcode('M83', wait)
      this.sendGcode(gcode, wait)
    }
  }

  sendExtrudeGcode (amount: number, rate: number, wait?: string) {
    if (this.valid) {
      const gcode = `G1 E${amount} F${rate * 60}`
      this.sendGcode('M83', wait)
      this.sendGcode(gcode, wait)
    }
  }

  setExtrudeLength (params: { value: number }): void {
    this.extrudeLength = params.value
  }

  setExtrudeSpeed (params: { value: number }): void {
    this.extrudeSpeed = params.value
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
