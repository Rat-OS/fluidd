<template>
  <app-dialog
    v-model="open"
    scrollable
    :max-width="450"
    :title="$t('app.setting.title.filament_presets')"
    title-shadow
  >
    <v-card
      dense
      class="fill-height pt-0"
    >
      <app-setting
        v-if="hasParameter(toolheadParameter) && toolChangeCommands.length > 0"
        :title="$t('app.general.label.toolhead')"
      >
        <v-select
          v-model="selectedTool"
          filled
          dense
          hide-details="auto"
          :items="toolChangeCommands"
          item-value="name"
          item-text="name"
        />
      </app-setting>
      <section
      v-for="filament in visibleFilaments"
      :key="`filament-${filament.name}`"
    >
      <v-divider />
      <app-setting
        :r-cols="2"
        @click="handleClick(filament)"
      >
        <template #title>
          {{ filament.name.toUpperCase() }}
        </template>
        {{ filament.temp }}°C
      </app-setting>
      </section>
      <v-divider />
    </v-card>

    <template #actions>
      <v-spacer v-if="isMobileViewport" />

      <app-btn
        color="primary"
        text
        @click="openSettings"
      >
        Presets
      </app-btn>

      <v-spacer v-if="!isMobileViewport" />

      <app-btn
        text
        color="warning"
        @click="open = false"
      >
        {{ $t('app.general.btn.cancel') }}
      </app-btn>
    </template>
  </app-dialog>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import BrowserMixin from '@/mixins/browser'
import type { Macro } from '@/store/macros/types'
import type { FilamentPreset } from '@/store/config/types'
import gcodeMacroParams from '@/util/gcode-macro-params'
import ToolheadMixin from '@/mixins/toolhead'

@Component({})
export default class LoadFilamentDialog extends Mixins(StateMixin, BrowserMixin, ToolheadMixin) {
  tempParameter: string = 'TEMP'
  toolheadParameter: string = 'TOOLHEAD'
  filamentParameter: string = 'FILAMENT'

  _selectedTool: string | undefined = undefined
  loadFilamentMacro: Macro | undefined = undefined
  loadFilamentParams: { [index: string]: { value: string | number; reset: string | number }} = {}

  get open () {
    return this.klippyReady && this.$store.state.macros.showLoadFilamentDialog
  }

  set open (val: boolean) {
    this.$store.state.macros.showLoadFilamentDialog = val
  }

  get selectedTool (): string | null {
    return this._selectedTool ?? 'T0'
  }

  set selectedTool (value: string) {
    this._selectedTool = value
  }

  get visibleFilaments () {
    const filaments = this.$store.getters['config/getFilamentPresets']
    return filaments
      .filter((filament: FilamentPreset) => filament.visible)
  }

  get hasParameters (): boolean {
    if (this.loadFilamentMacro === undefined) this.createParams()
    return this.paramList.length > 0
  }

  hasParameter (value: string) {
    return this.hasParameters && this.paramList.includes(value)
  }

  get paramList () {
    return Object.keys(this.loadFilamentParams)
  }

  get isMacroWithRawParam () {
    return ['m117', 'm118'].includes(this.loadFilamentMacro!.name)
  }

  createParams () {
    this.loadFilamentMacro = this.$store.getters['macros/getMacroByName'](
      'load_filament',
      'filament_load',
      'm701'
    ) as Macro | undefined
    if (!this.loadFilamentMacro?.config || !this.loadFilamentMacro.config.gcode) return []

    if (this.isMacroWithRawParam) {
      this.$set(this.loadFilamentParams, 'message', { value: '', reset: '' })
    } else {
      for (const { name, value } of gcodeMacroParams(this.loadFilamentMacro.config.gcode)) {
        if (!this.loadFilamentParams[name]) {
          this.$set(this.loadFilamentParams, name, { value, reset: value })
        }
      }
    }
  }

  openSettings () {
    this.open = false
    this.$router.push('/settings/#filaments')
  }

  handleClick (filament: FilamentPreset) {
    this.open = false
    if (this.hasParameters) {
      const command = this.loadFilamentMacro!.name.toUpperCase()
      if (this.loadFilamentMacro) {
        const params = []
        if (this.hasParameter(this.filamentParameter)) {
          params.push({ key: this.filamentParameter, value: filament.name })
        }
        if (this.hasParameter(this.tempParameter)) {
          params.push({ key: this.tempParameter, value: filament.temp })
        }
        if (this.hasParameter(this.toolheadParameter)) {
          params.push({ key: this.toolheadParameter, value: (this._selectedTool ?? 'T0').substring(1) })
        }
        const _params = params
          .filter(param => param.key !== '' && param.value !== '')
          .map(param => `${param.key.toUpperCase()}=${param.value}`)
          .join(' ')
        this.sendGcode(`${command} ${_params}`)
      } else {
        this.sendGcode(command)
      }
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
