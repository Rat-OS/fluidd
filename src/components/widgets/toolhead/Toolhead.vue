<template>
  <div>
    <v-card-text>
      <tool-head-idex-control />
      <tool-change-commands />

      <v-row
        align-content="center"
        justify="center"
      >
        <v-col class="controls-wrapper">
          <template v-if="klippyReady">
            <toolhead-position />
            <toolhead-control-cross v-if="toolheadControlStyle === 'cross'" />
            <toolhead-control-bars v-else-if="toolheadControlStyle === 'bars'" />
            <toolhead-control-circle v-else-if="toolheadControlStyle === 'circle'" />
            <z-height-adjust />
          </template>
        </v-col>

        <v-col class="py-0 mt-0 controls-wrapper">
          <template v-if="klippyReady">
            <pressure-advance-adjust v-if="showPressureAdvance" />
            <extruder-stats />
            <extruder-moves v-if="hasExtruder" />
            <extruder-steppers />
            <speed-and-flow-adjust />
          </template>
        </v-col>
      </v-row>
    </v-card-text>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import ToolheadMixin from '@/mixins/toolhead'
import ToolheadControlCross from './ToolheadControlCross.vue'
import ToolheadControlBars from './ToolheadControlBars.vue'
import ToolheadControlCircle from './ToolheadControlCircle.vue'
import ExtruderMoves from './ExtruderMoves.vue'
import ToolheadPosition from './ToolheadPosition.vue'
import ZHeightAdjust from './ZHeightAdjust.vue'
import SpeedAndFlowAdjust from './SpeedAndFlowAdjust.vue'
import PressureAdvanceAdjust from './PressureAdvanceAdjust.vue'
import ExtruderStats from './ExtruderStats.vue'
import ExtruderSteppers from './ExtruderSteppers.vue'
import ToolChangeCommands from './ToolChangeCommands.vue'
import ToolHeadIdexControl from './ToolHeadIdexControl.vue'
import type { ToolheadControlStyle } from '@/store/config/types'

@Component({
  components: {
    ToolheadControlCross,
    ToolheadControlBars,
    ToolheadControlCircle,
    ExtruderMoves,
    ToolheadPosition,
    ZHeightAdjust,
    SpeedAndFlowAdjust,
    PressureAdvanceAdjust,
    ExtruderStats,
    ExtruderSteppers,
    ToolChangeCommands,
    ToolHeadIdexControl
  }
})
export default class Toolhead extends Mixins(StateMixin, ToolheadMixin) {
  get showPressureAdvance (): boolean {
    return this.activeExtruder?.pressure_advance !== undefined
  }

  get toolheadControlStyle (): ToolheadControlStyle {
    return this.$store.state.config.uiSettings.general.toolheadControlStyle as ToolheadControlStyle
  }
}
</script>

<style type="scss" scoped>
  .controls-wrapper {
    min-width: 380px !important;
  }
</style>
