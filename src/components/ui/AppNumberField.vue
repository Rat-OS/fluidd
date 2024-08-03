<template>
  <v-text-field
    ref="field"
    v-model="inputValue"
    dense
    outlined
    hide-details
    hide-spin-buttons
    type="number"
    :label="label"
    :suffix="suffix"
    :prefix="prefix"
    :disabled="disabled"
    :rules="rules"
    :step="step"
    :min="min"
    :max="max"
    :dec="dec"
    :append-icon="klippyReady && (resetValue != undefined && resetValue !== inputValue) ? '$reset' : undefined"
    style="border-radius: 0px;"
    @blur="onBlur"
    @focus="onFocus"
    @keyup.enter.exact="onEnter($event)"
    @click:append="onReset()"
  >
    <template
      #prepend
    >
      <v-btn
        :tabindex="-1"
        :disabled="inputValue <= min || disabled"
        outlined
        x-small
        elevation="0"
        style="border-top-right-radius: 0px; border-bottom-right-radius: 0px; height: 36px; border-right: 0px;"
        :class="hasFocus ? 'primary' : 'btncolor'"
        @click="decrementValue()"
      >
        <v-icon
          :color="hasFocus ? 'black' : 'white'"
          class="pa-0 ma-0"
        >
          $minus
        </v-icon>
      </v-btn>
    </template>
    <template
      #append-outer
    >
      <v-btn
        :tabindex="-1"
        :disabled="(inputValue >= max && max !== null) || disabled"
        outlined
        x-small
        elevation="0"
        style="border-top-left-radius: 0px; border-bottom-left-radius: 0px; height: 36px; border-left: 0px;"
        :class="hasFocus ? 'primary' : 'btncolor'"
        @click="incrementValue()"
      >
        <v-icon
          :color="hasFocus ? 'black' : 'white'"
          class="pa-0 ma-0"
        >
          $plus
        </v-icon>
      </v-btn>
    </template>
  </v-text-field>
</template>

<script lang="ts">
import { Component, Mixins, Prop, VModel, Ref } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import type { InputValidationRules } from 'vuetify'
import type { VTextArea } from '@/types'

@Component({})
export default class AppNumberField extends Mixins(StateMixin) {
  @Ref('field')
  readonly field!: VTextArea

  @VModel({ type: Number, required: true })
    inputValue!: number

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

  hasFocus = false
  created () {
    this.hasFocus = false
  }

  onEnter (event: { target: { blur: () => void } }) {
    this.submit()
    event.target.blur()
  }

  onFocus (event: FocusEvent) {
    this.hasFocus = true
    if (event.target instanceof HTMLInputElement) {
      event.target.select()
    }
  }

  onBlur (event: FocusEvent) {
    if (this.hasFocus) {
      this.submit()
      this.$emit('blur', event)
      this.hasFocus = false
    }
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
    this.field.focus()
  }

  decrementValue (): void {
    if (this.inputValue - this.step > this.min) {
      this.inputValue = (
        Math.round((this.inputValue - this.step) * 10 ** this.dec) /
        10 ** this.dec
      )
    } else this.inputValue = this.min
    this.submit()
    this.field.focus()
  }
}
</script>

<style scoped>
.v-text-field>>> .v-text-field__suffix {
  opacity: 0.8;
  font-weight: 200;
  font-size: 14px;
}

.v-text-field>>> .v-label--active {
  opacity: 0.8;
  font-weight: 200;
  font-size: 14px;
  top: 8px;
}

.v-text-field>>> .v-input__append-outer {
  margin: 0px;
  padding: 0px;
  transform: translateY(-8px);
}

.v-text-field>>> .v-input__prepend-outer {
  margin: 0px;
  padding: 0px;
  transform: translateY(-8px);
}

.v-text-field>>> .v-input__append-inner {
  opacity: 0.5;
  padding: 0px;
}

.v-btn>>> .v-btn--outlined {
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
}

.v-text-field>>> .v-input__icon--append {
  transform: translateX(4px) translateY(-2px);
}
</style>
