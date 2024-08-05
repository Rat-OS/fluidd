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
          :rules="rules"
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
import { Component, Vue, Prop, VModel } from 'vue-property-decorator'
import type { InputValidationRules } from 'vuetify'

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

  @Prop({ type: Array<InputValidationRules> })
  readonly rules?: InputValidationRules[]

  newName = ''
  newColor = ''
  newVisible = true

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
