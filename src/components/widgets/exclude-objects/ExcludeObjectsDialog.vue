<template>
  <app-dialog
    v-model="open"
    :title="$t('app.gcode.label.exclude_object')"
    max-width="500"
    no-actions
  >
    <svg
      :viewBox="svgViewBox"
      height="100%"
      width="100%"
      class="partIcon"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <pattern
          id="backgroundPattern"
          patternUnits="userSpaceOnUse"
          width="10"
          height="10"
        >
          <rect
            width="10"
            height="10"
            stroke-width=".1"
            :stroke="themeIsDark ? 'black' : 'white'"
            :fill="themeIsDark ? '#555' : 'lightgrey'"
          />
        </pattern>
        <clipPath
          v-if="hasRoundBed"
          id="clipCircle"
        >
          <circle
            :r="bedSize.maxX"
            cx="0"
            cy="0"
          />
        </clipPath>
      </defs>
      <g :transform="flipTransform">
        <g
          id="background"
        >
          <rect
            :height="bedSize.maxY - bedSize.minY"
            :width="bedSize.maxX - bedSize.minX"
            fill="url(#backgroundPattern)"
            :clip-path="hasRoundBed ? 'url(#clipCircle)' : undefined"
            :x="bedSize.minX"
            :y="bedSize.minY"
          />
        </g>
        <g
          v-if="parts.length > 0"
          id="parts"
        >
          <path
            v-for="(part, index) of parts"
            :key="`part-${index + 1}`"
            v-touch:tap="() => cancelObject(part)"
            shape-rendering="geometricPrecision"
            :d="partSVG(part)"
            fill-opacity="0.4"
            :stroke="themeIsDark ? 'black' : 'white'"
            :fill="!isPartExcluded(part) ? 'green' : 'red'"
          />
        </g>
      </g>
    </svg>
    <v-simple-table>
      <tbody>
        <tr
          v-for="name in parts"
          :key="name"
        >
          <td
            :class="{
              'text--disabled': isPartExcluded(name),
              'info--text': isPartCurrent(name)
            }"
            class="partName"
          >
            {{ name }}
          </td>
          <td class="actions">
            <app-btn
              color=""
              x-small
              fab
              text
              :disabled="isPartExcluded(name)"
              @click="cancelObject(name)"
            >
              <v-icon color="error">
                $cancelled
              </v-icon>
            </app-btn>
          </td>
        </tr>
      </tbody>
    </v-simple-table>
  </app-dialog>
</template>

<script lang="ts">
import { Component, Mixins, VModel } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import BrowserMixin from '@/mixins/browser'
import type { BedSize } from '@/store/printer/types'
import type { BBox } from '@/store/gcodePreview/types'

@Component({
  components: {
  }
})
export default class ExcludeObjectDialog extends Mixins(StateMixin, BrowserMixin) {
  @VModel({ type: Boolean })
    open?: boolean

  partSVG (name: string) {
    return this.$store.getters['parts/getPartSVG'](name)
  }

  get themeIsDark (): boolean {
    return this.$store.state.config.uiSettings.theme.isDark
  }

  get flipX (): boolean {
    return this.$store.state.config.uiSettings.gcodePreview.flip.horizontal
  }

  get flipY (): boolean {
    return this.$store.state.config.uiSettings.gcodePreview.flip.vertical
  }

  get flipTransform () {
    const { x, y } = this.viewBox

    const scale = [
      this.flipX ? -1 : 1,
      this.flipY ? -1 : 1
    ]

    const transform = [
      this.flipX ? -(x.max + x.min) : 0,
      this.flipY ? -(y.max + y.min) : 0
    ]

    return `scale(${scale.join()}) translate(${transform.join()})`
  }

  get hasRoundBed (): boolean {
    return this.$store.getters['printer/getHasRoundBed'] as boolean
  }

  get bedSize (): BedSize {
    const bedSize = this.$store.getters['printer/getBedSize'] as BedSize | undefined

    return bedSize ?? {
      minX: 0,
      minY: 0,
      maxX: 100,
      maxY: 100
    }
  }

  get viewBox (): BBox {
    const bounds = this.bounds
    const bedSize = this.bedSize
    return {
      x: {
        min: Math.min(bedSize.minX, bounds.x.min) - 2,
        max: Math.max(bedSize.maxX, bounds.x.max) + 2
      },
      y: {
        min: Math.min(bedSize.minY, bounds.y.min) - 2,
        max: Math.max(bedSize.maxY, bounds.y.max) + 2
      }
    }
  }

  get svgViewBox () {
    const { x, y } = this.viewBox

    return `${x.min} ${y.min} ${x.max - x.min} ${y.max - y.min}`
  }

  get bounds (): BBox {
    return this.$store.getters['gcodePreview/getBounds'] as BBox
  }

  get parts () {
    const parts = this.$store.getters['parts/getParts']
    return Object.keys(parts)
  }

  isPartExcluded (name: string) {
    return this.$store.getters['parts/getIsPartExcluded'](name)
  }

  isPartCurrent (name: string) {
    return this.$store.getters['parts/getIsPartCurrent'](name)
  }

  async cancelObject (name: string) {
    const result = await this.$confirm(
      this.$tc('app.general.simple_form.msg.confirm_exclude_object'),
      { title: this.$tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
    )

    if (result) {
      const reqId = name.toUpperCase().replace(/\s/g, '_')

      this.sendGcode(`EXCLUDE_OBJECT NAME=${reqId}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.partName {
  word-break: break-all;
}

.actions {
  width: 32px;
}

.preview-options,
.preview-name {
  position: absolute;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.75);
  font-weight: 100;
}

.preview-options {
  top: 0;
  border-bottom-right-radius: 4px;
}

.preview-name {
  bottom: 0;
  border-top-right-radius: 4px;
}

.theme--light {
  .preview-options,
  .preview-name {
    background: rgba(255, 255, 255, 0.75);
  }
}

:deep(.v-input__slot) {
  overflow: hidden;
  max-height: calc(100vh - 380px);
  max-height: calc(100svh - 380px);
  min-height: 250px !important;
  aspect-ratio: 1;

  svg {
    shape-rendering: geometricPrecision;
  }
}

</style>
