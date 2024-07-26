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
            color="warning"
            text
            small
            plain
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
            color="primary"
            text
            small
            plain
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
      <v-col
        cols="12"
      >
        <div class="d-flex align-center">
          <v-item-group class="_btn-group">
            <v-btn
              v-for="(value, index) in zAdjustValues"
              :key="`zUp-${index}`"
              :loading="hasWait($waits.onZAdjust)"
              small
              class="_btn-z flex-grow-1 px-1"
              @click="sendZAdjustGcode('+', value)"
            >
              <span>&plus;{{ value }}</span>
              <v-icon
                v-if="index === zAdjustValues.length - 1"
                left
                small
                class="mr-n1 ml-1"
              >
                $zUp
              </v-icon>
            </v-btn>
          </v-item-group>
        </div>
      </v-col>
      <v-col
        cols="12"
      >
        <v-item-group
          class="_btn-group"
        >
          <v-btn
            v-for="(value, index) in zAdjustValues"
            :key="`zDown-${index}`"
            :loading="hasWait($waits.onZAdjust)"
            small
            class="_btn-z flex-grow-1 px-1"
            @click="sendZAdjustGcode('-', value)"
          >
            <span>&minus;{{ value }}</span>
            <v-icon
              v-if="index === zAdjustValues.length - 1"
              left
              small
              class="mr-n1 ml-1"
            >
              $zDown
            </v-icon>
          </v-btn>
        </v-item-group>
      </v-col>
    </v-row>
    <!-- <v-divider
      class="mt-5"
    /> -->
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import type { GcodeCommands } from '@/store/printer/types'

@Component({})
export default class ZHeightAdjust extends Mixins(StateMixin) {
  moveDistanceValue: number | null = null

  get zHomingOrigin (): number {
    // This is an array of 4 values, representing the homing origin.
    // It should be in the order of; X, Y, Z, E.
    const { homing_origin } = this.$store.state.printer.printer.gcode_move

    const zHomingOrigin: number = homing_origin && homing_origin.length >= 4
      ? +homing_origin[2]
      : 0

    return zHomingOrigin
  }

  get zAdjustValues () {
    return this.$store.state.config.uiSettings.general.zAdjustDistances
  }

  get moveDistance () {
    return this.moveDistanceValue || this.zAdjustValues[0]
  }

  set moveDistance (value: number) {
    this.moveDistanceValue = value
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
   * Send a Z adjust gcode script.
   */
  sendZAdjustGcode (direction: '+' | '-', zValue: any) {
    const zHomed = this.$store.getters['printer/getHomedAxes']('z')
    const gcode = `SET_GCODE_OFFSET Z_ADJUST=${direction}${zValue} MOVE=${+zHomed}`
    this.sendGcode(gcode, this.$waits.onZAdjust)
  }

  /**
   * Clear Z adjust gcode script.
   */
  sendClearZAdjustGcode () {
    const zHomed = this.$store.getters['printer/getHomedAxes']('z')
    const gcode = `SET_GCODE_OFFSET Z=0 MOVE=${+zHomed}`
    this.sendGcode(gcode, this.$waits.onZClear)
  }

  handleZOffsetApply () {
    if (this.hasZOffsetApplyProbe && !this.hasZOffsetApplyEndstop) {
      this.sendGcode('Z_OFFSET_APPLY_PROBE')
    }

    if (this.hasZOffsetApplyEndstop && !this.hasZOffsetApplyProbe) {
      this.sendGcode('Z_OFFSET_APPLY_ENDSTOP')
    }
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

._btn-z {
    font-size: 0.8rem !important;
    font-weight: 400;
    max-height: 28px;
}
</style>
