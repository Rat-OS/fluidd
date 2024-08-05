<template>
  <v-expansion-panels
    v-if="allowsToolheadRemapping"
    :disabled="!klippyReady || printerPrinting || (isIdex && (idexCopy || idexMirror))"
    accordion
    multiple
    flat
    class="pb-2 pt-0 mt-4"
  >
    <v-expansion-panel>
      <v-expansion-panel-header
        class="pl-0 pr-0 pb-0 pt-0"
      >
        <template #actions>
          <v-icon
            small
            class="pa-0 ma-0 mr-1"
          >
            $expand
          </v-icon>
        </template>
        <template #default>
          <v-row
            no-gutters
            justify="start"
          >
            <v-col>
              <v-icon
                small
                primary
                class="mb-1"
                :color="toolheadRemapActive ? 'primary' : ''"
                style="transform: translateY(1px);"
              >
                $chart
              </v-icon>
              <span
                :class="toolheadRemapActive ? 'primary--text mr-3' : 'mr-3'"
                style="font-size: 14px"
              >
                Toolhead remapping
              </span>
            </v-col>
          </v-row>
        </template>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <div
          class="text-center pa-0 pb-0 mt-3"
          :class="{ 'text--disabled': !klippyReady }"
        >
          <p
            v-html="'Toolhead remapping'"
          />
        </div>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import ToolheadMixin from '@/mixins/toolhead'
import StateMixin from '@/mixins/state'

@Component({})
export default class ToolheadRemapping extends Mixins(StateMixin, ToolheadMixin) {
  setToolRemap () {
    if (this.isIdex) {
      if (this.toolheadRemapActive) {
        this.sendGcode('SET_GCODE_VARIABLE MACRO=T0 VARIABLE=remap VALUE=0')
        this.sendGcode('SET_GCODE_VARIABLE MACRO=T1 VARIABLE=remap VALUE=1')
        this.sendGcode('M117 Toolhead remapping disabled!')
      } else {
        this.sendGcode('SET_GCODE_VARIABLE MACRO=T0 VARIABLE=remap VALUE=1')
        this.sendGcode('SET_GCODE_VARIABLE MACRO=T1 VARIABLE=remap VALUE=0')
        this.sendGcode('M117 Toolhead remapping enabled!')
      }
    } else {
      this.sendGcode('M117 Not implemented yet!')
    }
  }
}
</script>

<style scoped>
.v-expansion-panel-header>>> .v-expansion-panel-header--active {
  padding: 0 !important;
}

.v-expansion-panel-content>>> .v-expansion-panel-content__wrap {
  padding: 0 !important;
}
</style>
