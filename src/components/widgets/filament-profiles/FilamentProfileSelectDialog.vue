<template>
  <app-dialog
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
        cols="12"
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
                <div class="mb-1">
                  Filament detected in T{{ loadedFilament.id }}
                </div>
                <div>
                  <span style="font-size: 14px;">{{ loadedFilament.name }} - {{ loadedFilament.temp }}°C</span>
                </div>
              </v-alert>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
      <v-col
        v-if="!isLoadFilamentMacro() && loadedFilaments.length == 0"
        cols="12"
        class="pa-2 pb-1 mb-2"
      >
        <v-alert
          text
          dense
          icon="$warning"
          type="warning"
          class="ma-0"
        >
          No Filament detected!
        </v-alert>
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
        v-for="filament in visibleFilamentProfiles"
        :key="`filament-${filament.name}`"
      >
        <v-divider />
        <app-setting
          :r-cols="2"
          @click="sendCommand(filament, '')"
        >
          <template #title>
            {{ filament.name }}
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
        {{ $t('app.general.btn.profiles') }}
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
import type { FilamentProfile } from '@/store/filament-profiles/types'
import gcodeMacroParams from '@/util/gcode-macro-params'
import ToolheadMixin from '@/mixins/toolhead'

@Component({})
export default class FilamentProfileSelectDialog extends Mixins(StateMixin, BrowserMixin, ToolheadMixin) {
  /**
   * Common
   */
  dialogTitle: string = this.$t('app.general.title.load_filament').toString()
  tempParameter: string = 'TEMP'
  toolheadParameter: string = 'TOOLHEAD'
  typeParameter: string = '_TYPE'
  nameParameter: string = '_NAME'
  tool: string = 'T0'
  detectedFilaments: FilamentProfile[] = []
  filamentMacro: Macro | undefined = undefined
  loadFilamentParams: { [index: string]: { value: string | number; reset: string | number }} = {}

  /**
   * dialog state
   */
  get isOpen () {
    const result = this.klippyReady && this.$store.state.filamentProfiles.filamentSelectDialogState.show
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
    this.$store.state.filamentProfiles.filamentSelectDialogState.show = val
  }

  get title () {
    return this.dialogTitle
  }

  set title (val: string) {
    this.dialogTitle = val
  }

  get selectedTool (): string {
    return this.tool
  }

  set selectedTool (value: string) {
    this.tool = value
  }

  /**
   * data
   */
  setLoadedFilaments () {
    const loadedFilaments: FilamentProfile[] = []
    const toolchangeCommands = this.toolChangeCommands
    if (toolchangeCommands && toolchangeCommands.length > 0) {
      for (const tcc of toolchangeCommands) {
        if (tcc.filament_name !== '' && tcc.filament_type !== '' && (tcc.filament_temp ?? 0) > 0) {
          loadedFilaments.push({
            id: parseInt(tcc.name.substring(1)),
            order: parseInt(tcc.name.substring(1)),
            type: tcc.filament_type ?? '',
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

  set loadedFilaments (val: FilamentProfile[]) {
    this.detectedFilaments = val
  }

  get visibleFilamentProfiles () {
    const filaments = this.$store.getters['filamentProfiles/getFilamentProfiles']
    return filaments
      .filter((filament: FilamentProfile) => filament.visible)
  }

  /**
   * filament macro
   */
  initFilamentMacro () {
    this.selectedTool = 'T0'
    this.filamentMacro = this.$store.state.filamentProfiles.filamentSelectDialogState.macro
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
   * actions
   */
  async alertClick (filament: FilamentProfile) {
    if (!this.isLoadFilamentMacro()) {
      const result = (
        await this.$confirm(
          'Unload ' + filament.name + ' with ' + filament.temp + '°C from T' + filament.id + ' ?',
          { title: this.$tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
        )
      )
      if (result) {
        this.sendCommand(filament, filament.id.toString())
      }
    }
  }

  sendCommand (filament: FilamentProfile, toolhead: string) {
    this.isOpen = false
    if (this.hasParameters) {
      const command = this.filamentMacro!.name.toUpperCase()
      if (this.filamentMacro) {
        const params = []
        if (this.hasParameter(this.nameParameter)) {
          params.push({ key: this.nameParameter, value: `'"${filament.name}"'` })
        }
        if (this.hasParameter(this.typeParameter)) {
          params.push({ key: this.typeParameter, value: `'"${filament.type}"'` })
        }
        if (this.hasParameter(this.tempParameter)) {
          params.push({ key: this.tempParameter, value: filament.temp })
        }
        if (this.hasParameter(this.toolheadParameter)) {
          params.push({ key: this.toolheadParameter, value: toolhead === '' ? (this.selectedTool ?? 'T0').substring(1) : toolhead })
        }
        const _params = params
          .filter(param => param.key !== '' && param.value !== '')
          .map(param => `${param.key.toUpperCase()}=${param.value}`)
          .join(' ')
        this.sendGcode(`${command} ${_params}`, `${this.$waits.onMacro}${this.filamentMacro!.name}`)
      } else {
        this.sendGcode(command, `${this.$waits.onMacro}${this.filamentMacro!.name}`)
      }
    }
  }

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
