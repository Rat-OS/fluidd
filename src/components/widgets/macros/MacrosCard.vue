<template>
  <collapsable-card
    :title="$t('app.general.title.macros')"
    icon="$fileCode"
    draggable
    layout-path="dashboard.macros-card"
  >
    <template #menu>
      <v-btn
        fab
        x-small
        text
        class="ms-1 my-1"
        @click="handleSettings"
      >
        <v-icon>
          $edit
        </v-icon>
      </v-btn>
    </template>
    <macros />
  </collapsable-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Macros from '@/components/widgets/macros/Macros.vue'

@Component({
  components: {
    Macros
  }
})
export default class MacrosCard extends Vue {
  handleSettings () {
    this.$router.push('/settings/#macros')
  }
}
</script>
