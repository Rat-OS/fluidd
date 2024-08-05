<template>
  <app-dialog
    v-model="open"
    :title="title"
    max-width="350"
    @save="handleSave"
  >
    <v-card-text class="pa-0">
      <app-setting
        :title="label"
      >
        <v-text-field
          v-model="newName"
          dense
          filled
          hide-details
          :rules="[
            $rules.required,
            // customRules.uniqueName
          ]"
          required
        />
      </app-setting>

      <v-divider />

      <app-setting
        :title="$t('app.general.label.color')"
      >
        <app-btn
          outlined
          small
          color="primary"
          class="mr-1"
          @click="handleResetColor"
        >
          {{ $t('app.setting.btn.reset') }}
        </app-btn>
        <app-color-picker
          v-model="newColor"
          :title="$t('app.general.btn.set_color')"
        />
      </app-setting>

      <v-divider />

      <app-setting
        :title="$t('app.general.label.visible')"
      >
        <v-switch
          v-model="newVisible"
          class="mt-0 pt-0"
          color="primary"
          hide-details
        />
      </app-setting>
    </v-card-text>
  </app-dialog>
</template>

<script lang="ts">
import type { MacroCategory } from '@/store/macros/types'
import { Component, Vue, Prop, VModel } from 'vue-property-decorator'

@Component({})
export default class MacroCategoryDialog extends Vue {
  @VModel({ type: Boolean })
    open?: boolean

  @Prop({ type: String, required: true })
  readonly title!: string

  @Prop({ type: String, required: true })
  readonly label!: string

  @Prop({ type: String, required: true })
  readonly name!: string

  @Prop({ type: String, required: true })
  readonly color!: string

  @Prop({ type: Boolean, required: true })
  readonly visible!: boolean

  newName = ''
  newColor = ''
  newVisible = true

  get customRules () {
    return {
      uniqueName: (v: string) => this.categories.findIndex((c: MacroCategory) => c.name.toLowerCase() === v.toLowerCase()) < 0 || this.$t('app.general.simple_form.error.exists')
    }
  }

  mounted () {
    this.newName = this.name
    this.newColor = this.color
    this.newVisible = this.visible
  }

  get categories () {
    return this.$store.getters['macros/getCategories']
  }

  handleSave () {
    this.$emit('save', this.newName, this.newColor, this.newVisible)
    this.open = false
  }

  handleResetColor () {
    this.newColor = ''
  }
}
</script>
