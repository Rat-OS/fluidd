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
      <v-col
        v-if="loadedFilaments.length > 0"
        class="px-0 pb-0"
      >
        <v-list
          v-for="(loadedFilament, index) in loadedFilaments"
          :key="`toolheadWarning-${index}`"
          dense
          nav
          class="pa-0 ma-0 mb-2"
        >
          <v-list-item
            :key="`toolheadWarning-${index}`"
            :value="loadedFilament"
            class="pa-0 my-0 mx-2"
            @click="alertClick(loadedFilament)"
          >
            <v-list-item-content
              class="pa-0"
            >
              <v-alert
                text
                dense
                :icon="isLoadFilamentMacro() ? `$warning` : `$info`"
                :type="isLoadFilamentMacro() ? `warning` : `info`"
                class="mb-0"
              >
                <div class="mb-0">
                  Filament detected in T{{ loadedFilament.id }}: {{ loadedFilament.name.toUpperCase() }} @ {{ loadedFilament.temp }}°C
                </div>
              </v-alert>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>

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
        v-for="filament in visibleFilamentPresets"
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
  detectedFilaments: FilamentPreset[] = []
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
        if (this.isLoadFilamentMacro()) {
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
  setLoadedFilaments () {
    const loadedFilaments: FilamentPreset[] = []
    const toolchangeCommands = this.toolChangeCommands
    if (toolchangeCommands && toolchangeCommands.length > 0) {
      for (const tcc of toolchangeCommands) {
        console.error('tcc.filament_name ' + tcc.filament_name)
        console.error('tcc.filament_temp ' + tcc.filament_temp)
        if (tcc.filament_name !== '' && (tcc.filament_temp ?? 0) > 0) {
          loadedFilaments.push({
            id: parseInt(tcc.name.substring(1)),
            order: parseInt(tcc.name.substring(1)),
            name: tcc.filament_name ?? '',
            temp: tcc.filament_temp ?? 0,
            visible: true
          })
        }
      }
    }
    this.loadedFilaments = loadedFilaments
  }

  get loadedFilaments () {
    return this.detectedFilaments
  }

  set loadedFilaments (val: FilamentPreset[]) {
    this.detectedFilaments = val
  }

  get visibleFilamentPresets () {
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
    this.setLoadedFilaments()
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

  isLoadFilamentMacro () {
    if (this.filamentMacro) {
      return ['load_filament', 'filament_load', 'm701'].includes(this.filamentMacro.name.toLowerCase())
    }
    return false
  }

  /**
   * send the needed gcode command and close the dialog
   */
  async alertClick (filament: FilamentPreset) {
    if (!this.isLoadFilamentMacro()) {
      const result = (
        await this.$confirm(
          'Unload ' + filament.name + ' with ' + filament.temp + '°C from Toolhead T' + filament.id + ' ?',
          { title: this.$tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
        )
      )
      if (result) {
        this.sendCommand(filament)
      }
    }
  }

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
