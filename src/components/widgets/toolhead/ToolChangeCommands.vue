<template>
  <v-row v-if="toolChangeCommands.length > 0">
    <v-col cols="12">
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
              :color="getButtonColor(macro, index)"
              :disabled="!klippyReady || printerPrinting"
              class="px-0 flex-grow-1"
              :loading="hasWait(`${$waits.onToolChange}${macro.name}`)"
              v-on="on"
              @click="sendGcode(macro.name, `${$waits.onToolChange}${macro.name}`)"
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
      </app-btn-group>
    </v-col>
    <v-col
      cols="12"
      class="pa-0 ma-0"
    >
      <v-list
        v-for="(macro, index) in toolChangeCommands"
        :key="`toolheadWarning-${index}`"
        dense
        nav
        class="pa-0 ma-0"
      >
        <v-list-item
          v-if="macro.message && (macro.message.type === 'warning' || macro.message.type === 'error' || macro.message.type === 'info')"
          :key="`toolheadWarning-${index}`"
          :value="macro"
          :class="macro.message.type == 'error' ? 'pa-0 mx-2 error' : macro.message.type == 'warning' ? 'pa-0 mx-2 warning' : 'pa-0 mx-2 info'"
          @click="messageAction(macro)"
        >
          <v-list-item-icon
            class="ml-2 mr-3"
          >
            <v-icon
              v-if="macro.message.type == 'error'"
              class="mt-1"
              color="white"
            >
              $error
            </v-icon>
            <v-icon
              v-if="macro.message.type == 'warning'"
              class="mt-1"
              color="white"
            >
              $warning
            </v-icon>
            <v-icon
              v-if="macro.message.type == 'info'"
              class="mt-1"
              color="white"
            >
              $alertCircle
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-row
              dense
            >
              <v-col
                class="me-auto my-0 mt-2"
                cols="auto"
              >
                <span
                  style="font-size: 14px"
                >
                  {{ macro.name.toUpperCase() }}: {{ macro.message.message }}
                </span>
              </v-col>
              <v-col
                cols="auto"
                class="mr-2"
              >
                <app-btn
                  icon
                  small
                  color="white"
                  class="ml-2"
                  @click.prevent.stop="messageCancel(macro)"
                >
                  <v-icon small>
                    $close
                  </v-icon>
                </app-btn>
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import ToolheadMixin, { type ToolChangeCommand } from '@/mixins/toolhead'
import type { Spool } from '@/store/spoolman/types'

@Component({})
export default class ToolChangeCommands extends Mixins(ToolheadMixin, StateMixin) {
  getSpoolById (id: number): Spool | undefined {
    return this.$store.getters['spoolman/getSpoolById'](id)
  }

  getSpoolColor (spool: Spool | undefined) {
    return `#${spool?.filament.color_hex ?? (this.$vuetify.theme.dark ? 'fff' : '000')}`
  }

  getButtonColor (macro: ToolChangeCommand, index: number) {
    if (this.hasSensorRunout(macro, index)) return 'error'
    return macro.active ? this.allHomed ? 'primary' : 'secondary' : undefined
  }

  hasSensorRunout (macro: ToolChangeCommand, index: number): boolean {
    if (macro.runout_sensor?.toString() !== undefined) {
      if (this.toolheadRunoutSensors && this.toolheadRunoutSensors!.length > 0) {
        if (this.toolheadRunoutSensors![index]) {
          if (this.toolheadRunoutSensors![index].enabled) {
            if (!this.toolheadRunoutSensors![index].filament_detected) {
              return true
            }
          }
        }
      }
    }
    return false
  }

  messageAction (macro: ToolChangeCommand) {
    if (macro.message?.action) {
      this.messageCancel(macro)
      this.sendGcode(macro.message?.action)
    }
  }

  messageCancel (macro: ToolChangeCommand) {
    this.sendGcode(`SET_GCODE_VARIABLE MACRO=${macro.name} VARIABLE=message VALUE="''"`)
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

  .v-list-item>>> .v-list-item__content {
    padding: 0 !important;
  }
</style>
