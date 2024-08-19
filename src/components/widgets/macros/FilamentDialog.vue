<template>
  <app-dialog
    ref="appDialog"
    v-model="isOpen"
    scrollable
    :max-width="450"
    :title="title"
    title-shadow
  >
    <v-card
      dense
      class="fill-height pt-0"
    >
      <app-setting
        v-if="hasParameter(toolheadParameter) && toolChangeCommands.length > 1"
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
          @click="sendCommand(filament)"
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
        @click="isOpen = false"
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
export default class FilamentDialog extends Mixins(StateMixin, BrowserMixin, ToolheadMixin) {
  /**
   * Common
   */
  dialogTitle: string = this.$t('app.general.title.load_filament').toString()
  tempParameter: string = 'TEMP'
  toolheadParameter: string = 'TOOLHEAD'
  filamentParameter: string = 'FILAMENT'
  tool: string = 'T0'
  filamentMacro: Macro | undefined = undefined
  loadFilamentParams: { [index: string]: { value: string | number; reset: string | number }} = {}

  /**
   * dialog state
   */
  get isOpen () {
    const result = this.klippyReady && this.$store.state.macros.showFilamentDialog
    if (result) {
      this.initFilamentMacro()
      if (this.filamentMacro) {
        if (['load_filament', 'filament_load', 'm701'].includes(this.filamentMacro.name.toLowerCase())) {
          this.title = this.$t('app.general.title.load_filament').toString()
        } else {
          this.title = this.$t('app.general.title.unload_filament').toString()
        }
      }
    }
    return result
  }

  set isOpen (val: boolean) {
    this.$store.state.macros.showFilamentDialog = val
  }

  get title () {
    return this.dialogTitle
  }

  set title (val: string) {
    this.dialogTitle = val
  }

  /**
   * data
   */
  get visibleFilaments () {
    const filaments = this.$store.getters['config/getFilamentPresets']
    return filaments
      .filter((filament: FilamentPreset) => filament.visible)
  }

  /**
   * toolheads
   */
  get selectedTool (): string {
    return this.tool
  }

  set selectedTool (value: string) {
    this.tool = value
  }

  /**
   * filament macro
   */
  initFilamentMacro () {
    this.selectedTool = 'T0'
    this.filamentMacro = this.$store.state.macros.filamentDialogMacro
    if (!this.filamentMacro?.config || !this.filamentMacro.config.gcode) return []

    if (this.isMacroWithRawParam) {
      this.$set(this.loadFilamentParams, 'message', { value: '', reset: '' })
    } else {
      for (const { name, value } of gcodeMacroParams(this.filamentMacro.config.gcode)) {
        if (!this.loadFilamentParams[name]) {
          this.$set(this.loadFilamentParams, name, { value, reset: value })
        }
      }
    }
  }

  get hasParameters (): boolean {
    return this.paramList.length > 0
  }

  hasParameter (value: string) {
    return this.hasParameters && this.paramList.includes(value)
  }

  get paramList () {
    return Object.keys(this.loadFilamentParams)
  }

  get isMacroWithRawParam () {
    return ['m117', 'm118'].includes(this.filamentMacro!.name)
  }

  /**
   * send the needed gcode command and close the dialog
   */
  sendCommand (filament: FilamentPreset) {
    this.isOpen = false
    if (this.hasParameters) {
      const command = this.filamentMacro!.name.toUpperCase()
      if (this.filamentMacro) {
        const params = []
        if (this.hasParameter(this.filamentParameter)) {
          params.push({ key: this.filamentParameter, value: filament.name })
        }
        if (this.hasParameter(this.tempParameter)) {
          params.push({ key: this.tempParameter, value: filament.temp })
        }
        if (this.hasParameter(this.toolheadParameter)) {
          params.push({ key: this.toolheadParameter, value: (this.selectedTool ?? 'T0').substring(1) })
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

  /**
   * navigate to the filament presets settings
   */
  openSettings () {
    this.isOpen = false
    this.$router.push('/settings/#filaments')
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
