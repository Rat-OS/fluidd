<template>
  <v-row v-if="isIdex && hasIdexCommands">
    <v-col>
      <app-btn-group
        class="app-toolchanger-control d-flex"
      >
        <app-btn
          small
          class="px-0 flex-grow-1"
          :disabled="!klippyReady || printerPrinting || !allHomed"
          :color="!idexCopy && !idexMirror ? 'primary' : undefined"
          :loading="hasWait(`${$waits.onIdexMode}${'IDEX_SINGLE'}`)"
          @click="sendGcode('IDEX_SINGLE', `${$waits.onIdexMode}${'IDEX_SINGLE'}`)"
        >
          {{ $t('app.tool.idex.single_mode') }}
        </app-btn>
        <app-btn
          small
          class="px-0 flex-grow-1"
          :disabled="!klippyReady || printerPrinting || !allHomed"
          :color="idexCopy ? 'primary' : undefined"
          dense
          :loading="hasWait(`${$waits.onIdexMode}${'IDEX_COPY'}`)"
          @click="sendGcode('IDEX_COPY', `${$waits.onIdexMode}${'IDEX_COPY'}`)"
        >
          {{ $t('app.tool.idex.copy_mode') }}
        </app-btn>
        <app-btn
          small
          class="px-0 flex-grow-1"
          :disabled="!klippyReady || printerPrinting || !allHomed"
          :color="idexMirror ? 'primary' : undefined"
          dense
          :loading="hasWait(`${$waits.onIdexMode}${'IDEX_MIRROR'}`)"
          @click="sendGcode('IDEX_MIRROR', `${$waits.onIdexMode}${'IDEX_MIRROR'}`)"
        >
          {{ $t('app.tool.idex.mirror_mode') }}
        </app-btn>
        <app-btn
          v-if="hasIdexParkCommand"
          small
          class="px-0 flex-grow-1"
          :disabled="!klippyReady || printerPrinting || !allHomed || idexCopy || idexMirror"
          dense
          :loading="hasWait(`${$waits.onIdexMode}${'IDEX_PARK'}`)"
          @click="sendGcode('IDEX_PARK', `${$waits.onIdexMode}${'IDEX_PARK'}`)"
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
import type { GcodeCommands } from '@/store/printer/types'

@Component({})
export default class ToolHeadIdexControl extends Mixins(StateMixin, ToolheadMixin) {
[x: string]: any

get availableCommands (): GcodeCommands {
  return this.$store.getters['printer/getAvailableCommands'] as GcodeCommands
}

get hasIdexCommands (): boolean {
  return 'IDEX_SINGLE' in this.availableCommands && 'IDEX_COPY' in this.availableCommands && 'IDEX_MIRROR' in this.availableCommands
}

get hasIdexParkCommand (): boolean {
  return 'IDEX_PARK' in this.availableCommands
}
}

</script>

<style lang="scss" scoped>
  @import 'vuetify/src/styles/styles.sass';
</style>
