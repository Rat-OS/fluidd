<template>
  <app-dialog
    v-model="open"
    :title="title"
    max-width="480"
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

      <v-divider />

      <app-setting
        :title="$t('app.general.label.hide_while_printing')"
      >
        <v-switch
          v-model="newHideWhilePrinting"
          class="mt-0 pt-0"
          color="primary"
          hide-details
        />
      </app-setting>

      <v-divider />

      <app-setting
        :title="$t('app.general.label.hide_while_paused')"
      >
        <v-switch
          v-model="newHideWhilePaused"
          class="mt-0 pt-0"
          color="primary"
          hide-details
        />
      </app-setting>

      <v-divider />

      <app-setting
        :title="$t('app.general.label.hide_while_standby')"
      >
        <v-switch
          v-model="newHideWhileStandby"
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

  @Prop({ type: Boolean, required: true })
  readonly hideWhilePrinting!: boolean

  @Prop({ type: Boolean, required: true })
  readonly hideWhilePaused!: boolean

  @Prop({ type: Boolean, required: true })
  readonly hideWhileStandby!: boolean

  @Prop({ type: Array<InputValidationRules> })
  readonly rules?: InputValidationRules[]

  newName = ''
  newColor = ''
  newVisible = true
  newHideWhilePrinting = true
  newHideWhilePaused = true
  newHideWhileStandby = true

  mounted () {
    this.newName = this.name
    this.newColor = this.color
    this.newVisible = this.visible
    this.newHideWhilePrinting = this.hideWhilePrinting
    this.newHideWhilePaused = this.hideWhilePaused
    this.newHideWhileStandby = this.hideWhileStandby
  }

  get categories () {
    return this.$store.getters['macros/getCategories']
  }

  handleSave () {
    this.$emit('save', this.newName, this.newColor, this.newVisible, this.newHideWhilePrinting, this.newHideWhilePaused, this.newHideWhileStandby)
    this.open = false
  }

  handleResetColor () {
    this.newColor = ''
  }
}
</script>
