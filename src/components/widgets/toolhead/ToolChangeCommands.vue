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
  </v-row>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import ToolheadMixin from '@/mixins/toolhead'
import type { Spool } from '@/store/spoolman/types'

@Component({})
export default class ToolChangeCommands extends Mixins(ToolheadMixin, StateMixin) {
  getSpoolById (id: number): Spool | undefined {
    return this.$store.getters['spoolman/getSpoolById'](id)
  }

  getSpoolColor (spool: Spool | undefined) {
    return `#${spool?.filament.color_hex ?? (this.$vuetify.theme.dark ? 'fff' : '000')}`
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
