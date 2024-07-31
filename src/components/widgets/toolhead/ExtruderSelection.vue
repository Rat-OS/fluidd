<template>
  <v-form
    ref="form"
    v-model="valid"
    @submit.prevent
  >
    <v-expansion-panels
      v-model="epanel"
      accordion
      multiple
      flat
    >
      <v-expansion-panel>
        <v-expansion-panel-header
          class="pl-0 pr-0 pb-0"
        >
          <template #actions>
            <v-icon
              small
              class="pa-0 ma- mr-1"
            >
              $expand
            </v-icon>
          </template>
          <template #default>
            <template v-for="(item, index) in extruders">
              <v-row
                v-if="item.key == selectedExtruder"
                :key="`extruderHeader-${index}`"
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
                    class="primary--text mr-3"
                    style="font-size: 14px"
                  >
                    {{ item.name }}{{ item.extruder.motion_queue != item.key ? item.extruder.motion_queue : '' }}
                  </span>
                  <v-icon
                    small
                    primary
                    class="mb-1"
                  >
                    $thermometer
                  </v-icon>
                  <span
                    class="primary--text mr-3"
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
                    class="primary--text"
                    style="font-size: 14px"
                  >
                    {{ item.extruder.config.nozzle_diameter }}mm
                  </span>
                </v-col>
              </v-row>
            </template>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <div
            class="pa-0"
            :class="{ 'text--disabled': !klippyReady }"
          >
            <v-list
              dense
              class="pa-0"
            >
              <template
                v-for="(item, index) in extruders"
              >
                <v-list-item
                  v-if="selectedExtruder != item.key"
                  :key="`extruderItem-${index}`"
                  :exact="false"
                  link
                  class="pa-0"
                  @click="setSelectExtruder(item)"
                >
                  <v-list-item-content class="my-0">
                    <v-row
                      no-gutters
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
                          class="secondary--text mr-3"
                          style="font-size: 14px"
                        >
                          {{ item.name }}
                        </span>
                        <v-icon
                          small
                          primary
                          class="mb-1"
                        >
                          $thermometer
                        </v-icon>
                        <span
                          class="secondary--text mr-3"
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
                          class="secondary--text"
                          style="font-size: 14px"
                        >
                          {{ item.extruder.config.nozzle_diameter }}mm
                        </span>
                      </v-col>
                    </v-row>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-list>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-form>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import ToolheadMixin from '@/mixins/toolhead'
import BrowserMixin from '@/mixins/browser'
import type { Extruder, KnownExtruder } from '@/store/printer/types'

@Component({})
export default class ExtruderSelection extends Mixins(StateMixin, ToolheadMixin, BrowserMixin) {
  [x: string]: any

  // ----------------------------
  // Models
  // ----------------------------
  valid = true
  epanel = []

  // ----------------------------
  // Extruder
  // ----------------------------
  get extruders () {
    const _extruders: { key: string; name: string; extruder: Extruder }[] = []
    const keys = this.$store.getters['printer/getExtruders'] as KnownExtruder[]
    keys.forEach((k) => {
      const e = this.$store.getters['printer/getExtruderByName'](k.key) as Extruder
      if (e) {
        _extruders.push({ key: k.key, name: k.name, extruder: e })
      }
    })
    return _extruders
  }

  // ----------------------------
  // Selected Extruder
  // ----------------------------
  @Watch('activeExtruder')
  activeExtruderChanged () {
    this.selectedExtruder = this.state.printer.toolhead.extruder || 'extruder'
    // if (!this.hasWait(this.$waits.onExtrude)) {
    //   this.selectedExtruder = this.state.printer.toolhead.extruder || 'extruder'
    // }
  }

  get selectedExtruder () {
    return this.$store.state.config.uiSettings.general.selectedExtruder ?? this.$store.state.printer.printer.toolhead?.extruder
  }

  set selectedExtruder (value: string) {
    this.$store.dispatch('config/saveByPath', {
      path: 'uiSettings.general.selectedExtruder',
      value,
      server: true
    })
  }

  setSelectExtruder (item: any) {
    this.epanel = []
    this.selectedExtruder = item.key
    // this.sendGcode(`ACTIVATE_EXTRUDER EXTRUDER=${item.key}`, this.$waits.onExtruderChange)
  }
}
</script>

<style scoped>
.no-padding :deep(.v-input__slot) {
  padding-left: 0px !important;
  padding-right: 0px !important;
}

.v-expansion-panel-header>>> .v-expansion-panel-header--active {
  padding: 0 !important;
}

.v-expansion-panel-content>>> .v-expansion-panel-content__wrap {
  padding: 0 !important;
}

.no-underline .v-select__selections {
  border-bottom: none !important;
  box-shadow: none !important;
}
</style>
