<template>
  <v-row
    ref="dashboard"
    :dense="$vuetify.breakpoint.smAndDown"
  >
    <template v-for="(container, containerIndex) in containers">
      <v-col
        v-if="(!inLayout && hasCards(container)) || (inLayout && containerIndex < currColCount)"
        :key="`container${containerIndex}`"
        :cols="currColSpan"
        :class="{ 'drag': inLayout }"
      >
        <app-draggable
          v-model="containers[containerIndex]"
          class="list-group"
          :options="{
            animation: 200,
            handle: '.handle',
            group: 'dashboard',
            disabled: !inLayout,
            ghostClass: 'ghost'
          }"
          target=":first-child"
          @end="handleUpdateLayout"
        >
          <transition-group
            type="transition"
            :name="!inLayout ? 'flip-list' : undefined"
          >
            <template v-for="c in container">
              <component
                :is="c.id"
                v-if="inLayout || (c.enabled && !filtered(c))"
                :key="c.id"
                :menu-collapsed="menuCollapsed"
                class="mb-2 mb-sm-4"
              />
            </template>
          </transition-group>
        </app-draggable>
      </v-col>
    </template>
  </v-row>
</template>

<script lang="ts">
import { Component, Mixins, Watch, Ref } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import PrinterStatusCard from '@/components/widgets/status/PrinterStatusCard.vue'
import JobsCard from '@/components/widgets/jobs/JobsCard.vue'
import ToolheadCard from '@/components/widgets/toolhead/ToolheadCard.vue'
import TemperatureCard from '@/components/widgets/thermals/TemperatureCard.vue'
import CameraCard from '@/components/widgets/camera/CameraCard.vue'
import MacrosCard from '@/components/widgets/macros/MacrosCard.vue'
import ConsoleCard from '@/components/widgets/console/ConsoleCard.vue'
import OutputsCard from '@/components/widgets/outputs/OutputsCard.vue'
import PrinterLimitsCard from '@/components/widgets/limits/PrinterLimitsCard.vue'
import RetractCard from '@/components/widgets/retract/RetractCard.vue'
import type { Layouts, LayoutConfig, LayoutContainer } from '@/store/layout/types'
import BedMeshCard from '@/components/widgets/bedmesh/BedMeshCard.vue'
import GcodePreviewCard from '@/components/widgets/gcode-preview/GcodePreviewCard.vue'
import JobQueueCard from '@/components/widgets/job-queue/JobQueueCard.vue'
import SpoolmanCard from '@/components/widgets/spoolman/SpoolmanCard.vue'
import SensorsCard from '@/components/widgets/sensors/SensorsCard.vue'
import RunoutSensorsCard from '@/components/widgets/runout-sensors/RunoutSensorsCard.vue'
import ExtruderCard from '@/components/widgets/extruder/ExtruderCard.vue'
import { throttle } from 'lodash'

@Component({
  components: {
    PrinterStatusCard,
    JobsCard,
    ToolheadCard,
    MacrosCard,
    TemperatureCard,
    CameraCard,
    PrinterLimitsCard,
    RetractCard,
    ConsoleCard,
    OutputsCard,
    BedMeshCard,
    GcodePreviewCard,
    JobQueueCard,
    SpoolmanCard,
    SensorsCard,
    RunoutSensorsCard,
    ExtruderCard
  }
})
export default class Dashboard extends Mixins(StateMixin) {
  @Ref('dashboard')
  readonly dashboardElement!: HTMLElement

  menuCollapsed = false
  containers: Array<LayoutConfig[]> = []
  columnsUsed = [0, 0, 0, 0, 0, 0]
  currColCount = 1
  currColSpan = 12

  /**
   * Lifecycle
   */
  mounted () {
    this.getUsedColumns()
    this.onLayoutChange()

    window.addEventListener('resize', throttle(this.onResize, 500))

    this.onResize()
  }

  unmounted () {
    window.removeEventListener('resize', this.onResize)
  }

  /**
   * Layout
   */
  usedColumns = [0, 0, 0, 0, 0]
  getUsedColumns () {
    const layouts = this.$store.getters['layout/getAllLayouts'] as Layouts
    let layoutIndex = 0
    let usedColumns = 0
    for (const layout in layouts) {
      if (layout.startsWith('dashboard-')) {
        if (layout) {
          const layoutContainer = this.$store.getters['layout/getLayout'](layout) as LayoutContainer
          usedColumns = 0
          for (const [key, value] of Object.entries(layoutContainer)) {
            console.log(key)
            for (const [key2, value2] of Object.entries(value)) {
              console.log(key2)
              if (value2.enabled) {
                usedColumns = usedColumns + 1
                break
              }
            }
          }
        }
        this.usedColumns[layoutIndex] = usedColumns
        layoutIndex = layoutIndex + 1
      }
    }
  }

  onResize () {
    let newColumnCount = Math.floor(window.innerWidth / this.minPanelWidth)
    newColumnCount = Math.min(newColumnCount, this.maxColumnCount)
    if (newColumnCount === 5) newColumnCount = 4
    if (!this.inLayout) {
      newColumnCount = Math.min(newColumnCount, this.usedColumns[newColumnCount === 6 ? 4 : newColumnCount - 1])
    }
    if (newColumnCount < 1) newColumnCount = 1
    const nCols = 12 / newColumnCount
    this.currColCount = newColumnCount
    this.currColSpan = nCols
    this.columnCount = newColumnCount
    this.menuCollapsed = (window.innerWidth / newColumnCount) < 560
  }

  get columnCount (): number {
    return this.$store.state.config.containerColumnCount as number
  }

  set columnCount (value: number) {
    this.$store.commit('config/setContainerColumnCount', value)
  }

  @Watch('columnCount')
  onColumnCount (value: number) {
    this.$store.commit('config/setContainerColumnCount', value)

    this.onResize()
  }

  @Watch('layoutMode')
  onLayoutModeChange () {
    this.onResize()
  }

  @Watch('layout')
  onLayoutChange () {
    const containers: Array<LayoutConfig[]> = []

    for (let index = 1; index <= this.maxColumnCount; index++) {
      const container = this.layout[`container${index}`]

      if (container?.length > 0) {
        containers.push(container)
      }
    }

    while (containers.length < this.maxColumnCount) {
      containers.push([])
    }

    this.containers = containers.slice(0, this.maxColumnCount)
  }

  hasCards (container: LayoutConfig[]) {
    return container.some(card => card.enabled && !this.filtered(card))
  }

  handleUpdateLayout () {
    if (this.columnCount === 1) {
      this.$store.dispatch('layout/onLayoutChange', {
        name: this.$store.getters['layout/getSpecificLayoutName'],
        value: {
          container1: this.containers[0]
        }
      })
    }
    if (this.columnCount === 2) {
      this.$store.dispatch('layout/onLayoutChange', {
        name: this.$store.getters['layout/getSpecificLayoutName'],
        value: {
          container1: this.containers[0],
          container2: this.containers[1]
        }
      })
    }
    if (this.columnCount === 3) {
      this.$store.dispatch('layout/onLayoutChange', {
        name: this.$store.getters['layout/getSpecificLayoutName'],
        value: {
          container1: this.containers[0],
          container2: this.containers[1],
          container3: this.containers[2]
        }
      })
    }
    if (this.columnCount === 4) {
      this.$store.dispatch('layout/onLayoutChange', {
        name: this.$store.getters['layout/getSpecificLayoutName'],
        value: {
          container1: this.containers[0],
          container2: this.containers[1],
          container3: this.containers[2],
          container4: this.containers[3]
        }
      })
    }
    if (this.columnCount === 6) {
      this.$store.dispatch('layout/onLayoutChange', {
        name: this.$store.getters['layout/getSpecificLayoutName'],
        value: {
          container1: this.containers[0],
          container2: this.containers[1],
          container3: this.containers[2],
          container4: this.containers[3],
          container5: this.containers[4],
          container6: this.containers[5]
        }
      })
    }
    this.getUsedColumns()
  }

  filtered (item: LayoutConfig) {
    // Take care of special cases.
    if (this.inLayout) return false
    if (item.id === 'camera-card' && !this.hasCameras) return true
    if (item.id === 'macros-card' && !this.hasMacros) return true
    if (item.id === 'outputs-card' && !this.hasOutputs) return true
    if (item.id === 'printer-status-card' && !this.klippyReady) return true
    if (item.id === 'job-queue-card' && !this.supportsJobQueue) return true
    if (item.id === 'retract-card' && !this.firmwareRetractionEnabled) return true
    if (item.id === 'bed-mesh-card' && !this.supportsBedMesh) return true
    if (item.id === 'runout-sensors-card' && !this.supportsRunoutSensors) return true
    if (item.id === 'spoolman-card' && !this.supportsSpoolman) return true
    if (item.id === 'sensors-card' && !this.hasSensors) return true
    if (item.id === 'temperature-card' && !this.hasHeatersOrTemperatureSensors) return true

    // Otherwise return the opposite of whatever the enabled state is.
    return !item.enabled
  }

  /**
   * Getters
   */
  get minPanelWidth () {
    return this.$store.state.config.uiSettings.general.minPanelWidth ?? 500
  }

  get useSixColumns () {
    return this.$store.state.config.uiSettings.general.useSixColumns ?? false
  }

  get maxColumnCount () {
    return this.useSixColumns ? 6 : 4
  }

  get hasCameras (): boolean {
    return this.$store.getters['webcams/getEnabledWebcams'].length > 0
  }

  get hasHeatersOrTemperatureSensors () {
    return (
      this.$store.getters['printer/getHeaters'].length > 0 ||
      this.$store.getters['printer/getOutputs'](['temperature_fan']).length > 0 ||
      this.$store.getters['printer/getSensors'].length > 0
    )
  }

  get hasSensors (): boolean {
    return this.$store.getters['sensors/getSensors'].length > 0
  }

  get firmwareRetractionEnabled (): boolean {
    return 'firmware_retraction' in this.$store.getters['printer/getPrinterSettings']()
  }

  get supportsJobQueue (): boolean {
    return this.$store.getters['server/componentSupport']('job_queue')
  }

  get supportsBedMesh () {
    return this.$store.getters['mesh/getSupportsBedMesh']
  }

  get supportsRunoutSensors () {
    return this.$store.getters['printer/getRunoutSensors'].length > 0
  }

  get supportsSpoolman () {
    return this.$store.getters['server/componentSupport']('spoolman')
  }

  get hasMacros () {
    return this.$store.getters['macros/getVisibleMacros'].length > 0
  }

  get hasOutputs () {
    return (
      this.$store.getters['printer/getControllableFans'].length > 0 ||
      this.$store.getters['printer/getUnctrollableFans'].length > 0 ||
      this.$store.getters['printer/getPins'].length > 0 ||
      this.$store.getters['printer/getAllLeds'].length > 0
    )
  }

  get layoutMode () {
    return this.$store.state.config.layoutMode
  }

  get inLayout (): boolean {
    return (this.layoutMode)
  }

  get layout () {
    const layoutName = this.$store.getters['layout/getSpecificLayoutName']
    return this.$store.getters['layout/getLayout'](layoutName)
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/draggable.scss';
</style>
