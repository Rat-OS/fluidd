<template>
  <v-row>
    <v-col
      class="px-2 pa-0 mt-5 mb-0"
    >
      <app-named-slider
        :label="$t('app.general.label.flow')"
        suffix="%"
        :value="flow"
        overridable
        :reset-value="100"
        :disabled="!klippyReady"
        :loading="hasWait($waits.onSetFlow)"
        :locked="isMobileViewport"
        :min="1"
        :max="200"
        :icon="'$printer3dNozzle'"
        @submit="handleSetFlow"
      />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import BrowserMixin from '@/mixins/browser'

@Component({})
export default class SpeedAndFlowAdjust extends Mixins(StateMixin, BrowserMixin) {
  get flow () {
    return Math.round(this.$store.state.printer.printer.gcode_move.extrude_factor * 100) || 100
  }

  handleSetFlow (val: number) {
    this.sendGcode(`M221 S${val}`, this.$waits.onSetFlow)
  }
}
</script>
