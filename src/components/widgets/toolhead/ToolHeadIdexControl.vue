<template>
  <v-row v-if="isIdex">
    <v-col>
      <app-btn-group
        class="app-toolchanger-control d-flex"
        :class="{
          [$vuetify.theme.dark ? 'theme--dark': 'theme--light']: true,
        }"
      >
        <app-btn
          class="px-0 flex-grow-1"
          :disabled="!klippyReady || printerPrinting || !allHomed"
          :color="idexMode != 'copy' && idexMode != 'mirror' ? 'primary' : undefined"
          @click="setSingleMode()"
        >
          {{
            isSwapped && allHomed
              ? $t('app.tool.idex.single_mode_swapped')
              : $t('app.tool.idex.single_mode')
          }}
        </app-btn>
        <app-btn
          class="px-0 flex-grow-1"
          :disabled="!klippyReady || printerPrinting || !allHomed"
          :color="idexMode == 'copy' ? 'primary' : undefined"
          dense
          @click="setCopyMode()"
        >
          {{ $t('app.tool.idex.copy_mode') }}
        </app-btn>
        <app-btn
          class="px-0 flex-grow-1"
          :disabled="!klippyReady || printerPrinting || !allHomed"
          :color="idexMode == 'mirror' ? 'primary' : undefined"
          dense
          @click="setMirrorMode()"
        >
          {{ $t('app.tool.idex.mirror_mode') }}
        </app-btn>
        <app-btn
          v-if="hasFilamentSensor"
          class="px-0 flex-grow-1"
          :disabled="!allHomed || idexMode == 'copy' || idexMode == 'mirror'"
          :color="isSpoolJoin && idexMode != 'copy' && idexMode != 'mirror' ? 'primary' : undefined"
          dense
          @click="setSpoolMode()"
        >
          {{ $t('app.tool.idex.spool_join') }}
        </app-btn>
        <app-btn
          class="px-0 flex-grow-1"
          :disabled="!klippyReady || printerPrinting || !allHomed || idexMode == 'copy' || idexMode == 'mirror'"
          dense
          @click="sendGcode('IDEX_PARK')"
        >
          {{ $t('app.tool.idex.park_toolhead') }}
        </app-btn>
      </app-btn-group>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import ToolheadMixin from '@/mixins/toolhead'

@Component({})
export default class ToolHeadIdexControl extends Mixins(StateMixin, ToolheadMixin) {
[x: string]: any

get isIdex (): boolean {
  return 'dual_carriage' in this.$store.state.printer.printer
}

get idexMode (): string {
  return this.$store.state.printer.printer.dual_carriage?.carriage_1?.toString().toLowerCase()
}

swapped = false
get isSwapped (): boolean {
  return this.swapped
}

setSingleMode (): void {
  // eslint-disable-next-line eqeqeq
  if (this.idexMode != 'copy' && this.idexMode != 'mirror') {
    this.swapped = !this.swapped
    this.sendGcode('REMAP_TOOLHEADS TOOLHEADS=' + (this.swapped ? '0,1' : ''))
  } else {
    this.swapped = false
    this.sendGcode('IDEX_SINGLE')
  }
  this.$forceUpdate()
}

spoolJoin = false
get isSpoolJoin (): boolean {
  return this.spoolJoin
}

get hasFilamentSensor (): boolean {
  try {
    const toolhead_filament_sensor_t0 = this.$store.state.printer.printer.configfile?.settings?.toolhead_filament_sensor_t0
    const toolhead_filament_sensor_t1 = this.$store.state.printer.printer.configfile?.settings?.toolhead_filament_sensor_t1
    return true
  } catch { }
  try {
    const feeder_filament_sensor_t0 = this.$store.state.printer.printer.configfile?.settings?.feeder_filament_sensor_t0
    const feeder_filament_sensor_t1 = this.$store.state.printer.printer.configfile?.settings?.feeder_filament_sensor_t1
    return true
  } catch { }
  return false
}

setSpoolMode (): void {
  this.spoolJoin = !this.spoolJoin
  this.sendGcode('JOIN_SPOOLS SPOOLS=' + (this.spoolJoin ? '0,1' : ''))
  this.$forceUpdate()
}

setCopyMode (): void {
  this.swapped = false
  this.spoolJoin = false
  this.sendGcode('IDEX_COPY')
}

setMirrorMode (): void {
  this.swapped = false
  this.spoolJoin = false
  this.sendGcode('IDEX_MIRROR')
}
}

</script>

<style lang="scss" scoped>
  @import 'vuetify/src/styles/styles.sass';
</style>
