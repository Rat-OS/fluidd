<template>
  <collapsable-card
    :title="$t('app.general.title.bedmesh')"
    :lazy="false"
    icon="$bedMesh"
    :draggable="!fullscreen"
    :collapsable="!fullscreen"
    layout-path="dashboard.bed-mesh-card"
  >
    <template #menu>
      <v-menu
        left
        offset-y
        transition="slide-y-transition"
      >
        <template #activator="{ on, attrs, value }">
          <app-btn
            v-if="!fullscreen"
            v-bind="attrs"
            small
            class="ms-1 my-1"
            :disabled="!klippyReady || printerPrinting"
            v-on="on"
          >
            {{ $t('app.bedmesh.label.profile') }}
            <v-icon
              small
              class="ml-1"
              :class="{ 'rotate-180': value }"
            >
              $chevronDown
            </v-icon>
          </app-btn>
        </template>
        <v-list dense>
          <template v-for="item in bedMeshProfiles">
            <v-list-item
              :key="item.name"
              @click="loadProfile(item.name)"
            >
              <v-list-item-content>
                <v-list-item-title>
                  {{ item.name }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-list>
      </v-menu>

      <v-menu
        v-if="!fullscreen"
        left
        offset-y
        transition="slide-y-transition"
      >
        <template #activator="{ on, attrs, value }">
          <app-btn
            v-bind="attrs"
            small
            class="ms-1 my-1"
            v-on="on"
          >
            <v-icon
              small
              class="mr-1"
            >
              $tools
            </v-icon>
            {{ $t('app.tool.tooltip.tools') }}
            <v-icon
              small
              class="ml-1"
              :class="{ 'rotate-180': value }"
            >
              $chevronDown
            </v-icon>
          </app-btn>
        </template>
        <v-list dense>
          <v-list-item
            :loading="hasWait($waits.onMeshCalibrate)"
            :disabled="printerBusy || !allHomed"
            @click="calibrate()"
          >
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.general.btn.calibrate') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            :disabled="!hasMeshLoaded"
            @click="handleOpenSaveDialog()"
          >
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.general.btn.save_as') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            :disabled="!hasMeshLoaded"
            @click="clearMesh()"
          >
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.general.btn.clear_profile') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            :disabled="!hasMeshLoaded"
            @click="removeProfile()"
          >
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.bedmesh.tooltip.delete') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-tooltip
        v-if="canCopyImage"
        bottom
      >
        <template #activator="{ on, attrs }">
          <app-btn
            v-bind="attrs"
            color=""
            fab
            x-small
            text
            class="ms-1 my-1"
            :disabled="!hasMeshLoaded"
            v-on="on"
            @click="copyImage()"
          >
            <v-icon>$screenshot</v-icon>
          </app-btn>
        </template>
        <span>{{ $t('app.bedmesh.tooltip.copy_image') }}</span>
      </v-tooltip>

      <v-menu
        v-if="!fullscreen"
        bottom
        left
        offset-y
        transition="slide-y-transition"
        :close-on-content-click="false"
      >
        <template #activator="{ on, attrs }">
          <v-btn
            fab
            x-small
            text
            v-bind="attrs"
            class="ms-1 my-1"
            v-on="on"
          >
            <v-icon>
              $cog
            </v-icon>
          </v-btn>
        </template>

        <v-list dense>
          <v-list-item>
            <v-list-item-action class="my-0">
              <v-checkbox
                v-model="wireframe"
                :disabled="!hasMeshLoaded"
              />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.bedmesh.label.wireframe') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-action class="my-0">
              <v-checkbox
                v-model="flatSurface"
                :disabled="!hasMeshLoaded"
              />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('app.bedmesh.label.flat_surface') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-radio-group
            v-model="matrix"
            :disabled="!hasMeshLoaded"
            column
            hide-details
            class="mt-0 mb-2"
          >
            <v-list-item>
              <v-list-item-action class="my-0">
                <v-radio value="probed_matrix" />
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>
                  {{ $t('app.bedmesh.label.probed_matrix') }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-action class="my-0">
                <v-radio value="mesh_matrix" />
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>
                  {{ $t('app.bedmesh.label.mesh_matrix') }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-radio-group>
        </v-list>
      </v-menu>

      <app-btn
        v-if="!fullscreen"
        color=""
        fab
        x-small
        text
        class="ms-1 my-1"
        @click="$filters.routeTo($router, '/tune')"
      >
        <v-icon>$fullScreen</v-icon>
      </app-btn>
    </template>

    <v-card-text>
      <bed-mesh-chart
        v-if="hasMeshLoaded"
        ref="chart"
        :options="options"
        :data="series"
        :graphics="graphics"
        :height="(isMobileViewport) ? '225px' : '525px'"
      />

      <span v-else>{{ $t('app.bedmesh.msg.not_loaded') }}</span>
    </v-card-text>

    <save-mesh-dialog
      v-if="saveDialogState.open"
      v-model="saveDialogState.open"
      :existing-name="saveDialogState.existingName"
      :adaptive="saveDialogState.adaptive"
      @save="handleMeshSave"
    />
  </collapsable-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref } from 'vue-property-decorator'
import BedMeshChart from './BedMeshChart.vue'
import SaveMeshDialog from './SaveMeshDialog.vue'
import StateMixin from '@/mixins/state'
import ToolheadMixin from '@/mixins/toolhead'
import BrowserMixin from '@/mixins/browser'
import type {
  AppMeshes,
  KlipperBedMesh,
  MatrixType,
  BedMeshProfileListEntry
} from '@/store/mesh/types'

@Component({
  components: {
    BedMeshChart,
    SaveMeshDialog
  }
})
export default class BedMeshCard extends Mixins(StateMixin, ToolheadMixin, BrowserMixin) {
  @Prop({ type: Boolean })
  readonly fullscreen?: boolean

  @Ref('chart')
  readonly bedMeshChart!: BedMeshChart

  saveDialogState = {
    open: false,
    existingName: 'default',
    adaptive: false
  }

  get hasMeshLoaded () {
    const mesh = this.mesh
    const matrix = this.matrix

    return mesh && mesh[matrix] && mesh[matrix].coordinates && mesh[matrix].coordinates.length > 0
  }

  get options () {
    const map_scale = this.scale / 2
    const box_scale = this.boxScale / 2

    // These define the visualMap scaling.
    let zMin = -Math.abs(map_scale - this.mesh[this.matrix].min)
    let zMax = map_scale + this.mesh[this.matrix].max
    if (this.scale === 0) {
      // Applies the scale based on the min and max of the mesh.
      zMin = this.mesh[this.matrix].min
      zMax = this.mesh[this.matrix].max
    }

    // These define the 3d box scaling.
    const zBoxMin = -Math.abs(this.mesh[this.matrix].mid - box_scale)
    const zBoxMax = this.mesh[this.matrix].mid + box_scale

    const legends = this.series.reduce((obj, series) => {
      return Object.assign(
        obj,
        {
          [series.name]: (
            !series.name.endsWith('_flat') ||
            (
              this.flatSurface &&
              series.name.startsWith(this.matrix)
            )
          )
        }
      )
    }, Object.assign({}))

    const opts = {
      legend: {
        show: false,
        selected: legends
      },
      visualMap: {
        min: zMin,
        max: zMax,
        dimension: 2,
        seriesIndex: 0
      },
      zAxis3D: {
        min: zBoxMin,
        max: zBoxMax
      }
    }
    return opts
  }

  get series () {
    const matrix = this.matrix
    const wireframe = this.wireframe
    const series = [
      {
        type: 'surface',
        name: matrix,
        shading: 'color',
        wireframe: {
          show: wireframe
        },
        data: this.mesh[matrix].coordinates,
        dataShape: this.mesh[matrix].dimensions
      },
      this.createFlatSeries('probed_matrix_flat'),
      this.createFlatSeries('mesh_matrix_flat')
    ]
    return series
  }

  get graphics () {
    const { range } = this.mesh[this.matrix]

    return [{
      type: 'text',
      right: 10,
      top: 0,
      z: 100,
      silent: true,
      style: {
        text: `Range: ${range.toFixed(4)}`
      }
    }]
  }

  createFlatSeries (matrix: string) {
    const wireframe = this.wireframe
    return {
      type: 'surface',
      name: matrix,
      itemStyle: {
        color: [0.5, 0.5, 0.5, 0.25]
      },
      wireframe: {
        show: wireframe,
        lineStyle: {
          opacity: 0.25,
          width: 1,
          color: '#ffffff'
        }
      },
      data: this.mesh[matrix].coordinates,
      dataShape: this.mesh[matrix].dimensions
    }
  }

  calibrate () {
    this.sendGcode('BED_MESH_CALIBRATE', this.$waits.onMeshCalibrate)
  }

  get matrix () {
    return this.$store.state.mesh.matrix
  }

  get scale () {
    return this.$store.state.mesh.scale
  }

  get boxScale () {
    return this.$store.state.mesh.boxScale
  }

  get wireframe () {
    return this.$store.state.mesh.wireframe
  }

  get flatSurface () {
    return this.$store.state.mesh.flatSurface
  }

  // The current processed mesh data, if any.
  get mesh (): AppMeshes {
    return this.$store.getters['mesh/getCurrentMeshData'] as AppMeshes
  }

  get canCopyImage () {
    return (
      typeof navigator.clipboard === 'object' &&
      typeof navigator.clipboard.write === 'function' &&
      typeof ClipboardItem === 'function'
    )
  }

  copyImage () {
    this.bedMeshChart.copyImage()
  }

  // The available meshes.
  get bedMeshProfiles (): BedMeshProfileListEntry[] {
    return this.$store.getters['mesh/getBedMeshProfiles']
  }

  async loadProfile (name: string) {
    const result = (
      !this.printerPrinting ||
      await this.$confirm(
        this.$tc('app.general.simple_form.msg.confirm_clear_mesh'),
        { title: this.$tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
      )
    )

    if (result) {
      this.sendGcode(`BED_MESH_PROFILE LOAD="${name}"`)
    }
  }

  set wireframe (val: boolean) {
    this.$store.dispatch('mesh/onWireframe', val)
  }

  set flatSurface (val: boolean) {
    this.$store.dispatch('mesh/onFlatSurface', val)
  }

  set matrix (val: MatrixType) {
    this.$store.dispatch('mesh/onMatrix', val)
  }

  async clearMesh () {
    const result = (
      !this.printerPrinting ||
      await this.$confirm(
        this.$t('app.general.simple_form.msg.confirm_load_bedmesh_profile', { name }).toString(),
        { title: this.$tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
      )
    )
    if (result) {
      this.sendGcode('BED_MESH_CLEAR')
    }
  }

  removeProfile () {
    this.sendGcode(`BED_MESH_PROFILE REMOVE="${this.currentMesh.profile_name}"`)
  }

  // The current mesh, unprocessed.
  get currentMesh () {
    return this.$store.state.printer.printer.bed_mesh as KlipperBedMesh
  }

  handleOpenSaveDialog () {
    const profile = this.bedMeshProfiles.find(mesh => mesh.name === this.currentMesh.profile_name)
    this.saveDialogState = {
      open: true,
      existingName: this.currentMesh.profile_name,
      adaptive: profile?.adaptive ?? false
    }
  }

  handleMeshSave (config: {name: string; removeDefault: boolean}) {
    if (config.name !== this.currentMesh.profile_name) {
      this.sendGcode(`BED_MESH_PROFILE SAVE="${config.name}"`)
    }
    if (config.removeDefault) {
      this.sendGcode(`BED_MESH_PROFILE REMOVE="${this.currentMesh.profile_name}"`)
    }
  }
}
</script>
