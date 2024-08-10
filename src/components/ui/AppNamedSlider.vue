<template>
  <v-form
    ref="form"
    :class="{'full-width-slider': fullWidth}"
    @submit.prevent
  >
    <v-row
      no-gutters
      justify="space-between"
    >
      <!-- Label -->
      <v-col
        cols="auto"
        justify="start"
        class="py-0 pt-1"
      >
        <v-btn
          v-if="locked && isMobileViewport"
          icon
          small
          :disabled="disabled"
          :tabindex="-1"
          style="margin-top: -4px;"
          @click="internalLocked = !internalLocked"
        >
          <v-icon
            v-if="internalLocked"
            small
          >
            $pencil
          </v-icon>
          <v-icon
            v-else
            small
          >
            $lockReset
          </v-icon>
        </v-btn>
        <v-btn
          v-if="!locked && !internalLocked && icon"
          icon
          small
          :tabindex="-1"
          :disabled="disabled"
          style="margin-top: -4px;"
        >
          <v-icon
            small
            :color="(isFan || isPin) && sliderValue > 0 ? 'primary' : undefined"
            :class="{ 'spin': isFan && sliderValue > 0 }"
          >
            {{ icon }}
          </v-icon>
        </v-btn>
        <span
          class="text-body-1"
          :class="{ 'text--disabled': disabled }"
        >
          {{ label }}
        </span>
      </v-col>

      <!-- Current value -->
      <v-col
        cols="auto"
        justify="end"
        class="py-0 mb-1"
        align-self="end"
      >
        <v-responsive
          class="ma-0 pa-0"
          :width="inputWidth"
        >
          <v-text-field
            ref="field"
            v-model="currentValue"
            :prefix="prefix"
            :suffix="suffix"
            :rules="textRules"
            :disabled="disabled || loading || internalLocked"
            class="v-input--text-right v-input--x-dense d-flex"
            type="number"
            single-line
            outlined
            hide-details
            append-inner-icon="$lockReset"
            @focus="handleFocus"
            @blur="handleBlur"
            @keyup.enter.exact="handleSubmit(+currentValue)"
          >
            <template
              v-if="resetValue !== undefined && resetValue.toString() !== currentValue"
              #append
            >
              <v-icon
                :disabled="disabled || loading || internalLocked"
                :color="'secondary'"
                style="transform: translateX(5px) translateY(-2px);;"
                @click="handleReset"
              >
                $reset
              </v-icon>
            </template>
          </v-text-field>
        </v-responsive>
      </v-col>
    </v-row>

    <v-slider
      v-model="sliderValue"
      :min="min"
      :max="internalMax"
      :step="step"
      :disabled="disabled || loading || internalLocked || overridden"
      dense
      hide-details
      @start="handleStart"
      @end="handleEnd"
      @change="handleChange"
    >
      <template #prepend>
        <v-icon
          :disabled="internalLocked || sliderValue <= min"
          style="transform: translateY(2px);"
          @click="minus"
        >
          $minus
        </v-icon>
      </template>
      <template #append>
        <v-icon
          :disabled="internalLocked || (sliderValue >= max && !step)"
          style="transform: translateY(2px);"
          @click="plus"
        >
          $plus
        </v-icon>
      </template>
    </v-slider>
  </v-form>
</template>

<script lang="ts">
import { Component, Prop, Watch, Ref, VModel, Mixins } from 'vue-property-decorator'
import type { InputValidationRules } from 'vuetify'
import type { VForm, VTextArea } from '@/types'
import BrowserMixin from '@/mixins/browser'

@Component({})
export default class AppNamedSlider extends Mixins(BrowserMixin) {
  @Ref('field')
  readonly field!: VTextArea

  @VModel({ type: Number, required: true })
    inputValue!: number

  @Prop({ type: Number })
  readonly resetValue?: number

  @Prop({ type: String, required: true })
  readonly label!: string

  @Prop({ type: Array<InputValidationRules> })
  readonly rules?: InputValidationRules[]

  @Prop({ type: Boolean })
  readonly disabled?: boolean

  @Prop({ type: Boolean })
  readonly locked?: boolean

  @Prop({ type: Boolean })
  readonly loading?: boolean

  @Prop({ type: Number, default: 0 })
  readonly min!: number

  @Prop({ type: Number, default: 100 })
  readonly max!: number

  @Prop({ type: Boolean })
  readonly overridable?: boolean

  @Prop({ type: Number, default: 1 })
  readonly step!: number

  @Prop({ type: String })
  readonly prefix?: string

  @Prop({ type: String })
  readonly suffix?: string

  @Prop({ type: Boolean })
  readonly fullWidth?: boolean

  @Prop({ type: String })
  readonly icon?: string

  @Prop({ type: Boolean, default: false })
  readonly isFan?: boolean

  @Prop({ type: Boolean, default: false })
  readonly isPin?: boolean

  @Prop({ type: Number, default: 0 })
  readonly fanSpeed!: number

  @Prop({ type: Number, default: 100 })
  readonly inputWidth!: number

  @Ref('form')
  readonly form!: VForm

  @Watch('value')
  onValue (value: number) {
    if (!this.hasFocus) {
      this.currentValue = value.toString()
    }
  }

  @Watch('currentValue')
  onCurrentValue (value: string) {
    const valueAsNumber = +value

    if (!isNaN(valueAsNumber)) {
      this.checkOverride(valueAsNumber)
      this.sliderValue = valueAsNumber
    }
  }

  @Watch('sliderValue')
  onSliderValue (value: number) {
    if (!this.hasFocus) {
      this.currentValue = value.toString()
    }
    this.$emit('input', value)
  }

  @Watch('locked')
  onLocked (value: boolean) {
    this.internalLocked = value
  }

  @Watch('max')
  onMax () {
    this.checkOverride(this.sliderValue)
  }

  currentValue = ''
  sliderValue = 0
  internalLocked? = false
  internalMax = 0
  overridden = false
  hasFocus = false

  get textRules () {
    // Apply a min and max rule as per the slider.
    const rules = [
      ...this.rules || [],
      this.$rules.numberValid,
      this.$rules.numberGreaterThanOrEqual(this.min)
    ]
    if (!this.overridable) {
      rules.push(
        this.$rules.numberLessThanOrEqual(this.max)
      )
    }
    return rules
  }

  checkOverride (value: number) {
    if (value > this.max && this.overridable) {
      // This is overridable, and the user wants to increase
      // past the given max. So, disable the slider - and let it be.
      this.overridden = true
      this.internalMax = value
    } else {
      // This is not overridable, or the user has reverted back to a value
      // within the given max. So, re-enable the slider - and let it be.
      this.overridden = false
      this.internalMax = this.max
    }
  }

  submitValue (value: number) {
    if (this.form.validate()) {
      this.currentValue = value.toString()

      this.internalLocked = this.locked

      this.$emit('submit', value)
    }
  }

  handleReset () {
    if (this.resetValue !== undefined) {
      console.error('handleReset ' + this.resetValue)
      this.$emit('change', this.resetValue)
      this.submitValue(this.resetValue)
    }
  }

  handleFocus (event: FocusEvent) {
    this.hasFocus = true

    if (event.target instanceof HTMLInputElement) {
      event.target.select()
    }
  }

  handleBlur () {
    if (this.hasFocus) {
      this.$emit('change', this.currentValue)

      this.currentValue = this.inputValue.toString()

      this.hasFocus = false
    }
  }

  handleSubmit (value: number) {
    this.submitValue(value)
  }

  handleStart (value: number) {
    this.hasFocus = false
    this.$emit('start', value)
  }

  handleEnd (value: number) {
    this.$emit('end', value)
  }

  handleChange (value: number) {
    this.submitValue(value)
  }

  created () {
    this.currentValue = this.inputValue.toString()
    this.sliderValue = this.inputValue
    this.internalLocked = this.locked
    this.internalMax = this.max
  }

  minus (): void {
    this.sliderValue = this.sliderValue > this.min ? Math.round(this.sliderValue - this.step) : this.min
    this.handleChange(this.sliderValue)
    this.field.focus()
  }

  plus (): void {
    this.sliderValue = this.sliderValue < this.max || this.step ? Math.round(this.sliderValue + this.step) : this.max
    this.handleChange(this.sliderValue)
    this.field.focus()
  }
}
</script>

<style lang="scss" scoped>
.full-width-slider {
  width: 100%;
}
</style>
