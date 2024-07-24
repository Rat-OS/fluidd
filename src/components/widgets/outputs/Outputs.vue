<template>
  <v-card-text>
    <v-row>
      <v-col
        cols="12"
      >
        <template v-for="(item, i) in all">
          <OutputItem
            :key="item.key"
            :item="item"
          />
          <v-divider
            v-if="i < all.length - 1"
            :key="`divider-0${i}`"
            class="my-2"
          />
        </template>
      </v-col>
    </v-row>
  </v-card-text>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import OutputItem from '@/components/widgets/outputs/OutputItem.vue'
import StateMixin from '@/mixins/state'
import type { Fan, Led, OutputPin } from '@/store/printer/types'

@Component({
  components: {
    OutputItem
  }
})
export default class Outputs extends Mixins(StateMixin) {
  get all () {
    const items: Array<Fan | Led | OutputPin> = [
      ...this.$store.getters['printer/getControllableFans'],
      ...this.$store.getters['printer/getUnctrollableAllFans'],
      ...this.$store.getters['printer/getPins'],
      ...this.$store.getters['printer/getAllLeds']
    ]
    return items
  }
}
</script>
