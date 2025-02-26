<template>
  <app-btn-group divided>
    <app-btn
      v-if="!(macro.hideWhilePrinting && printerPrinting) && !(macro.hideWhilePaused && printerPaused) && !(macro.hideWhileStandby && printerStandby)"
      :disabled="(macro.disabledWhilePrinting && printerPrinting) || !klippyReady"
      :style="borderStyle"
      :loading="hasWait(`${$waits.onMacro}${macro.name}`)"
      v-on="filteredListeners"
      @click="handleClick"
    >
      <slot />
    </app-btn>
    <v-menu
      v-if="paramList.length > 0"
      left
      offset-y
      transition="slide-y-transition"
      :close-on-content-click="false"
    >
      <template #activator="{ on, attrs, value }">
        <app-btn
          v-bind="attrs"
          min-width="24"
          class="px-0"
          :disabled="(macro.disabledWhilePrinting && printerPrinting) || !klippyReady"
          v-on="on"
        >
          <v-icon
            small
            :class="{ 'rotate-180': value }"
          >
            $chevronDown
          </v-icon>
        </app-btn>
      </template>
      <v-form @submit.prevent="$emit('click', runCommand)">
        <v-card>
          <v-card-text class="pb-3 px-3">
            <v-layout
              wrap
              style="max-width: 150px;"
            >
              <v-text-field
                v-for="(param, i) in paramList"
                :key="param"
                v-model="params[param].value"
                :label="param"
                :placeholder="params[param].reset"
                persistent-placeholder
                outlined
                dense
                hide-details="auto"
                spellcheck="false"
                class="console-command"
                :class="{ 'mb-3': (i < paramList.length - 1) }"
                @focus="$event.target.select()"
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
            >
              {{ $t('app.general.btn.send') }}
            </app-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-menu>
  </app-btn-group>
</template>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import type { Macro, MacroCategory } from '@/store/macros/types'
import gcodeMacroParams from '@/util/gcode-macro-params'

@Component({})
export default class MacroBtn extends Mixins(StateMixin) {
  @Prop({ type: Object, required: true })
  readonly macro!: Macro

  @Prop({ type: Object, required: true })
  readonly category!: MacroCategory

  tempParameter: string = 'TEMP'
  params: { [index: string]: { value: string | number; reset: string | number }} = {}

  get isMacroWithRawParam () {
    return ['m117', 'm118'].includes(this.macro.name)
  }

  get isMacroForGcodeCommand () {
    return /^[gm]\d+$/i.test(this.macro.name)
  }

  get filteredListeners () {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { click, ...listeners } = this.$listeners

    return listeners
  }

  get paramList () {
    return Object.keys(this.params)
  }

  /**
   * The formatted run command for a macro.
   */
  get runCommand () {
    const command = this.macro.name.toUpperCase()
    const isMacroForGcodeCommand = this.isMacroForGcodeCommand

    if (this.params) {
      const params = this.isMacroWithRawParam
        ? this.params.message.value.toString()
        : Object.entries(this.params)
          .filter(([key, param]) => key !== '' && param.value !== '')
          .map(([key, param]) => {
            const value = param.value.toString()
            if (!value) {
              return null
            }
            const valueDelimiter = value.includes(' ')
              ? '"'
              : ''
            const paramSeparator = isMacroForGcodeCommand && !valueDelimiter
              ? ''
              : '='
            return `${key.toUpperCase()}${paramSeparator}${valueDelimiter}${value}${valueDelimiter}`
          })
          .filter(x => x != null)
          .join(' ')

      if (params) {
        return `${command} ${params}`
      }
    }

    return command
  }

  get borderStyle () {
    const color = this.macro && this.macro.color !== '' ? this.macro.color : this.category && this.category.color !== '' ? this.category.color : ''
    if (color !== '') {
      return `border-color: ${color} !important; border-left: solid 4px ${color} !important;`
    }
    return ''
  }

  handleClick () {
    const hasFilamentProfiles = this.$store.getters['filamentProfiles/getHasFilamentProfiles']
    if (hasFilamentProfiles && ['load_filament', 'filament_load', 'm701', 'unload_filament', 'filament_unload', 'm702'].includes(this.macro.name.toLowerCase()) && this.paramList.includes(this.tempParameter)) {
      this.$store.commit('filamentProfiles/setFilamentSelectDialogState', {
        show: true,
        macro: this.macro
      })
    } else {
      this.$emit('click', this.macro.name.toUpperCase())
    }
  }

  mounted () {
    if (!this.macro.config || !this.macro.config.gcode) return []

    if (this.isMacroWithRawParam) {
      this.$set(this.params, 'message', { value: '', reset: '' })
    } else {
      for (const { name, value } of gcodeMacroParams(this.macro.config.gcode)) {
        if (!name.startsWith('_') && !this.params[name]) {
          this.$set(this.params, name, { value, reset: value })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .macro-params {
    height: 160px;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
  }
  .macro-params > * {
    flex: 1 1 40px;
  }

  .console-command :deep(.v-text-field__slot input) {
    font-family: monospace;
  }
</style>
