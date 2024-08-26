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
        <v-list-item-content>
          <v-list-item-title>
            <v-icon
              color="info"
              class="mb-1 mr-1"
            >
              $snowflakeAlert
            </v-icon>
            {{ $t('app.general.btn.heaters_off') }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider class="mb-2 mt-2" />

      <span
        v-if="showFilamentProfiles"
        class="text--secondary ml-4"
      >
        {{ $t('app.general.title.thermal_presets') }}
      </span>
      <template v-for="(preset) of presets">
        <v-list-item
          :key="`thermalPreset-${preset.index}`"
          @click="$emit('applyPreset', preset)"
        >
          <v-list-item-content>
            <v-list-item-title>
              <v-icon
                color="error"
                class="mb-1 mr-1"
              >
                $fire
              </v-icon>
              <span class="mr-2">
                {{ preset.name }}
              </span>
              <span
                v-for="(value, k) in preset.values"
                :key="k"
                class="mr-2"
              >
                {{ value.value }}<small>°C</small>
              </span>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>

      <v-divider
        v-if="showFilamentProfiles"
        class="mb-2 mt-2"
      />

      <span
        v-if="showFilamentProfiles"
        class="text--secondary ml-4"
      >
        {{ $t('app.general.title.filament_presets') }}
      </span>
      <template v-for="(filament) of filamentProfiles">
        <v-list-item
          v-if="showFilamentProfiles"
          :key="`filamentProfile-${filament.id}`"
          @click="$emit('applyFilamentProfile', filament)"
        >
          <v-list-item-content>
            <v-list-item-title>
              <v-icon
                color="error"
                class="mb-1 mr-1"
              >
                $fire
              </v-icon>
              <span class="mr-2">
                {{ filament.name }}
              </span>
              <span>
                {{ filament.temp }}<small>°C</small>
              </span>
              <span
                v-if="heatBedFromFilamentProfile"
                class="ml-2"
              >
                {{ filament.bed_temp }}<small>°C</small>
              </span>
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

  get showFilamentProfiles () {
    return this.$store.state.config.uiSettings.general.showFilamentProfiles
  }

  set showFilamentProfiles (value: boolean) {
    this.$store.dispatch('config/saveByPath', {
      path: 'uiSettings.general.showFilamentProfiles',
      value,
      server: true
    })
  }

  get heatBedFromFilamentProfile () {
    return this.$store.state.config.uiSettings.general.heatBedFromFilamentProfile
  }

  set heatBedFromFilamentProfile (value: boolean) {
    this.$store.dispatch('config/saveByPath', {
      path: 'uiSettings.general.heatBedFromFilamentProfile',
      value,
      server: true
    })
  }
}
</script>
