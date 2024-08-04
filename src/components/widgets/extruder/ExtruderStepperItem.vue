<template>
  <v-row
    no-gutters
    justify="start"
  >
    <v-col>
      <v-icon
        v-if="item.enabled"
        small
        primary
        class="mb-1"
        style="transform: translateY(1px);"
      >
        $powerOn
      </v-icon>
      <v-icon
        v-else
        small
        primary
        class="mb-1"
        style="transform: translateY(1px);"
      >
        $powerOff
      </v-icon>
      <span
        :class="textClass"
        style="font-size: 14px"
      >
        {{ item.prettyName }}
      </span>
      <v-icon
        v-if="item.motion_queue != '' && item.motion_queue != undefined"
        small
        primary
        class="mb-1"
        style="transform: translateY(1px);"
      >
        $play
      </v-icon>
      <v-icon
        v-else
        small
        primary
        class="mb-1"
        style="transform: translateY(1px);"
      >
        $pause
      </v-icon>
      <span
        :class="textClass"
        style="font-size: 14px"
      >
        {{ item.motion_queue != '' && item.motion_queue != undefined ? item.motion_queue : 'not synced' }}
      </span>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import ToolheadMixin from '@/mixins/toolhead'
import BrowserMixin from '@/mixins/browser'
import type { ExtruderStepper } from '@/store/printer/types'

@Component({})
export default class ExtruderStepperSync extends Mixins(StateMixin, ToolheadMixin, BrowserMixin) {
  @Prop({ type: Object, required: true })
    item!: ExtruderStepper

  @Prop({ type: String, required: true })
  readonly textClass!: string
}
</script>
