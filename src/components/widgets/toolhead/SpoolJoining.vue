<template>
  <v-expansion-panels
    v-if="allowsSpoolJoining && !(isIdex && (idexCopy || idexMirror))"
    :disabled="!klippyReady"
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
                :color="spoolJoinActive ? 'primary' : ''"
                style="transform: translateY(1px);"
              >
                $filament
              </v-icon>
              <span
                :class="spoolJoinActive ? 'primary--text mr-3' : 'mr-3'"
                style="font-size: 14px"
              >
                Spool joining
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
            v-html="'Spool joining'"
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
export default class SpoolJoining extends Mixins(StateMixin, ToolheadMixin) {
  setSpoolJoin () {
    if (this.isIdex) {
      if (this.spoolJoinActive) {
        this.sendGcode('SET_GCODE_VARIABLE MACRO=T0 VARIABLE=join VALUE=0')
        this.sendGcode('SET_GCODE_VARIABLE MACRO=T1 VARIABLE=join VALUE=1')
        this.sendGcode('M117 Spool joining disabled!')
      } else {
        this.sendGcode('SET_GCODE_VARIABLE MACRO=T0 VARIABLE=join VALUE=1')
        this.sendGcode('SET_GCODE_VARIABLE MACRO=T1 VARIABLE=join VALUE=0')
        this.sendGcode('M117 Spool joining enabled!')
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
