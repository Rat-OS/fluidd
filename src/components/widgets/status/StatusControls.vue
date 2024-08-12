<template>
  <div>
    <v-btn
      v-if="useSmallStatusButtons && (printerPrinting || printerPaused)"
      :loading="hasWait($waits.onPrintCancel)"
      :disabled="hasWait([$waits.onPrintCancel, $waits.onPrintResume, $waits.onPrintPause])"
      fab
      x-small
      text
      class="ms-1 my-1"
      @click="cancelPrint"
    >
      <v-icon>
        $cancelled
      </v-icon>
    </v-btn>
    <v-btn
      v-if="useSmallStatusButtons && printerPrinting"
      :loading="hasWait($waits.onPrintPause)"
      :disabled="hasWait([$waits.onPrintCancel, $waits.onPrintResume, $waits.onPrintPause])"
      fab
      x-small
      text
      class="ms-1 my-1"
      @click="pausePrint"
    >
      <v-icon>
        $pause
      </v-icon>
    </v-btn>
    <v-btn
      v-if="useSmallStatusButtons && printerPaused"
      :loading="hasWait($waits.onPrintResume)"
      :disabled="hasWait([$waits.onPrintCancel, $waits.onPrintResume, $waits.onPrintPause])"
      fab
      x-small
      text
      class="ms-1 my-1"
      @click="resumePrint"
    >
      <v-icon>
        $resume
      </v-icon>
    </v-btn>
    <v-btn
      v-if="useSmallStatusButtons && (!printerPrinting && !printerPaused && filename)"
      fab
      x-small
      text
      class="ms-1 my-1"
      @click="resetFile()"
    >
      <v-icon>
        $refresh
      </v-icon>
    </v-btn>
    <v-btn
      v-if="useSmallStatusButtons && (!supportsHistoryComponent && !printerPrinting && !printerPaused && filename)"
      fab
      x-small
      text
      class="ms-1 my-1"
      @click="$emit('print', filename)"
    >
      <v-icon>
        $reprint
      </v-icon>
    </v-btn>
    <app-btn-collapse-group
      v-if="!useSmallStatusButtons"
    >
      <app-btn
        v-if="!printerPrinting || printerPaused"
        :loading="hasWait($waits.onPrintCancel)"
        :disabled="hasWait([$waits.onPrintCancel, $waits.onPrintResume, $waits.onPrintPause])"
        small
        class="ms-1 my-1"
        @click="cancelPrint"
      >
        <v-icon
          small
          left
        >
          $cancelled
        </v-icon>
        <span>{{ $t('app.general.btn.cancel') }}</span>
      </app-btn>

      <pause-resume-btn
        v-if="printerPrinting || printerPaused"
        @pause="pausePrint"
        @resume="resumePrint"
        @pauseAtLayer="showPauseAtLayerDialog = true"
      />

      <app-btn
        v-if="!printerPrinting && !printerPaused && filename"
        small
        class="ms-1 my-1"
        @click="resetFile()"
      >
        <v-icon
          small
          left
        >
          $refresh
        </v-icon>
        <span>{{ $t('app.general.btn.reset_file') }}</span>
      </app-btn>

      <app-btn
        v-if="!supportsHistoryComponent && !printerPrinting && !printerPaused && filename"
        small
        class="ms-1 my-1"
        @click="$emit('print', filename)"
      >
        <v-icon
          small
          left
        >
          $reprint
        </v-icon>
        <span>{{ $t('app.general.btn.reprint') }}</span>
      </app-btn>
    </app-btn-collapse-group>

    <v-tooltip
      v-if="printerPrinting || printerPaused"
      bottom
    >
      <template #activator="{ on, attrs }">
        <app-btn
          v-bind="attrs"
          :disabled="!hasParts"
          color=""
          fab
          x-small
          text
          class="ms-1 my-1"
          v-on="on"
          @click="showExcludeObjectDialog = true"
        >
          <v-icon>$listStatus</v-icon>
        </app-btn>
      </template>
      <span>{{ $t('app.gcode.label.exclude_object') }}</span>
    </v-tooltip>

    <exclude-objects-dialog
      v-if="showExcludeObjectDialog"
      v-model="showExcludeObjectDialog"
    />

    <pause-at-layer-dialog
      v-if="showPauseAtLayerDialog"
      v-model="showPauseAtLayerDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import JobHistoryItemStatus from '@/components/widgets/history/JobHistoryItemStatus.vue'
import ExcludeObjectsDialog from '@/components/widgets/exclude-objects/ExcludeObjectsDialog.vue'
import PauseResumeBtn from './PauseResumeBtn.vue'
import PauseAtLayerDialog from './PauseAtLayerDialog.vue'

@Component({
  components: {
    PauseResumeBtn,
    PauseAtLayerDialog,
    JobHistoryItemStatus,
    ExcludeObjectsDialog
  }
})
export default class StatusControls extends Mixins(StateMixin) {
  showExcludeObjectDialog = false
  showPauseAtLayerDialog = false

  get filename () {
    return this.$store.state.printer.printer.print_stats.filename
  }

  get supportsHistoryComponent () {
    return this.$store.getters['server/componentSupport']('history')
  }

  get hasParts () {
    return Object.keys(this.$store.getters['parts/getParts']).length > 0
  }

  get useSmallStatusButtons () {
    return this.$store.state.config.uiSettings.general.useSmallStatusButtons
  }

  resetFile () {
    this.sendGcode('SDCARD_RESET_FILE')
  }
}
</script>
