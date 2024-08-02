import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import type { Extruder } from '@/store/printer/types'

@Component
export default class ToolheadMixin extends Vue {
  get hasExtruder (): boolean {
    return this.$store.getters['printer/getHasExtruder'] as boolean
  }

  get hasMultipleExtruders (): boolean {
    return this.$store.getters['printer/getHasMultipleExtruders'] as boolean
  }

  get activeExtruder (): Extruder | undefined {
    return this.$store.getters['printer/getActiveExtruder'] as Extruder | undefined
  }

  get selectedExtruder () {
    return this.$store.state.config.uiSettings.general.selectedExtruder ?? this.$store.state.printer.printer.toolhead?.extruder
  }

  get idexT0Extruder (): Extruder | undefined {
    return this.$store.getters['printer/getExtruderByName']('extruder') as Extruder
  }

  get idexT1Extruder (): Extruder | undefined {
    return this.$store.getters['printer/getExtruderByName']('extruder1') as Extruder
  }

  get activeExtruderReady (): boolean {
    if (this.idexCopy || this.idexMirror) {
      const idexT0Extruder = this.idexT0Extruder
      const idexT1Extruder = this.idexT1Extruder
      const idexT0ExtruderReady = (idexT0Extruder?.can_extrude ??
        (
          idexT0Extruder !== undefined &&
          idexT0Extruder.temperature >= 0 &&
          idexT0Extruder.min_extrude_temp >= 0 &&
          idexT0Extruder.temperature >= idexT0Extruder.min_extrude_temp
        )
      )
      const idexT1ExtruderReady = (idexT1Extruder?.can_extrude ??
        (
          idexT1Extruder !== undefined &&
          idexT1Extruder.temperature >= 0 &&
          idexT1Extruder.min_extrude_temp >= 0 &&
          idexT1Extruder.temperature >= idexT1Extruder.min_extrude_temp
        )
      )
      return idexT1ExtruderReady && idexT0ExtruderReady
    } else {
      const activeExtruder = this.activeExtruder
      const activeExtruderReady = (activeExtruder?.can_extrude ??
        (
          activeExtruder !== undefined &&
          activeExtruder.temperature >= 0 &&
          activeExtruder.min_extrude_temp >= 0 &&
          activeExtruder.temperature >= activeExtruder.min_extrude_temp
        )
      )
      return activeExtruderReady
    }
  }

  get selectedExtruderReady (): boolean {
    if (this.idexCopy || this.idexMirror) {
      return this.activeExtruderReady
    } else {
      const selectedExtruder = this.$store.getters['printer/getExtruderByName'](this.selectedExtruder) as Extruder
      return (selectedExtruder?.can_extrude ??
        (
          selectedExtruder !== undefined &&
          selectedExtruder.temperature >= 0 &&
          selectedExtruder.min_extrude_temp >= 0 &&
          selectedExtruder.temperature >= selectedExtruder.min_extrude_temp
        )
      )
    }
  }

  get filamentDiameter (): number {
    return this.activeExtruder?.config?.filament_diameter || 1.75
  }

  get nozzleDiameter (): number {
    return this.activeExtruder?.config?.nozzle_diameter || 0.4
  }

  get maxExtrudeSpeed (): number {
    return this.activeExtruder?.config?.max_extrude_only_velocity || 500
  }

  get maxExtrudeLength (): number {
    return this.activeExtruder?.config?.max_extrude_only_distance || 50
  }

  get allHomed (): boolean {
    return this.$store.getters['printer/getHomedAxes']('xyz') as boolean
  }

  get xyHomed (): boolean {
    return this.$store.getters['printer/getHomedAxes']('xy') as boolean
  }

  get xHomed (): boolean {
    return this.$store.getters['printer/getHomedAxes']('x') as boolean
  }

  get yHomed (): boolean {
    return this.$store.getters['printer/getHomedAxes']('y') as boolean
  }

  get zHomed (): boolean {
    return this.$store.getters['printer/getHomedAxes']('z') as boolean
  }

  get xHasMultipleSteppers (): boolean {
    return !!this.$store.getters['printer/getPrinterSettings']('stepper_x1') as boolean
  }

  get yHasMultipleSteppers (): boolean {
    return !!this.$store.getters['printer/getPrinterSettings']('stepper_y1') as boolean
  }

  get zHasMultipleSteppers (): boolean {
    return !!this.$store.getters['printer/getPrinterSettings']('stepper_z1') as boolean
  }

  get hasHomingOverride (): boolean {
    return this.$store.getters['printer/getHasHomingOverride'] as boolean
  }

  get isManualProbeActive (): boolean {
    return this.$store.getters['printer/getIsManualProbeActive'] as boolean
  }

  get isBedScrewsAdjustActive (): boolean {
    return this.$store.getters['printer/getIsBedScrewsAdjustActive'] as boolean
  }

  get hasScrewsTiltAdjustResults (): boolean {
    return this.$store.getters['printer/getHasScrewsTiltAdjustResults'] as boolean
  }

  get isIdex (): boolean {
    return 'dual_carriage' in this.$store.state.printer.printer
  }

  get idexMode (): string {
    return this.$store.state.printer.printer.dual_carriage?.carriage_1?.toString().toLowerCase()
  }

  get idexCopy (): boolean {
    return this.isIdex && this.idexMode === 'copy'
  }

  get idexMirror (): boolean {
    return this.isIdex && this.idexMode === 'mirror'
  }
}
