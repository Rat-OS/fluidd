<template>
  <div>
    <v-card-text>
      <v-row>
        <v-col class="controls-wrapper">
          <template v-if="klippyReady">
            <extruder-selection />
            <pressure-advance-adjust v-if="showPressureAdvance" />
            <extruder-stats />
            <extruder-moves v-if="hasExtruder" />
            <extruder-stepper-selection />
            <flow-adjust />
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
import ExtruderSelection from './ExtruderSelection.vue'
import ExtruderMoves from './ExtruderMoves.vue'
import PressureAdvanceAdjust from './PressureAdvanceAdjust.vue'
import ExtruderStats from './ExtruderStats.vue'
import ExtruderStepperSelection from './ExtruderStepperSelection.vue'
import FlowAdjust from './FlowAdjust.vue'

@Component({
  components: {
    ExtruderMoves,
    ExtruderSelection,
    PressureAdvanceAdjust,
    ExtruderStats,
    ExtruderStepperSelection,
    FlowAdjust
  }
})
export default class Extruder extends Mixins(StateMixin, ToolheadMixin) {
  get showPressureAdvance (): boolean {
    return this.activeExtruder?.pressure_advance !== undefined
  }
}
</script>

<style type="scss" scoped>
  .controls-wrapper {
    min-width: 380px !important;
  }
</style>
