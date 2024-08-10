<template>
  <div>
    <v-subheader id="extruder">
      {{ $t('app.setting.title.extruder') }}
    </v-subheader>
    <v-card
      :elevation="5"
      dense
      class="mb-4"
    >
      <app-setting
        :title="$t('app.setting.label.default_extrude_length')"
        :sub-title="$t('app.setting.tooltip.default_extrude_length')"
      >
        <v-text-field
          :value="defaultExtrudeLength"
          :rules="[
            $rules.required,
            $rules.numberValid,
            $rules.numberGreaterThanOrEqual(0)
          ]"
          filled
          dense
          single-line
          hide-details="auto"
          suffix="mm"
          @change="setDefaultExtrudeLength"
        />
      </app-setting>

      <v-divider />

      <app-setting
        :title="$t('app.setting.label.default_extrude_speed')"
        :sub-title="$t('app.setting.tooltip.default_extrude_speed')"
      >
        <v-text-field
          :value="defaultExtrudeSpeed"
          :rules="[
            $rules.required,
            $rules.numberValid,
            $rules.numberGreaterThanOrEqual(0)
          ]"
          filled
          dense
          single-line
          hide-details="auto"
          suffix="mm/s"
          @change="setDefaultExtrudeSpeed"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.extrude_length_values')">
        <v-combobox
          ref="extrudeLengthValues"
          v-model="extrudeLengthValues"
          filled
          dense
          hide-selected
          hide-details="auto"
          suffix="mm"
          multiple
          small-chips
          append-icon=""
          deletable-chips
          :rules="[
            $rules.lengthGreaterThanOrEqual(1),
            $rules.lengthLessThanOrEqual(5),
            $rules.numberArrayValid
          ]"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.extrude_speed_values')">
        <v-combobox
          ref="extrudeSpeedValues"
          v-model="extrudeSpeedValues"
          filled
          dense
          hide-selected
          hide-details="auto"
          suffix="mm/s"
          multiple
          small-chips
          append-icon=""
          deletable-chips
          :rules="[
            $rules.lengthGreaterThanOrEqual(1),
            $rules.lengthLessThanOrEqual(5),
            $rules.numberArrayValid
          ]"
        />
      </app-setting>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Ref, Mixins } from 'vue-property-decorator'
import type { VInput } from '@/types'
import ToolheadMixin from '@/mixins/toolhead'

@Component({
  components: {}
})
export default class ExtruderSettings extends Mixins(ToolheadMixin) {
  @Ref('extrudeLengthValues')
  readonly extrudeLengthValuesElement!: VInput

  @Ref('extrudeSpeedValues')
  readonly extrudeSpeedValuesElement!: VInput

  get defaultExtrudeSpeed () {
    return this.$store.state.config.uiSettings.extruder.defaultExtrudeSpeed
  }

  setDefaultExtrudeSpeed (value: string) {
    this.$store.dispatch('config/saveByPath', {
      path: 'uiSettings.extruder.defaultExtrudeSpeed',
      value: +value,
      server: true
    })
  }

  get defaultExtrudeLength () {
    return this.$store.state.config.uiSettings.extruder.defaultExtrudeLength
  }

  setDefaultExtrudeLength (value: number) {
    this.$store.dispatch('config/saveByPath', {
      path: 'uiSettings.extruder.defaultExtrudeLength',
      value: +value,
      server: true
    })
  }

  get extrudeLengthValues () {
    return this.$store.state.config.uiSettings.extruder.extrudeLengths
  }

  set extrudeLengthValues (value: (number | string)[]) {
    if (!this.extrudeLengthValuesElement.validate(true)) {
      return
    }

    this.$store.dispatch('config/saveByPath', {
      path: 'uiSettings.extruder.extrudeLengths',
      value: [...new Set(value.map(Number))].sort((a, b) => a - b),
      server: true
    })
  }

  get extrudeSpeedValues () {
    return this.$store.state.config.uiSettings.extruder.extrudeSpeeds
  }

  set extrudeSpeedValues (value: (number | string)[]) {
    if (!this.extrudeSpeedValuesElement.validate(true)) {
      return
    }

    this.$store.dispatch('config/saveByPath', {
      path: 'uiSettings.extruder.extrudeSpeeds',
      value: [...new Set(value.map(Number))].sort((a, b) => a - b),
      server: true
    })
  }
}
</script>
