<template>
  <app-dialog
    v-model="open"
    :title="(preset.id != -1) ? $t('app.general.label.edit_filament_preset') : $t('app.general.label.add_filament_preset')"
    max-width="500"
    :save-button-text="(preset.id !== -1) ? $t('app.general.btn.save') : $t('app.general.btn.add')"
    @save="handleSave"
  >
    <v-card-text class="pa-0">
      <app-setting :title="$t('app.setting.label.filament_preset_type')">
        <v-text-field
          v-model="preset.type"
          :rules="[
            $rules.required
          ]"
          hide-details="auto"
          filled
          dense
          @focus="$event.target.select()"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.filament_preset_name')">
        <v-text-field
          v-model="preset.name"
          :rules="[
            $rules.required
          ]"
          hide-details="auto"
          filled
          dense
          @focus="$event.target.select()"
        />
      </app-setting>

      <v-divider />

      <app-setting :title="$t('app.setting.label.filament_preset_temp')">
        <v-text-field
          v-model.number="preset.temp"
          :rules="[
            $rules.required,
            $rules.numberValid,
            $rules.numberGreaterThan(0)
          ]"
          hide-details="auto"
          type="number"
          suffix="°C"
          filled
          dense
          @focus="$event.target.select()"
        />
      </app-setting>
    </v-card-text>
  </app-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, VModel } from 'vue-property-decorator'
import type { FilamentPreset } from '@/store/config/types'

@Component({})
export default class FilamentDialog extends Vue {
  @VModel({ type: Boolean })
    open?: boolean

  @Prop({ type: Object, required: true })
  readonly preset!: FilamentPreset

  handleSave () {
    this.$emit('save', this.preset)
    this.open = false
  }
}
</script>

<style lang="scss" scoped>
  .console-command {
    font-family: monospace;
  }
</style>
