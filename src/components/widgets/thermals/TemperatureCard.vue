<template>
  <collapsable-card
    :title="$t('app.general.title.temperature')"
    icon="$fire"
    :help-tooltip="$t('app.chart.tooltip.help')"
    :lazy="false"
    draggable
    layout-path="dashboard.temperature-card"
  >
    <template #menu>
      <app-btn-collapse-group
        v-if="!useSmallThermalButtons"
        :collapsed="menuCollapsed"
      >
        <temperature-presets-menu
          @applyOff="handleApplyOff"
          @applyPreset="handleApplyPreset"
        />
      </app-btn-collapse-group>

      <v-menu
        v-if="useSmallThermalButtons && presets.length > 0"
        bottom
        left
        offset-y
        transition="slide-y-transition"
        :close-on-content-click="true"
      >
        <template #activator="{ on, attrs }">
          <v-btn
            fab
            x-small
            text
            v-bind="attrs"
            class="ms-1 my-1"
            v-on="on"
          >
            <v-icon
              color="error"
            >
              $fire
            </v-icon>
          </v-btn>
        </template>

        <v-list dense>
          <template v-for="(preset) of presets">
            <v-list-item
              :key="preset.index"
              @click="handleApplyPreset(preset)"
            >
              <v-list-item-icon>
                <v-icon color="error">
                  $fire
                </v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>
                  <span
                    class="mr-2"
                  >
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
        </v-list>
      </v-menu>

      <v-btn
        v-if="useSmallThermalButtons"
        :loading="hasWait($waits.onPrintCancel)"
        :disabled="hasWait([$waits.onPrintCancel, $waits.onPrintResume, $waits.onPrintPause])"
        fab
        x-small
        text
        class="ms-1 my-1"
        @click="handleApplyOff"
      >
        <v-icon
          color="info"
        >
          $snowflakeAlert
        </v-icon>
      </v-btn>

      <v-menu
        bottom
        left
        offset-y
        transition="slide-y-transition"
        :close-on-content-click="false"
      >
        <template #activator="{ on, attrs }">
          <v-btn
            fab
            x-small
            text
            v-bind="attrs"
            class="ms-1 my-1"
            v-on="on"
          >
            <v-icon>
              $cog
            </v-icon>
          </v-btn>
        </template>

        <v-list dense>
          <v-list-item @click="chartVisible = !chartVisible">
            <v-list-item-action class="my-0">
              <v-checkbox :input-value="chartVisible" />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.setting.label.show_chart') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="showRateOfChange = !showRateOfChange">
            <v-list-item-action class="my-0">
              <v-checkbox :input-value="showRateOfChange" />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.setting.label.show_rate_of_change') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="showRelativeHumidity = !showRelativeHumidity">
            <v-list-item-action class="my-0">
              <v-checkbox :input-value="showRelativeHumidity" />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.setting.label.show_relative_humidity') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="showBarometricPressure = !showBarometricPressure">
            <v-list-item-action class="my-0">
              <v-checkbox :input-value="showBarometricPressure" />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.setting.label.show_barometric_pressure') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="showGasResistance = !showGasResistance">
            <v-list-item-action class="my-0">
              <v-checkbox :input-value="showGasResistance" />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.setting.label.show_gas_resistance') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <temperature-targets
      @legendClick="legendToggleSelect"
      @legendPowerClick="legendTogglePowerSelect"
    />

    <template v-if="chartReady && chartVisible">
      <v-divider />

      <thermal-chart
        ref="thermalchart"
        :height="(isMobileViewport) ? '180px' : '260px'"
      />
    </template>
  </collapsable-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import BrowserMixin from '@/mixins/browser'
import type { Fan, Heater } from '@/store/printer/types'

import ThermalChart from '@/components/widgets/thermals/ThermalChart.vue'
import TemperatureTargets from '@/components/widgets/thermals/TemperatureTargets.vue'
import TemperaturePresetsMenu from './TemperaturePresetsMenu.vue'
import type { TemperaturePreset } from '@/store/config/types'

@Component({
  components: {
    ThermalChart,
    TemperatureTargets,
    TemperaturePresetsMenu
  }
})
export default class TemperatureCard extends Mixins(StateMixin, BrowserMixin) {
  @Prop({ type: Boolean })
  readonly menuCollapsed?: boolean

  @Ref('thermalchart')
  readonly thermalChartElement!: ThermalChart

  get chartReady () {
    return (
      this.$store.state.socket.acceptingNotifications &&
      this.$store.state.socket.ready &&
      this.$store.state.charts.ready &&
      this.klippyReady
    )
  }

  legendToggleSelect (item: Heater | Fan) {
    // If this has a target, toggle that too.
    if (this.chartVisible) {
      if ('target' in item) {
        this.thermalChartElement.legendToggleSelect(item.key + 'Target')
      }
      this.thermalChartElement.legendToggleSelect(item.key)
    }
  }

  legendTogglePowerSelect (item: Heater | Fan) {
    if (this.chartVisible) {
      const name = ('speed' in item)
        ? item.key + 'Speed'
        : item.key + 'Power'
      this.thermalChartElement.legendToggleSelect(name)
    }
  }

  get chartVisible () {
    return this.$store.state.config.uiSettings.general.chartVisible
  }

  set chartVisible (value: boolean) {
    this.$store.dispatch('config/saveByPath', {
      path: 'uiSettings.general.chartVisible',
      value,
      server: true
    })
  }

  get showRateOfChange () {
    return this.$store.state.config.uiSettings.general.showRateOfChange
  }

  set showRateOfChange (value: boolean) {
    this.$store.dispatch('config/saveByPath', {
      path: 'uiSettings.general.showRateOfChange',
      value,
      server: true
    })
  }

  get showRelativeHumidity () {
    return this.$store.state.config.uiSettings.general.showRelativeHumidity
  }

  set showRelativeHumidity (value: boolean) {
    this.$store.dispatch('config/saveByPath', {
      path: 'uiSettings.general.showRelativeHumidity',
      value,
      server: true
    })
  }

  get showBarometricPressure () {
    return this.$store.state.config.uiSettings.general.showBarometricPressure
  }

  set showBarometricPressure (value: boolean) {
    this.$store.dispatch('config/saveByPath', {
      path: 'uiSettings.general.showBarometricPressure',
      value,
      server: true
    })
  }

  get showGasResistance () {
    return this.$store.state.config.uiSettings.general.showGasResistance
  }

  set showGasResistance (value: boolean) {
    this.$store.dispatch('config/saveByPath', {
      path: 'uiSettings.general.showGasResistance',
      value,
      server: true
    })
  }

  get useSmallThermalButtons () {
    return this.$store.state.config.uiSettings.general.useSmallThermalButtons
  }

  get presets () {
    const presets = this.$store.getters['config/getTempPresets']
    return presets
      .filter((preset: TemperaturePreset) => preset.visible)
  }

  handleApplyPreset (preset: TemperaturePreset) {
    if (preset) {
      if (preset.values) {
        for (const key in preset.values) {
          const item = preset.values[key]
          if (item.type === 'heater' && item.active && item.value > -1) {
            this.sendGcode(`SET_HEATER_TEMPERATURE HEATER=${key} TARGET=${item.value}`)
          }
          if (item.type === 'fan' && item.active && item.value > -1) {
            this.sendGcode(`SET_TEMPERATURE_FAN_TARGET TEMPERATURE_FAN=${key} TARGET=${item.value}`)
          }
        }
      }

      if (preset.gcode) {
        this.sendGcode(preset.gcode)
      }
    }
  }

  async handleApplyOff () {
    const result = (
      !['printing', 'busy', 'paused'].includes(this.$store.getters['printer/getPrinterState']) ||
      await this.$confirm(
        this.$tc('app.general.label.heaters_busy'),
        { title: this.$tc('app.general.simple_form.msg.confirm'), color: 'card-heading', icon: '$error' }
      )
    )

    if (result) {
      this.sendGcode('TURN_OFF_HEATERS')
    }
  }
}
</script>
