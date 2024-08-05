<template>
  <v-row v-if="isIdex && hasIdexCommands">
    <v-col>
      <app-btn-group
        class="app-toolchanger-control d-flex"
      >
        <app-btn
          small
          class="px-0 flex-grow-1"
          :disabled="!klippyReady || printerPrinting || !allHomed"
          :color="!idexCopy && !idexMirror ? 'primary' : undefined"
          :loading="hasWait(`${$waits.onIdexMode}${'IDEX_SINGLE'}`)"
          @click="sendGcode('IDEX_SINGLE', `${$waits.onIdexMode}${'IDEX_SINGLE'}`)"
        >
          {{ $t('app.tool.idex.single_mode') }}
        </app-btn>
        <app-btn
          small
          class="px-0 flex-grow-1"
          :disabled="!klippyReady || printerPrinting || !allHomed"
          :color="idexCopy ? 'primary' : undefined"
          dense
          :loading="hasWait(`${$waits.onIdexMode}${'IDEX_COPY'}`)"
          @click="sendGcode('IDEX_COPY', `${$waits.onIdexMode}${'IDEX_COPY'}`)"
        >
          {{ $t('app.tool.idex.copy_mode') }}
        </app-btn>
        <app-btn
          small
          class="px-0 flex-grow-1"
          :disabled="!klippyReady || printerPrinting || !allHomed"
          :color="idexMirror ? 'primary' : undefined"
          dense
          :loading="hasWait(`${$waits.onIdexMode}${'IDEX_MIRROR'}`)"
          @click="sendGcode('IDEX_MIRROR', `${$waits.onIdexMode}${'IDEX_MIRROR'}`)"
        >
          {{ $t('app.tool.idex.mirror_mode') }}
        </app-btn>
        <app-btn
          v-if="hasIdexParkCommand"
          small
          class="px-0 flex-grow-1"
          :disabled="!klippyReady || printerPrinting || !allHomed || idexCopy || idexMirror"
          dense
          :loading="hasWait(`${$waits.onIdexMode}${'IDEX_PARK'}`)"
          @click="sendGcode('IDEX_PARK', `${$waits.onIdexMode}${'IDEX_PARK'}`)"
        >
          {{ $t('app.tool.idex.park_toolhead') }}
        </app-btn>
        <v-menu
          v-if="hasIdexConfigCommand"
          v-model="menu"
          bottom
          left
          offset-y
          transition="slide-y-transition"
          :close-on-content-click="false"
        >
          <template #activator="{ on, attrs }">
            <app-btn
              min-width="10"
              :loading="hasWait(`${$waits.onIdexMode}${'IDEX_CONFIG'}`)"
              :disabled="!klippyReady"
              v-bind="attrs"
              class="px-2"
              small
              v-on="on"
            >
              <v-icon small>
                $cog
              </v-icon>
            </app-btn>
          </template>
          <v-card>
            <v-card-text class="pb-3 px-3">
              <v-layout
                wrap
                style="max-width: 200px;"
              >
                <v-text-field
                  v-for="(param, i) in paramList"
                  :key="param"
                  v-model="params[param].value"
                  :label="param"
                  outlined
                  dense
                  hide-details="auto"
                  spellcheck="false"
                  class="console-command"
                  :class="{ 'mb-3': (i < paramList.length - 1) }"
                >
                  <template #append>
                    <app-btn
                      v-if="params[param].value !== params[param].reset"
                      style="margin-top: -4px; margin-right: -6px;"
                      color=""
                      icon
                      small
                      @click="params[param].value = params[param].reset"
                    >
                      <v-icon small>
                        $reset
                      </v-icon>
                    </app-btn>
                  </template>
                </v-text-field>
              </v-layout>
            </v-card-text>
            <v-divider />
            <v-card-actions class="px-3 py-3">
              <app-btn
                block
                type="submit"
                @click="sendIdexConfig()"
              >
                {{ $t('app.general.btn.send') }}
              </app-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </app-btn-group>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import ToolheadMixin from '@/mixins/toolhead'
import type { GcodeCommands } from '@/store/printer/types'
import type { Macro } from '@/store/macros/types'
import gcodeMacroParams from '@/util/gcode-macro-params'

@Component({})
export default class ToolHeadIdexControl extends Mixins(StateMixin, ToolheadMixin) {
  menu = false

  get availableCommands (): GcodeCommands {
    return this.$store.getters['printer/getAvailableCommands'] as GcodeCommands
  }

  get hasIdexCommands (): boolean {
    return 'IDEX_SINGLE' in this.availableCommands && 'IDEX_COPY' in this.availableCommands && 'IDEX_MIRROR' in this.availableCommands
  }

  get hasIdexParkCommand (): boolean {
    return 'IDEX_PARK' in this.availableCommands
  }

  get hasIdexConfigCommand (): boolean {
    const result = 'IDEX_CONFIG' in this.availableCommands
    if (result) this.createParams()
    return result
  }

  macro: Macro | undefined = undefined
  params: { [index: string]: { value: string | number; reset: string | number }} = {}

  get paramList () {
    return Object.keys(this.params)
  }

  sendIdexConfig () {
    this.menu = false
    const command = this.macro!.name.toUpperCase()

    if (this.params) {
      const params = this.isMacroWithRawParam
        ? this.params.message.value.toString()
        : Object.entries(this.params)
          .map(([key, param]) => `${key.toUpperCase()}=${param.value}`)
          .join(' ')

      if (params) {
        this.sendGcode(`${command} ${params}`)
        return
      }
    }
    this.sendGcode(command)
  }

  get isMacroWithRawParam () {
    return ['m117', 'm118'].includes(this.macro!.name)
  }

  createParams () {
    this.macro = this.$store.getters['macros/getMacroByName']('IDEX_CONFIG'.toLowerCase()) as Macro | undefined
    if (!this.macro?.config || !this.macro.config.gcode) return []

    if (this.isMacroWithRawParam) {
      this.$set(this.params, 'message', { value: '', reset: '' })
    } else {
      for (const { name, value } of gcodeMacroParams(this.macro.config.gcode)) {
        if (!this.params[name]) {
          this.$set(this.params, name, { value, reset: value })
        }
      }
    }
  }
}

</script>

<style lang="scss" scoped>
  @import 'vuetify/src/styles/styles.sass';

  .macro-params {
    height: 160px;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
  }
  .macro-params > * {
    flex: 1 1 40px;
  }
</style>
