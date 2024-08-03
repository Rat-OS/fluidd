<template>
  <v-expansion-panels
    accordion
    multiple
    flat
    class="pb-3 pt-0 mt-4"
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
                style="transform: translateY(1px);"
              >
                $printer3dNozzle
              </v-icon>
              <v-icon
                v-if="isIdex && (idexCopy || idexMirror)"
                small
                primary
                class="mb-1"
                style="transform: translateY(1px);"
              >
                $printer3dNozzle
              </v-icon>
              <span
                v-if="isIdex && (idexCopy || idexMirror)"
                class="primary--text mr-3"
                style="font-size: 14px"
              >
                IDEX
              </span>
              <span
                class="secondary--text mr-0"
                style="font-size: 14px"
              >
                Flow:
              </span>
              <span
                class="primary--text mr-3"
                style="font-size: 14px"
              >
                {{ estimatedVolumetricFlow }} mm³/s
              </span>
              <span
                class="secondary--text mr-0"
                style="font-size: 14px"
              >
                Length:
              </span>
              <span
                class="primary--text mr-3"
                style="font-size: 14px"
              >
                ~{{ estimatedExtrudedLength }} mm
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
            v-html="$t('app.tool.label.stats_active_extruder', {
              filamentDiameter,
              nozzleDiameter
            })"
          />
          <p
            v-html="$t('app.tool.label.stats_volumetric_flow', {
              extrudeSpeed,
              estimatedVolumetricFlow
            })"
          />
          <p
            v-html="$t('app.tool.label.stats_extruded_length', {
              extrudeLength,
              extrudeFactor: (extrudeFactor * 100).toFixed(),
              estimatedExtrudedLength
            })"
          />
          <p
            v-html="$t('app.tool.label.stats_max_speed', {
              layerHeight,
              estimatedMaxSpeed
            })"
          />
        </div>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import ToolheadMixin from '@/mixins/toolhead'

@Component({})
export default class ExtruderMoves extends Mixins(StateMixin, ToolheadMixin) {
  get extrudeFactor (): number {
    return this.$store.state.printer.printer.gcode_move.extrude_factor || 1
  }

  get layerHeight (): number {
    return 0.2
  }

  get extrudeLength (): number {
    const extrudeLength = this.$store.state.config.uiSettings.toolhead.extrudeLength

    if (isNaN(+extrudeLength)) return 0

    return extrudeLength === -1
      ? this.$store.state.config.uiSettings.general.defaultExtrudeLength
      : extrudeLength
  }

  get extrudeSpeed (): number {
    const extrudeSpeed = this.$store.state.config.uiSettings.toolhead.extrudeSpeed

    if (isNaN(+extrudeSpeed)) return 0

    return extrudeSpeed === -1
      ? this.$store.state.config.uiSettings.general.defaultExtrudeSpeed
      : extrudeSpeed
  }

  get estimatedExtrudedLength (): number {
    return Math.round(this.extrudeLength * this.extrudeFactor * (this.filamentDiameter ** 2 / this.nozzleDiameter ** 2) * 10) / 10
  }

  get estimatedVolumetricFlow (): number {
    return Math.round(Math.PI / 4 * this.filamentDiameter ** 2 * this.extrudeSpeed * 10) / 10
  }

  get estimatedMaxSpeed (): number {
    const stadiumArea = this.layerHeight * (this.nozzleDiameter + this.layerHeight * (Math.PI / 4 - 1))
    return Math.round(this.estimatedVolumetricFlow / stadiumArea * 10) / 10
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
