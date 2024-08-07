import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import type { Extruder, GcodeCommands, RunoutSensor } from '@/store/printer/types'
import type { TranslateResult } from 'vue-i18n'

export type ToolChangeCommand = {
  name: string,
  description: string | TranslateResult,
  color?: string,
  active?: boolean,
  spoolId?: number,
  default?: boolean,
  remap?: number,
  join?: number,
  runout_sensor?: string
  alert?: ToolHeadAlert
}

export type ToolHeadAlert = {
  type: string,
  text: string,
  action: string,
}

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

  get printerSupportsLeveling (): boolean {
    return this.printerSupportsZTiltAdjust || this.printerSupportsQuadGantryLevel
  }

  get printerSupportsZTiltAdjust (): boolean {
    return this.$store.getters['printer/getPrinterSupportsZTiltAdjust'] as boolean
  }

  get printerSupportsQuadGantryLevel (): boolean {
    return this.$store.getters['printer/getPrinterSupportsQuadGantryLevel'] as boolean
  }

  get printerBedLeveled (): boolean {
    return this.printerZTiltApplied || this.printerZTiltApplied
  }

  get printerZTiltApplied (): boolean {
    return this.$store.getters['printer/getPrinterZTiltApplied'] as boolean
  }

  get printerQuadGantryLevelApplied (): boolean {
    return this.$store.getters['printer/getPrinterQuadGantryLevelApplied'] as boolean
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

  get toolheadRunoutSensors (): RunoutSensor[] {
    const result = [] as RunoutSensor[]
    const sensors = this.$store.getters['printer/getRunoutSensors']
    for (const macro of this.toolChangeCommands) {
      let runoutSensor = undefined as unknown as RunoutSensor
      if (macro.runout_sensor !== undefined) {
        for (const sensor of sensors) {
          if (sensor.name.toLowerCase() === macro.runout_sensor!.toLowerCase()) {
            runoutSensor = sensor
          }
        }
      }
      result.push(runoutSensor)
    }
    return result
  }

  get allowsSpoolJoining (): boolean {
    for (const txMacro of this.toolChangeCommands) {
      if (txMacro.remap === undefined) {
        return false
      }
    }
    return true
  }

  get allowsToolheadRemapping (): boolean {
    for (const txMacro of this.toolChangeCommands) {
      if (txMacro.join === undefined) {
        return false
      }
    }
    return true
  }

  get spoolJoinActive (): boolean {
    for (const txMacro of this.toolChangeCommands) {
      if (txMacro.join?.toString() !== txMacro.name.substring(1)) {
        return true
      }
    }
    return false
  }

  get toolheadRemapActive (): boolean {
    for (const txMacro of this.toolChangeCommands) {
      if (txMacro.remap?.toString() !== txMacro.name.substring(1)) {
        return true
      }
    }
    return false
  }

  get hasToolheadAlerts (): boolean {
    for (const txMacro of this.toolChangeCommands) {
      if (txMacro.alert && txMacro.alert.toString().length > 0) {
        return true
      }
    }
    return false
  }

  get toolChangeCommands (): ToolChangeCommand[] {
    const availableCommands = this.$store.getters['printer/getAvailableCommands'] as GcodeCommands

    return Object.keys(availableCommands)
      .filter(command => /^t\d+$/i.test(command))
      .map(command => {
        const { help } = availableCommands[command]
        const description = help && help !== 'G-Code macro'
          ? help
          : this.$t('app.tool.tooltip.select_tool', { tool: command.substring(1) })

        const macro = this.$store.getters['macros/getMacroByName'](command.toLowerCase())

        const alert: ToolHeadAlert = { type: '', text: '', action: '' }
        if (macro?.variables?.alert) {
          try {
            const split = macro?.variables?.alert.split('|')
            alert.type = split[0]
            alert.text = split[1]
            alert.action = split[2]
          } catch { }
        }

        return {
          name: command,
          description,
          color: macro?.variables?.color ? `#${macro.variables.color}` : undefined,
          active: macro?.variables?.active ?? false,
          spoolId: macro?.variables?.spool_id,
          default: macro?.variables?.default ?? false,
          remap: macro?.variables?.remap,
          join: macro?.variables?.join,
          runout_sensor: macro?.variables?.runout_sensor,
          alert: alert ?? undefined
        } satisfies ToolChangeCommand
      })
      .sort((a, b) => {
        const numberA = parseInt(a.name.substring(1))
        const numberB = parseInt(b.name.substring(1))

        return numberA - numberB
      })
  }
}
