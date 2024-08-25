<template>
  <v-menu
    bottom
    left
    offset-y
    transition="slide-y-transition"
    min-width="150"
    :close-on-content-click="true"
  >
    <template #activator="{ on, attrs, value }">
      <app-btn
        :disabled="!klippyReady"
        v-bind="attrs"
        small
        class="ms-1 my-1"
        v-on="on"
      >
        <v-icon
          small
          class="mr-1"
        >
          $fire
        </v-icon>
        {{ $t('app.general.btn.presets') }}
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
      <v-list-item @click="$emit('applyOff')">
        <v-list-item-icon>
          <v-icon color="info">
            $snowflakeAlert
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>
            {{ $t('app.general.btn.heaters_off') }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider class="mb-2 mt-2" />

      <span class="ml-4">
        Thermal Presets
      </span>
      <template v-for="(preset) of presets">
        <v-list-item
          :key="`thermalPreset-${preset.index}`"
          @click="$emit('applyPreset', preset)"
        >
          <v-list-item-icon>
            <v-icon color="error">
              $fire
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>
              {{ preset.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>

      <v-divider class="mb-2 mt-2" />

      <span class="ml-4">
        Filament Profiles
      </span>
      <template v-for="(filament) of filamentProfiles">
        <v-list-item
          :key="`filamentProfile-${filament.id}`"
          @click="$emit('applyFilamentProfile', filament)"
        >
          <v-list-item-icon>
            <v-icon color="error">
              $fire
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>
              {{ filament.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import type { TemperaturePreset } from '@/store/config/types'
import type { FilamentProfile } from '@/store/filament-profiles/types'

@Component({})
export default class TemperaturePresetsMenu extends Mixins(StateMixin) {
  get presets () {
    const presets = this.$store.getters['config/getTempPresets']
    return presets
      .filter((preset: TemperaturePreset) => preset.visible)
  }

  get filamentProfiles () {
    const filaments = this.$store.getters['filamentProfiles/getFilamentProfiles']
    return filaments
      .filter((filament: FilamentProfile) => filament.visible)
  }
}
</script>
