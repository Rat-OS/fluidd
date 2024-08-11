<template>
  <v-navigation-drawer
    v-model="open"
    :color="$vuetify.theme.currentTheme.drawer"
    :mini-variant="!showSubNavigation"
    :floating="!showSubNavigation"
    clipped
    app
  >
    <v-row
      class="fill-height"
      no-gutters
    >
      <v-navigation-drawer
        :color="$vuetify.theme.currentTheme.drawer"
        mini-variant
        :value="open"
        class="pb-16 pb-sm-0"
      >
        <div
          v-if="isMobileViewport"
          :style="`height: ${$globals.HEADER_HEIGHT}px;`"
          class="app-icon"
        >
          <router-link to="/">
            <app-icon />
          </router-link>
        </div>

        <div
          v-show="authenticated && socketConnected"
          class="nav-items"
        >
          <app-nav-item
            v-for="navItem in navItems"
            :key="`navItem-${navItem.title}`"
            :icon="navItem.icon"
            :to="navItem.to"
            :external="navItem.external"
          >
            {{ navItem.title }}
          </app-nav-item>
        </div>
      </v-navigation-drawer>

      <router-view
        v-if="showSubNavigation"
        name="navigation"
      />
    </v-row>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Component, Mixins, VModel, Watch } from 'vue-property-decorator'
import StateMixin from '@/mixins/state'
import BrowserMixin from '@/mixins/browser'
import FilesMixin from '@/mixins/files'

type NavItem = {
  title: string,
  icon: string,
  to: string,
  order: number,
  external: boolean
}

@Component({})
export default class AppNavDrawer extends Mixins(StateMixin, BrowserMixin, FilesMixin) {
  @VModel({ type: Boolean })
    open?: boolean

  navItemsList: NavItem[] = []

  creatNavItemList (): NavItem[] {
    const navItemsList: NavItem[] = []
    navItemsList.push({ title: this.$t('app.general.title.home').toString(), icon: '$dash', to: '/', order: 10, external: false })
    navItemsList.push({ title: this.$t('app.general.title.console').toString(), icon: '$console', to: '/console', order: 20, external: false })
    navItemsList.push({ title: this.$t('app.general.title.gcode_preview').toString(), icon: '$cubeScan', to: '/preview', order: 30, external: false })
    navItemsList.push({ title: this.$t('app.general.title.jobs').toString(), icon: '$files', to: '/jobs', order: 40, external: false })
    if (this.supportsHistory) navItemsList.push({ title: this.$t('app.general.title.history').toString(), icon: '$history', to: '/history', order: 50, external: false })
    if (this.supportsTimelapse) navItemsList.push({ title: this.$t('app.general.title.timelapse').toString(), icon: '$video', to: '/timelapse', order: 60, external: false })
    navItemsList.push({ title: this.$t('app.general.title.tune').toString(), icon: '$tune', to: '/tune', order: 70, external: false })
    if (this.enableDiagnostics) navItemsList.push({ title: this.$t('app.general.title.diagnostics').toString(), icon: '$chart', to: '/diagnostics', order: 80, external: false })
    navItemsList.push({ title: this.$t('app.general.title.configure').toString(), icon: '$codeJson', to: '/configure', order: 90, external: false })
    navItemsList.push({ title: this.$t('app.general.title.system').toString(), icon: '$desktopTower', to: '/system', order: 100, external: false })
    navItemsList.push({ title: this.$t('app.general.title.settings').toString(), icon: '$cog', to: '/settings', order: 110, external: false })
    return navItemsList
  }

  get navItems (): NavItem[] {
    if (this.navItemsList.length === 0) {
      this.navItemsList = this.creatNavItemList()
    }
    return this.navItemsList
      .sort((a, b) => {
        return a.order - b.order
      })
  }

  set navItems (value: NavItem[]) {
    this.navItemsList = value
  }

  get customNavItems () {
    return this.$store.getters['config/getCustomThemeFile']('navi', ['.json'])
  }

  @Watch('customNavItems')
  async onCustomNavItems (value: string) {
    if (!value) {
      return
    }

    const url = await this.createFileUrlWithToken(value, 'config')
    const naviData = await (await fetch(url)).json()
    if (naviData) {
      naviData.forEach((item: { title: string; href: string; target: string; position: string; icon: string }) => {
        this.navItemsList.push({ title: item.title, icon: item.icon, to: item.href, order: parseInt(item.position), external: true })
      })
    }
  }

  get supportsHistory () {
    return this.$store.getters['server/componentSupport']('history')
  }

  get supportsTimelapse () {
    return this.$store.getters['server/componentSupport']('timelapse')
  }

  get enableDiagnostics () {
    return this.$store.state.config.uiSettings.general.enableDiagnostics
  }

  get hasSubNavigation () {
    return this.$route.meta?.hasSubNavigation ?? false
  }

  get showSubNavigation () {
    return this.hasSubNavigation && this.socketConnected && this.authenticated
  }
}
</script>

<style lang="scss" scoped>
  .app-icon {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  :deep(.v-navigation-drawer.no-subnav > .v-navigation-drawer__border) {
     display: none;
  }
</style>
