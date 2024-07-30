<template>
  <v-text-field
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
    :append-icon="klippyReady && (resetValue != undefined && resetValue !== inputValue) ? '$reset' : undefined"
    type="number"
    hide-spin-buttons
    hide-details
    outlined
    dense
    @focus="$event.target.select()"
    @keyup.enter.exact="onEnter($event)"
    @click:append="onReset()"
  >
    <template
      v-if="hasSpinner"
      #append-outer
    >
      <div class="_spin_button_group">
        <v-btn
          :tabindex="-1"
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
          :tabindex="-1"
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
  </v-text-field>
</template>

<script lang="ts">
import { Component, Mixins, Prop, VModel } from 'vue-property-decorator'
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

  onEnter (event: { target: { blur: () => void } }) {
    this.submit()
    event.target.blur()
  }

  onReset () {
    if (this.resetValue !== undefined) {
      this.inputValue = this.resetValue
      this.submit()
    }
  }

  submit () {
    this.$emit('submit', this.inputValue)
  }

  incrementValue (): void {
    if (this.inputValue + this.step < this.max! || this.max === null) {
      this.inputValue = (
        Math.round((this.inputValue + this.step) * 10 ** this.dec) /
        10 ** this.dec
      )
    } else this.inputValue = this.max
    this.submit()
  }

  decrementValue (): void {
    if (this.inputValue - this.step > this.min) {
      this.inputValue = (
        Math.round((this.inputValue - this.step) * 10 ** this.dec) /
        10 ** this.dec
      )
    } else this.inputValue = this.min
    this.submit()
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

.v-text-field>>> .v-text-field__suffix {
  opacity: 0.5;
}

.v-text-field>>> .v-label--active {
  opacity: 0.5;
  top: 8px;
}

.v-text-field>>> .v-input__append-inner {
  opacity: 0.5;
  padding: 0px;
}

.v-text-field>>> .v-input__icon--append {
  transform: translateX(4px) translateY(-2px);
}
</style>
