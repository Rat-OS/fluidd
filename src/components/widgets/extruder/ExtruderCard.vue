<template>
  <collapsable-card
    :title="$t('app.general.title.extruder')"
    icon="$extrusions"
    draggable
    layout-path="dashboard.extruder-card"
  >
    <extruder />
  </collapsable-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import Extruder from './Extruder.vue'

@Component({
  components: {
    Extruder
  }
})
export default class ExtruderCard extends Mixins() {
  @Prop({ type: Boolean })
  readonly menuCollapsed?: boolean
}
</script>
