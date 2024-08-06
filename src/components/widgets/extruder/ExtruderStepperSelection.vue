<template>
  <v-form
    v-if="extruderSteppers.length > 0"
    ref="form"
    v-model="valid"
    @submit.prevent
  >
    <v-expansion-panels
      v-model="epanel"
      accordion
      multiple
      flat
      class="mb-1"
    >
      <v-expansion-panel
        v-for="(item, index) in extruderSteppers"
        :key="`extruderStepperPanel-${index}`"
      >
        <v-expansion-panel-header
          class="pl-0 pr-0 pb-0"
        >
          <template #actions>
            <v-icon
              small
              class="pa-0 ma-0 mr-1"
            >
              $expand
            </v-icon>
          </template>
          <template #default>
            <v-row
              :key="`extruderStepperHeader-${index}`"
              no-gutters
              justify="start"
            >
              <extruder-stepper-item
                :key="`extruderStepperHeader-${item.name}`"
                :item="item"
                :text-class="item.enabled ? 'primary--text mr-3' : 'secondary--text mr-3'"
              />
            </v-row>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-row>
            <v-col
              cols="6"
              class="pt-6 pr-9"
            >
              <v-select
                :value="item.motion_queue"
                :label="$t('app.general.label.synced_extruder')"
                :items="[
                  { name: $t('app.setting.label.none'), key: null },
                  ...availableExtruders
                ]"
                :disabled="!klippyReady || printerPrinting"
                :loading="hasWait(`${$waits.onSyncExtruder}${item.name}`)"
                :reset-value="item.config.extruder"
                item-value="key"
                item-text="name"
                hide-details
                outlined
                dense
                class="mt-0 mb-0"
                @change="sendSyncExtruderMotion(item, $event)"
              />
            </v-col>
            <v-col
              v-if="item.enabled !== undefined"
              cols="6"
              class="pt-3"
            >
              <v-switch
                :value="item.enabled"
                :label="$t('app.general.label.stepper_enabled')"
                :disabled="!klippyReady || printerPrinting"
                :loading="hasWait(`${$waits.onStepperEnable}${item.name}`)"
                hide-details
                style="transform: translateY(-1px);"
                @change="toggleStepperEnable(item)"
              />
            </v-col>
          </v-row>
          <pressure-advance-adjust
            v-if="item.pressure_advance !== undefined"
            :extruder-stepper="item"
          />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-form>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import ExtruderStepperItem from './ExtruderStepperItem.vue'
import PressureAdvanceAdjust from './PressureAdvanceAdjust.vue'
import type { KnownExtruder, ExtruderStepper } from '@/store/printer/types'

@Component({
  components: {
    ExtruderStepperItem,
    PressureAdvanceAdjust
  }
})
export default class ExtruderStepperSelection extends Mixins(StateMixin) {
  /**
   * Models
   */
  valid = true
  epanel = []

  /**
   * Extruder Stepper
  */
  get extruderSteppers () {
    const extruders = this.$store.getters['printer/getExtruders'] as KnownExtruder[]
    const extruderSteppers = this.$store.getters['printer/getExtruderSteppers'] as ExtruderStepper[]

    return extruderSteppers
      .map(x => {
        const motionQueueName = (x.motion_queue && extruders.find(y => y.key === x.motion_queue)?.name) ?? this.$t('app.setting.label.none')
        const enabledDesc = x.enabled !== undefined && this.$t(`app.general.label.${x.enabled ? 'on' : 'off'}`)
        const description = enabledDesc ? `${motionQueueName}, ${enabledDesc}` : motionQueueName

        return {
          ...x,
          description
        }
      })
  }

  get availableExtruders () {
    return this.$store.getters['printer/getExtruders'] as KnownExtruder[]
  }

  sendSyncExtruderMotion (item: ExtruderStepper, value: string | null) {
    this.sendGcode(`SYNC_EXTRUDER_MOTION EXTRUDER=${item.name} MOTION_QUEUE=${value ?? ''}`, `${this.$waits.onSyncExtruder}${item.name}`)
  }

  toggleStepperEnable (item: ExtruderStepper) {
    this.sendGcode(`SET_STEPPER_ENABLE STEPPER="${item.key}" ENABLE=${+!item.enabled}`, `${this.$waits.onStepperEnable}${item.name}`)
  }
}
</script>

<style scoped>
.v-expansion-panel-header>>> .v-expansion-panel-header--active {
  padding: 0 !important;
}

.v-expansion-panel-content>>> .v-expansion-panel-content__wrap {
  padding: 0 !important;
  padding-top: 4px;
}

.v-select>>> .v-select__suffix {
  opacity: 0.5;
}

.v-select>>> .v-label--active {
  opacity: 0.5;
  top: 8px;
}

.v-select>>> .v-input__append-inner {
  opacity: 0.5;
  padding: 0px;
}

.v-select>>> .v-input__icon--append {
  transform: translateX(4px) translateY(-2px);
}

.v-select>>> .select__selections {
  padding: 0px;
}

</style>
