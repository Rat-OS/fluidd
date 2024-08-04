<template>
  <v-row>
    <v-col
      class="px-2 pa-0 mt-5 mb-0"
    >
      <app-named-slider
        :label="$t('app.general.label.speed')"
        suffix="%"
        :value="speed"
        overridable
        :reset-value="100"
        :disabled="!klippyReady"
        :loading="hasWait($waits.onSetSpeed)"
        :locked="isMobileViewport"
        :min="1"
        :max="200"
        :icon="'$motion'"
        @submit="handleSetSpeed"
      />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import BrowserMixin from '@/mixins/browser'

@Component({})
export default class SpeedAdjust extends Mixins(StateMixin, BrowserMixin) {
  get speed () {
    return Math.round(this.$store.state.printer.printer.gcode_move.speed_factor * 100) || 100
  }

  handleSetSpeed (val: number) {
    this.sendGcode(`M220 S${val}`, this.$waits.onSetSpeed)
  }
}
</script>
