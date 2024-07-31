<template>
  <v-row
    no-gutters
    justify="start"
  >
    <v-col>
      <v-icon
        small
        primary
        :color="!item.extruder.can_extrude ? 'info' : 'error'"
        class="mb-1"
      >
        $fire
      </v-icon>
      <span
        :class="textClass"
        style="font-size: 14px"
      >
        {{ item.name }}
        <!-- {{ item.name }}{{ item.extruder.motion_queue != item.key ? item.extruder.motion_queue : '' }} -->
      </span>
      <v-icon
        small
        primary
        class="mb-1"
      >
        $thermometer
      </v-icon>
      <span
        :class="textClass"
        style="font-size: 14px"
      >
        {{ item.extruder.temperature.toFixed(2) }}°C
      </span>
      <v-icon
        small
        primary
        class="mb-1"
      >
        $printer3dNozzle
      </v-icon>
      <span
        :class="textClass"
        style="font-size: 14px"
      >
        {{ item.extruder.config.nozzle_diameter }}mm
      </span>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import ToolheadMixin from '@/mixins/toolhead'
import BrowserMixin from '@/mixins/browser'
import type { Extruder } from '@/store/printer/types'

@Component({})
export default class ExtruderSelectionItem extends Mixins(StateMixin, ToolheadMixin, BrowserMixin) {
  [x: string]: any
  @Prop({ type: Object, required: true })
    item!: { key: string; name: string; extruder: Extruder }

  @Prop({ type: String, required: true })
  readonly textClass!: string
}
</script>
