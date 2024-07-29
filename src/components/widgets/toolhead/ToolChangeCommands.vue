<template>
  <v-row v-if="toolChangeCommands.length > 1">
    <v-col>
      <app-btn-group
        class="app-toolchanger-control d-flex"
        :class="{
          [$vuetify.theme.dark ? 'theme--dark': 'theme--light']: true,
        }"
      >
        <v-tooltip
          v-for="(macro, index) of toolChangeCommands"
          :key="index"
          top
        >
          <template #activator="{ on, attrs }">
            <app-btn
              v-bind="attrs"
              min-width="10"
              :color="macro.active ? allHomed ? 'primary' : 'secondary' : undefined"
              :disabled="!klippyReady || printerPrinting"
              class="px-0 flex-grow-1"
              v-on="on"
              @click="sendGcode(macro.name)"
            >
              <v-icon
                v-if="macro.spoolId && getSpoolById(macro.spoolId)"
                class="mr-1 spool-icon"
                :color="getSpoolColor(getSpoolById(macro.spoolId))"
              >
                $filament
              </v-icon>
              <span
                v-else-if="macro.color"
                class="extruder-color mr-1"
                :class="{
                  active: macro.active
                }"
                :style="{
                  background: macro.color,
                }"
              />
              {{ macro.name }}
            </app-btn>
          </template>
          {{ macro.description }}
        </v-tooltip>
        <app-btn
          v-if="toolheadRemapAllowed"
          min-width="10"
          :color="toolheadRemapActive ? allHomed ? 'primary' : 'secondary' : undefined"
          :disabled="!klippyReady || printerPrinting || (isIdex && (idexMode == 'copy' || idexMode == 'mirror'))"
          class="px-2"
          description="Toolhead remapping"
          @click="setToolRemap()"
        >
          <v-icon
            class="mr-1 spool-icon"
          >
            $chart
          </v-icon>
        </app-btn>
        <app-btn
          v-if="spoolJoinAllowed"
          min-width="10"
          :color="spoolJoinActive ? allHomed ? 'primary' : 'secondary' : undefined"
          :disabled="!klippyReady || printerPrinting || (isIdex && (idexMode == 'copy' || idexMode == 'mirror'))"
          class="px-2"
          description="Spool joining"
          @click="setSpoolJoin()"
        >
          <v-icon
            class="mr-1 spool-icon"
          >
            $filament
          </v-icon>
        </app-btn>
      </app-btn-group>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import ToolheadMixin from '@/mixins/toolhead'
import type { GcodeCommands } from '@/store/printer/types'
import type { TranslateResult } from 'vue-i18n'
import type { Spool } from '@/store/spoolman/types'

type ToolChangeCommand = {
  name: string,
  description: string | TranslateResult,
  color?: string,
  active?: boolean,
  spoolId?: number,
  default?: boolean,
  remap?: number,
  join?: number
}

@Component({})
export default class ToolChangeCommands extends Mixins(ToolheadMixin, StateMixin) {
  get isIdex (): boolean {
    return 'dual_carriage' in this.$store.state.printer.printer
  }

  get idexMode (): string {
    return this.$store.state.printer.printer.dual_carriage?.carriage_1?.toString().toLowerCase()
  }

  get hasIdexFilamentSensors (): boolean {
    try {
      const toolhead_filament_sensor_t0 = this.$store.state.printer.printer.configfile?.settings?.toolhead_filament_sensor_t0
      const toolhead_filament_sensor_t1 = this.$store.state.printer.printer.configfile?.settings?.toolhead_filament_sensor_t1
      return true
    } catch { }
    try {
      const feeder_filament_sensor_t0 = this.$store.state.printer.printer.configfile?.settings?.feeder_filament_sensor_t0
      const feeder_filament_sensor_t1 = this.$store.state.printer.printer.configfile?.settings?.feeder_filament_sensor_t1
      return true
    } catch { }
    return false
  }

  get availableCommands (): GcodeCommands {
    return this.$store.getters['printer/getAvailableCommands'] as GcodeCommands
  }

  get toolChangeCommands (): ToolChangeCommand[] {
    const availableCommands = this.availableCommands

    return Object.keys(availableCommands)
      .filter(command => /^t\d+$/i.test(command))
      .map(command => {
        const { help } = availableCommands[command]
        const description = help && help !== 'G-Code macro'
          ? help
          : this.$t('app.tool.tooltip.select_tool', { tool: command.substring(1) })

        const macro = this.$store.getters['macros/getMacroByName'](command.toLowerCase())

        return {
          name: command,
          description,
          color: macro?.variables?.color ? `#${macro.variables.color}` : undefined,
          active: macro?.variables?.active ?? false,
          spoolId: macro?.variables?.spool_id,
          default: macro?.variables?.default ?? false,
          remap: macro?.variables?.remap,
          join: macro?.variables?.join
        } satisfies ToolChangeCommand
      })
      .sort((a, b) => {
        const numberA = parseInt(a.name.substring(1))
        const numberB = parseInt(b.name.substring(1))

        return numberA - numberB
      })
  }

  getSpoolById (id: number): Spool | undefined {
    return this.$store.getters['spoolman/getSpoolById'](id)
  }

  getSpoolColor (spool: Spool | undefined) {
    return `#${spool?.filament.color_hex ?? (this.$vuetify.theme.dark ? 'fff' : '000')}`
  }

  get spoolJoinAllowed (): boolean {
    if (this.isIdex) {
      if (!this.hasIdexFilamentSensors) {
        return false
      }
    }
    for (const txMacro of this.toolChangeCommands) {
      if (txMacro.join === undefined) {
        return false
      }
    }
    return true
  }

  get toolheadRemapAllowed (): boolean {
    for (const txMacro of this.toolChangeCommands) {
      if (txMacro.remap === undefined) {
        return false
      }
    }
    return true
  }

  get spoolJoinActive (): boolean {
    if (!this.spoolJoinAllowed) {
      return false
    }
    for (const txMacro of this.toolChangeCommands) {
      if (txMacro.join?.toString() !== txMacro.name.substring(1)) {
        return true
      }
    }
    return false
  }

  get toolheadRemapActive (): boolean {
    if (!this.toolheadRemapAllowed) {
      return false
    }
    for (const txMacro of this.toolChangeCommands) {
      if (txMacro.remap?.toString() !== txMacro.name.substring(1)) {
        return true
      }
    }
    return false
  }

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
      this.$forceUpdate()
    } else {
      // for MMUs or toolchangers open a configuration dialog
      this.sendGcode('M117 Not implemented yet!')
    }
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
      this.$forceUpdate()
    } else {
      // for MMUs or toolchangers open a configuration dialog
      this.sendGcode('M117 Not implemented yet!')
    }
  }
}
</script>

<style lang="scss" scoped>
  @import 'vuetify/src/styles/styles.sass';

  @include theme(app-toolchanger-control) using ($material) {
    .extruder-color {
      border-color: black;
    }
  }

  .app-toolchanger-control .extruder-color {
    width: 15px;
    height: 15px;
    border-width: 1px;
    border-style: solid;
    border-radius: 50%;

    &.active {
      border-color: black;
    }
  }
</style>
