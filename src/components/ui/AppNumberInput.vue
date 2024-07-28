<template>
  <app-text-field
    v-model="inputValue"
    :label="label"
    :suffix="suffix"
    :prefix="prefix"
    :disabled="disabled"
    :loading="loading"
    :rules="rules"
    :step="step"
    :min="min"
    :max="max"
    :dec="dec"
    type="number"
    hide-spin-buttons
    hide-details
    outlined
    dense
    class="d-flex align-top mr-0"
    @blur="value = inputValue"
    @focus="$event.target.select()"
    @keyup.enter.exact="onEnter($event)"
  >
    <template
      v-if="resetValue"
      #append
    >
      <v-icon
        v-if="resetValue !== inputValue"
        :color="'secondary'"
        style="transform: translateX(5px) translateY(-2px);;"
        @click="handleReset()"
      >
        $reset
      </v-icon>
    </template>
    <template
      v-if="hasSpinner"
      #append-outer
    >
      <div class="_spin_button_group">
        <v-btn
          :disabled="(inputValue >= max && max !== null) || disabled"
          class="ml-0 mt-n3"
          icon
          plain
          small
          style="transform: translatex(-2px) translateY(2px);"
          @click="incrementValue()"
        >
          <v-icon>$chevronUp</v-icon>
        </v-btn>
        <v-btn
          :disabled="inputValue <= min || disabled"
          class="ml-0 mb-n3"
          icon
          plain
          small
          style="transform: translatex(-2px) translateY(-5px);"
          @click="decrementValue()"
        >
          <v-icon>$chevronDown</v-icon>
        </v-btn>
      </div>
    </template>
  </app-text-field>
</template>

<script lang="ts">
import { Component, Mixins, Prop, VModel, Watch } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import type { InputValidationRules } from 'vuetify'

@Component({})
export default class AppNumberInput extends Mixins(StateMixin) {
  @VModel({ })
    inputValue!: number

  value!: number

  @Prop({ type: String })
  readonly type?: string

  @Prop({ type: String, required: true })
  readonly label!: string

  @Prop({ })
  readonly resetValue?: number

  @Prop({ type: Boolean })
  readonly readonly?: boolean

  @Prop({ type: Boolean })
  readonly disabled?: boolean

  @Prop({ type: Boolean })
  readonly loading?: boolean

  @Prop({ type: String })
  readonly prefix!: string

  @Prop({ type: String })
  readonly suffix!: string

  @Prop({ type: Array<InputValidationRules> })
  readonly rules?: InputValidationRules[]

  @Prop({ type: Number, required: true })
  readonly min!: number

  @Prop({ type: Number })
  readonly max!: number

  @Prop({ type: Number })
  readonly step!: number

  @Prop({ type: Number, required: true })
  readonly dec!: number

  @Prop({ type: Boolean })
  readonly hasSpinner?: boolean

  @Prop({ type: Number })
  readonly spinnerFactor!: number

  created (): void {
    this.value = this.inputValue
  }

  @Watch('target')
  updateTarget (): void {
    this.value = this.inputValue
  }

  onEnter (event: { target: { blur: () => void } }) {
    this.value = this.inputValue
    this.$emit('submit', this.inputValue)
    event.target.blur()
  }

  incrementValue (): void {
    if (this.inputValue + this.step * this.spinnerFactor < this.max! || this.max === null) {
      this.inputValue = (
        Math.round((this.inputValue + this.step * this.spinnerFactor) * 10 ** this.dec) /
        10 ** this.dec
      )
    } else this.inputValue = this.max
    this.$emit('submit', this.inputValue)
  }

  decrementValue (): void {
    if (this.inputValue - this.step * this.spinnerFactor > this.min) {
      this.inputValue = (
        Math.round((this.inputValue - this.step * this.spinnerFactor) * 10 ** this.dec) /
        10 ** this.dec
      )
    } else this.inputValue = this.min
    this.$emit('submit', this.inputValue)
  }

  handleReset () {
    if (this.resetValue !== undefined) {
      this.inputValue = this.resetValue
      this.$emit('submit', this.resetValue)
    }
  }
}
</script>

<style scoped>
._spin_button_group {
    width: 24px;
    margin-top: -5px;
    margin-left: -5px;
    margin-bottom: -5px;
}
</style>
