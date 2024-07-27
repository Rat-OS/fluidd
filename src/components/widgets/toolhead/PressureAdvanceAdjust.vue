<template>
  <v-form
    ref="form"
    v-model="valid"
    @submit.prevent
  >
    <v-row
      justify="end"
      class="pa-0 mt-6 mb-6"
    >
      <v-col
        cols="12"
        class="py-0"
      >
        <div class="d-flex align-center">
          <v-select
            v-model="selectedExtruder"
            :items="extruders"
            :readonly="printerPrinting"
            :disabled="!klippyReady || printerPrinting"
            item-value="key"
            item-text="name"
            hide-details
            outlined
            dense
            class="mb-4 v-input--x-dense"
          >
            <template #selection="{ item }">
              <v-icon
                class="px-0 ml-0 mr-1"
                :color="!item.extruder.can_extrude ? 'info' : 'warning'"
              >
                $fire
              </v-icon>
              <span
                class="mt-1"
              >
                {{ item.name }}
              </span>
              <v-icon
                class="px-0 ml-4 mr-1"
              >
                $printer3dNozzle
              </v-icon>
              <span
                class="mt-1"
              >
                {{ item.extruder.config.nozzle_diameter }}mm
              </span>
            </template>
            <template #item="{ item }">
              <v-icon
                class="px-0 ml-0 mr-1"
                :color="!item.extruder.can_extrude ? 'info' : 'warning'"
              >
                $fire
              </v-icon>
              <span
                class="mt-1"
              >
                {{ item.name }}
              </span>
              <v-icon
                class="px-0 ml-4 mr-1"
              >
                $printer3dNozzle
              </v-icon>
              <span
                class="mt-1"
              >
                {{ item.extruder.config.nozzle_diameter }}mm
              </span>
            </template>
          </v-select>
          <app-btn
            min-width="10"
            :color="selectedExtruder == currentExtruder ? 'primary' : undefined"
            class="mb-4 ml-1"
            description="Activate Extruder"
            @click="activateExtruder(selectedExtruder)"
          >
            <v-icon
              v-if="selectedExtruder == currentExtruder"
            >
              $power
            </v-icon>
            <v-icon
              v-else
            >
              $powerCycle
            </v-icon>
          </app-btn>
        </div>
      </v-col>
      <v-col
        cols="6"
        class="py-0"
      >
        <v-text-field
          v-model.number="pressureAdvance"
          :disabled="!klippyReady"
          :locked="isMobileViewport"
          :rules="[
            $rules.required,
            $rules.numberValid,
            $rules.numberGreaterThanOrEqual(0)
          ]"
          type="number"
          :extruder="selectedExtruder"
          hide-details
          outlined
          dense
          :label="$t('app.general.label.pressure_advance')"
          suffix="s"
          @focus="$event.target.select()"
          @keyup.enter.exact="setPa('ADVANCE', pa)"
        />
      </v-col>
      <v-col
        cols="6"
        class="py-0"
      >
        <v-text-field
          v-model.number="smoothTime"
          :disabled="!klippyReady"
          :loading="hasWait(`${$waits.onSetPressureAdvance}${extruderStepper?.name ?? ''}`)"
          :locked="isMobileViewport"
          :rules="[
            $rules.required,
            $rules.numberValid,
            $rules.numberGreaterThanOrEqual(0)
          ]"
          type="number"
          :extruder="selectedExtruder"
          hide-details
          outlined
          dense
          :label="$t('app.general.label.smooth_time')"
          suffix="s"
          @focus="$event.target.select()"
          @keyup.enter.exact="setPa('SMOOTH_TIME', st)"
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import ToolheadMixin from '@/mixins/toolhead'
import BrowserMixin from '@/mixins/browser'
import type { ExtruderStepper, Extruder, KnownExtruder } from '@/store/printer/types'

@Component({})
export default class PressureAdvanceAdjust extends Mixins(StateMixin, ToolheadMixin, BrowserMixin) {
  @Prop({ type: Object })
  readonly extruderStepper?: ExtruderStepper

  valid = true

  selectedExtruder = ''

  get extruders () {
    if (this.selectedExtruder === '') {
      this.selectedExtruder = this.$store.state.printer.printer.toolhead.extruder
    }
    const _extruders: { key: string; name: string; extruder: Extruder }[] = []
    const keys = this.$store.getters['printer/getExtruders'] as KnownExtruder[]
    keys.forEach((k) => {
      const e = this.$store.getters['printer/getExtruderByName'](k.key) as Extruder
      if (e) {
        _extruders.push({ key: k.key, name: k.name, extruder: e })
      }
    })
    return _extruders
  }

  get currentExtruder (): string {
    return this.$store.state.printer.printer.toolhead?.extruder
  }

  get pressureAdvance (): number {
    return this.$store.state.printer.printer?.[this.selectedExtruder]?.pressure_advance ?? 0
  }

  pa = -1
  set pressureAdvance (value: number) {
    this.pa = value
  }

  get smoothTime (): number {
    return this.$store.state.printer.printer?.[this.selectedExtruder]?.smooth_time ?? 0.04
  }

  st = -1
  set smoothTime (value: number) {
    this.st = value
  }

  activateExtruder (extruder: string): void {
    this.sendGcode(`ACTIVATE_EXTRUDER EXTRUDER=${extruder}`, this.$waits.onExtruderChange)
  }

  setPa (name: string, value: number): void {
    this.sendGcode(`SET_PRESSURE_ADVANCE ${name}=${value} EXTRUDER=${this.selectedExtruder}`, `${this.$waits.onSetPressureAdvance}${this.selectedExtruder}`)
  }
}
</script>
