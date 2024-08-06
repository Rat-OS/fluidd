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
          class="pa-0 pb-0 mt-3"
          :class="{ 'text--disabled': !klippyReady }"
        >
          <v-row
            v-for="(macro, index) in toolChangeCommands"
            :key="`toolheadRemapping-${index}`"
            dense
          >
            <app-btn
              v-if="macro.name.substring(1) !== macro.remap?.toString()"
              small
              class="ms-1 my-1"
            >
              {{ macro.name }}
            </app-btn>
            <v-icon
              v-if="macro.name.substring(1) !== macro.remap?.toString()"
              class="pa-0 ma-0 ml-1 mr-1"
            >
              $right
            </v-icon>
            <app-btn
              v-if="macro.name.substring(1) !== macro.remap?.toString()"
              small
              class="ms-1 my-1"
            >
              T{{ macro.remap }}
            </app-btn>
            <app-btn
              v-if="macro.name.substring(1) !== macro.remap?.toString()"
              small
              icon
              class="ms-1 my-1"
              @click="stoppMapping(macro)"
            >
              <v-icon
                small
                color="white"
              >
                $cancel
              </v-icon>
            </app-btn>
          </v-row>
          <v-row
            v-if="sourceTools.length > 0"
            dense
          >
            <v-menu
              left
              offset-y
              transition="slide-y-transition"
            >
              <template #activator="{ on, attrs, value }">
                <app-btn
                  v-bind="attrs"
                  small
                  class="ms-1 my-1"
                  v-on="on"
                >
                  {{ sourceModel }}
                  <v-icon
                    small
                    class="ml-1"
                    :class="{ 'rotate-180': value }"
                  >
                    $chevronDown
                  </v-icon>
                </app-btn>
              </template>

              <v-list dense>
                <template v-for="item in sourceTools">
                  <v-list-item
                    :key="`addModel-${item.name}`"
                    @click="selectAddModel(item)"
                  >
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ item.name }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-list>
            </v-menu>
            <v-icon
              v-if="sourceModel !== 'Add'"
              class="pa-0 ma-0 ml-1 mr-1"
            >
              $right
            </v-icon>
            <v-menu
              v-if="sourceModel !== 'Add'"
              left
              offset-y
              transition="slide-y-transition"
            >
              <template #activator="{ on, attrs, value }">
                <app-btn
                  v-bind="attrs"
                  small
                  class="ms-1 my-1"
                  v-on="on"
                >
                  {{ targetModel }}
                  <v-icon
                    small
                    class="ml-1"
                    :class="{ 'rotate-180': value }"
                  >
                    $chevronDown
                  </v-icon>
                </app-btn>
              </template>

              <v-list dense>
                <template v-for="item in targetTools">
                  <v-list-item
                    :key="`targetModel-${item.name}`"
                    @click="startMapping(item)"
                  >
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ item.name }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-list>
            </v-menu>
          </v-row>
        </div>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import ToolheadMixin, { type ToolChangeCommand } from '@/mixins/toolhead'
import StateMixin from '@/mixins/state'

@Component({})
export default class ToolheadRemapping extends Mixins(StateMixin, ToolheadMixin) {
  sourceModel = 'Add'
  targetModel = 'Target'

  selectAddModel (value: ToolChangeCommand) {
    this.sourceModel = value.name
  }

  startMapping (value: ToolChangeCommand) {
    this.sendGcode(`SET_GCODE_VARIABLE MACRO=${this.sourceModel} VARIABLE=remap VALUE=${value.name.substring(1)}`)
    this.sourceModel = 'Add'
    this.targetModel = 'Target'
  }

  stoppMapping (value: ToolChangeCommand) {
    this.sendGcode(`SET_GCODE_VARIABLE MACRO=${value.name} VARIABLE=remap VALUE=${value.name.substring(1)}`)
    this.sourceModel = 'Add'
    this.targetModel = 'Target'
  }

  get sourceTools () {
    const tools = this.toolChangeCommands
    return tools.filter(x => x.name.substring(1) === x.remap?.toString())
  }

  get targetTools () {
    const tools = this.toolChangeCommands
    return tools
      .filter(x => x.name !== this.sourceModel)
  }

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
