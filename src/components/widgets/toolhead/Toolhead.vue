<template>
  <div>
    <v-card-text>
      <tool-head-idex-control />
      <tool-change-commands />
      <v-row>
        <v-col class="controls-wrapper">
          <template v-if="klippyReady">
            <toolhead-position />
            <toolhead-control-cross v-if="toolheadControlStyle === 'cross'" />
            <toolhead-control-bars v-else-if="toolheadControlStyle === 'bars'" />
            <toolhead-control-circle v-else-if="toolheadControlStyle === 'circle'" />
            <z-height-adjust />
            <speed-adjust class="mb-2" />
            <toolhead-remapping />
            <spool-joining />
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
import ToolheadPosition from './ToolheadPosition.vue'
import ZHeightAdjust from './ZHeightAdjust.vue'
import SpeedAdjust from './SpeedAdjust.vue'
import ToolChangeCommands from './ToolChangeCommands.vue'
import ToolHeadIdexControl from './ToolHeadIdexControl.vue'
import SpoolJoining from './SpoolJoining.vue'
import ToolheadRemapping from './ToolheadRemapping.vue'
import type { ToolheadControlStyle } from '@/store/config/types'

@Component({
  components: {
    ToolheadControlCross,
    ToolheadControlBars,
    ToolheadControlCircle,
    ToolheadPosition,
    ZHeightAdjust,
    SpeedAdjust,
    ToolChangeCommands,
    ToolHeadIdexControl,
    SpoolJoining,
    ToolheadRemapping
  }
})
export default class Toolhead extends Mixins(StateMixin, ToolheadMixin) {
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
