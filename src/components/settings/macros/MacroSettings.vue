<template>
  <div>
    <v-subheader id="macros">
      {{ $t('app.setting.title.macros') }}
    </v-subheader>
    <v-card
      :elevation="5"
      dense
      class="mb-4"
    >
      <app-setting>
        <app-btn
          outlined
          small
          color="primary"
          @click="handleAddCategoryDialog"
        >
          <v-icon
            small
            left
          >
            $plus
          </v-icon>
          {{ $t('app.setting.btn.add_category') }}
        </app-btn>
      </app-setting>

      <app-draggable
        v-model="categories"
        :options="{
          animation: 200,
          handle: '.handle',
          ghostClass: 'ghost'
        }"
      >
        <section
          v-for="category in categories"
          :key="`category-${category.name}`"
        >
          <v-divider />

          <app-setting
            :accent-color="category.color"
            :r-cols="2"
            @click="handleCategoryClick(category)"
          >
            <template #title>
              <v-icon
                class="handle"
                left
              >
                $drag
              </v-icon>

              {{ category.name.toUpperCase() }}
            </template>

            <app-btn
              fab
              text
              x-small
              color=""
              class="mr-3"
              @click.stop="handleEditCategoryDialog(category)"
            >
              <v-icon color="">
                $edit
              </v-icon>
            </app-btn>

            <app-btn
              fab
              text
              x-small
              color=""
              class="mr-3"
              @click.stop="handleRemoveCategory(category)"
            >
              <v-icon color="">
                $close
              </v-icon>
            </app-btn>

            <v-switch
              class="mt-0 pt-0"
              :input-value="category.visible"
              color="primary"
              hide-details
              @click.stop
              @change="handleCategoryVisible(category, $event)"
            />
          </app-setting>
        </section>
      </app-draggable>

      <template v-if="uncategorizedMacros.count > 0">
        <v-divider />

        <!-- Add the uncategorized macros.. -->
        <app-setting
          :key="`category-uncategorized`"
          :r-cols="3"
          @click="handleCategoryClick()"
        >
          <template #title>
            {{ $t('app.general.label.uncategorized') }}
            <v-chip small>
              {{ uncategorizedMacros.visible }} / {{ uncategorizedMacros.count }}
            </v-chip>
          </template>
          <v-icon>$chevronRight</v-icon>
        </app-setting>
      </template>

      <macro-category-dialog
        v-if="categoryDialogState.open"
        v-model="categoryDialogState.open"
        :title="categoryDialogState.title"
        :label="categoryDialogState.label"
        :name="categoryDialogState.name"
        :color="categoryDialogState.color"
        :visible="categoryDialogState.visible"
        :hide-while-printing="categoryDialogState.hideWhilePrinting"
        :hide-while-paused="categoryDialogState.hideWhilePaused"
        :hide-while-standby="categoryDialogState.hideWhileStandby"
        :rules="categoryDialogState.rules"
        @save="categoryDialogState.handler"
      />
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import MacroCategoryDialog from './MacroCategoryDialog.vue'
import StateMixin from '@/mixins/state'
import type { Macro, MacroCategory } from '@/store/macros/types'

@Component({
  components: {
    MacroCategoryDialog
  }
})
export default class MacroSettings extends Mixins(StateMixin) {
  categoryDialogState: any = {
    open: false,
    title: 'add',
    label: '',
    category: null,
    name: '',
    color: '',
    visible: true,
    hideWhilePrinting: false,
    hideWhilePaused: false,
    hideWhileStandby: false,
    rules: [],
    handler: this.handleAddCategory
  }

  get categories () {
    return this.$store.getters['macros/getCategories']
  }

  set categories (categories: MacroCategory[]) {
    this.$store.dispatch('macros/saveAllCategoriesOrder', categories)
  }

  get uncategorizedMacros () {
    const uncategorized = this.$store.getters['macros/getMacrosByCategory']()
    const count = uncategorized.length
    const visible = uncategorized.filter((macro: Macro) => macro.visible).length
    return {
      count,
      visible
    }
  }

  handleAddCategoryDialog () {
    this.categoryDialogState = {
      open: true,
      title: this.$t('app.general.label.add_category'),
      label: this.$t('app.general.label.name'),
      category: null,
      name: '',
      color: '',
      visible: true,
      hideWhilePrinting: false,
      hideWhilePaused: false,
      hideWhileStandby: false,
      rules: [
        this.$rules.required,
        this.customRules.uniqueName
      ],
      handler: this.handleAddCategory
    }
  }

  handleEditCategoryDialog (category: MacroCategory) {
    this.categoryDialogState = {
      open: true,
      title: this.$t('app.general.label.edit_category'),
      label: this.$t('app.general.label.name'),
      category,
      name: category.name,
      color: category.color ?? '',
      visible: category.visible,
      hideWhilePrinting: category.hideWhilePrinting,
      hideWhilePaused: category.hideWhilePaused,
      hideWhileStandby: category.hideWhileStandby,
      rules: [
        this.$rules.required
      ],
      handler: this.handleEditCategory
    }
  }

  handleRemoveCategory (category: MacroCategory) {
    this.$store.dispatch('macros/removeCategory', category)
  }

  handleAddCategory (category: string) {
    this.$store.dispatch('macros/addCategory', category)
  }

  handleEditCategory (name: string, color: string, visible: boolean, hideWhilePrinting: boolean, hideWhilePaused: boolean, hideWhileStandby: boolean) {
    const category = {
      ...this.categoryDialogState.category,
      name,
      color,
      visible,
      hideWhilePrinting,
      hideWhilePaused,
      hideWhileStandby
    }
    this.$store.dispatch('macros/editCategory', category)
  }

  handleCategoryClick (category?: MacroCategory) {
    const id = category?.id ?? 0
    this.$router.push(`/settings/macros/${id}`)
  }

  handleCategoryVisible (category: MacroCategory, value: boolean) {
    const newCategory = {
      ...category, visible: value
    }
    this.$store.dispatch('macros/saveCategory', newCategory)
  }

  get customRules () {
    return {
      uniqueName: (v: string) => this.categories.findIndex((c: MacroCategory) => c.name.toLowerCase() === v.toLowerCase()) < 0 || this.$t('app.general.simple_form.error.exists')
    }
  }
}
</script>
