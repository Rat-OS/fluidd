<template>
  <v-container
    v-if="hasZOffsetApplyEndstop || hasZOffsetApplyProbe"
    class="pa-0 mt-2 mb-1"
  >
    <v-row>
      <v-col class="secondary--text pr-0 mt-2">
        <v-icon
          small
          class="mr-1"
        >
          $expandVertical
        </v-icon>
        <span>{{ $t('app.general.label.z_offset') }}: <span class="primary--text">{{ zHomingOrigin.toFixed(3) }}mm</span></span>
      </v-col>
      <v-col class="v-subheader justify-end pl-0 mt-0">
        <div class="d-flex align-center">
          <v-btn
            v-if="zHomingOrigin !== 0"
            :loading="hasWait($waits.onZClear)"
            color="error"
            text
            small
            class="px-2 mr-1"
            @click="sendClearZAdjustGcode()"
          >
            <v-icon
              small
            >
              $close
            </v-icon>
            <span
              class="ml-1"
            >
              {{ $t('app.general.btn.clear') }}
            </span>
          </v-btn>
          <v-btn
            v-if="!(!klippyReady || printerPrinting || zHomingOrigin === 0) && (hasZOffsetApplyEndstop !== hasZOffsetApplyProbe)"
            :loading="hasWait($waits.onZApply)"
            color="primary"
            text
            small
            class="px-2"
            @click="handleZOffsetApply"
          >
            <v-icon
              small
            >
              $save
            </v-icon>
            <span
              class="ml-1"
            >
              {{ $t('app.general.btn.save') }}
            </span>
          </v-btn>
        </div>
      </v-col>
    </v-row>
    <v-row
      class="pa-0 mt-0"
      dense
    >
      <v-col cols="12">
        <app-btn-group class="d-flex">
          <app-btn
            v-for="(value, index) in zAdjustValues"
            :key="`zUp-${index}`"
            small
            class="px-0 flex-grow-1"
            :color="value === moveDistance ? 'btncolor' : ''"
            @click="setMovingDistance(value)"
          >
            <span>{{ value }}</span>
          </app-btn>
          <app-btn
            small
            min-width="10"
            :loading="hasWait(`${$waits.onZAdjust}${'-'}`)"
            :disabled="!klippyReady"
            class="px-0 flex-grow-1"
            @click="sendZAdjustGcode('-')"
          >
            <v-icon
              small
            >
              $zDown
            </v-icon>
          </app-btn>
          <app-btn
            small
            min-width="10"
            :loading="hasWait(`${$waits.onZAdjust}${'+'}`)"
            :disabled="!klippyReady"
            class="px-0 flex-grow-1"
            @click="sendZAdjustGcode('+')"
          >
            <v-icon
              small
            >
              $zUp
            </v-icon>
          </app-btn>
        </app-btn-group>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import type { GcodeCommands } from '@/store/printer/types'

@Component({})
export default class ZHeightAdjust extends Mixins(StateMixin) {
  /**
   * Common
   */
  get zHomingOrigin (): number {
    // This is an array of 4 values, representing the homing origin.
    // It should be in the order of; X, Y, Z, E.
    const { homing_origin } = this.$store.state.printer.printer.gcode_move

    const zHomingOrigin: number = homing_origin && homing_origin.length >= 4
      ? +homing_origin[2]
      : 0

    return zHomingOrigin
  }

  /**
   * Set moving distance
   */
  setMovingDistance (value: any) {
    this.moveDistance = value
  }

  get moveDistance () {
    return this.$store.state.config.uiSettings.toolhead.zAdjustDistance ?? this.zAdjustValues[0]
  }

  set moveDistance (value: number) {
    this.$store.dispatch('config/saveByPath', {
      path: 'uiSettings.toolhead.zAdjustDistance',
      value: +value,
      server: true
    })
  }

  get zAdjustValues () {
    return this.$store.state.config.uiSettings.toolhead.zAdjustDistances
  }

  /**
   * Set Z-Offset
   */
  sendZAdjustGcode (direction: '+' | '-') {
    const zHomed = this.$store.getters['printer/getHomedAxes']('z')
    const gcode = `SET_GCODE_OFFSET Z_ADJUST=${direction}${this.moveDistance} MOVE=${+zHomed}`
    this.sendGcode(gcode, `${this.$waits.onZAdjust}${direction + this.moveDistance}`)
  }

  /**
   * Save Z-Offset
   */
  handleZOffsetApply () {
    if (this.hasZOffsetApplyProbe && !this.hasZOffsetApplyEndstop) {
      this.sendGcode('Z_OFFSET_APPLY_PROBE', this.$waits.onZApply)
    }

    if (this.hasZOffsetApplyEndstop && !this.hasZOffsetApplyProbe) {
      this.sendGcode('Z_OFFSET_APPLY_ENDSTOP', this.$waits.onZApply)
    }
  }

  get availableCommands (): GcodeCommands {
    return this.$store.getters['printer/getAvailableCommands'] as GcodeCommands
  }

  get hasZOffsetApplyProbe (): boolean {
    return 'Z_OFFSET_APPLY_PROBE' in this.availableCommands
  }

  get hasZOffsetApplyEndstop (): boolean {
    return 'Z_OFFSET_APPLY_ENDSTOP' in this.availableCommands
  }

  /**
   * Clear Z-Offset
   */
  sendClearZAdjustGcode () {
    const zHomed = this.$store.getters['printer/getHomedAxes']('z')
    const gcode = `SET_GCODE_OFFSET Z=0 MOVE=${+zHomed}`
    this.sendGcode(gcode, this.$waits.onZClear)
  }
}
</script>

<style scoped>
.values_btn-group {
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
        height: 32px;
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

._btn-z {
    font-size: 0.8rem !important;
    font-weight: 400;
    max-height: 32px;
}
</style>
