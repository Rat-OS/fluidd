<template>
  <v-expansion-panels
    v-if="klippyReady && allowsSpoolJoining || (isIdex && (idexCopy || idexMirror))"
    accordion
    multiple
    flat
    class="pb-2 pt-0 mt-4"
  >
    <v-expansion-panel>
      <v-expansion-panel-header
        class="pl-0 pr-0 pb-0 pt-0"
      >
        <template #actions>
          <v-icon
            small
            class="pa-0 ma-0 mr-1"
          >
            $expand
          </v-icon>
        </template>
        <template #default>
          <v-row
            no-gutters
            justify="start"
          >
            <v-col>
              <v-icon
                small
                primary
                class="mb-1"
                :color="spoolJoinActive ? 'primary' : ''"
                style="transform: translateY(1px);"
              >
                $filament
              </v-icon>
              <span
                :class="spoolJoinActive ? 'primary--text mr-3' : 'mr-3'"
                style="font-size: 14px"
              >
                Spool joining
              </span>
            </v-col>
          </v-row>
        </template>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <div
          class="pa-0 pb-0 mt-3"
          :class="{ 'text--disabled': !klippyReady }"
        >
          <v-row
            v-for="(joins, index) in spoolJoins"
            :key="`joins-${index}`"
            dense
          >
            <app-btn
              v-for="join in joins"
              :key="`join-${join}`"
              small
              class="ms-1 my-1"
            >
              T{{ join }}
            </app-btn>
            <app-btn
              small
              icon
              class="ms-1 my-1"
              @click="stoppSpoolJoin(joins)"
            >
              <v-icon
                small
                color="white"
              >
                $cancel
              </v-icon>
            </app-btn>
          </v-row>
          <v-row
            dense
          >
            <app-btn
              v-for="item in newJoinModel"
              :key="`addModelResult-${item}`"
              small
              class="ms-1 my-1"
            >
              {{ item }}
            </app-btn>
            <v-col
              class="pa-0 ma-0"
            >
              <v-menu
                v-if="addTools.length > 0"
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
                    {{ addNameModel }}
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
                  <template v-for="item in addTools">
                    <v-list-item
                      :key="`addModel-${item.name}`"
                      @click="selectAddModel(item)"
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
              <app-btn
                v-if="newJoinModel.length > 0"
                small
                icon
                class="ms-1 my-1"
                @click="cancel"
              >
                <v-icon
                  small
                  color="white"
                >
                  $cancel
                </v-icon>
              </app-btn>
              <app-btn
                v-if="newJoinModel.length > 1"
                small
                icon
                class="ms-1 my-1"
                @click="save"
              >
                <v-icon
                  small
                  color="white"
                >
                  $save
                </v-icon>
              </app-btn>
            </v-col>
          </v-row>
        </div>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import ToolheadMixin, { type ToolChangeCommand } from '@/mixins/toolhead'
import StateMixin from '@/mixins/state'

@Component({})
export default class SpoolJoining extends Mixins(StateMixin, ToolheadMixin) {
  addNameModel = 'Add'
  newJoinModel: string[] = []

  selectAddModel (value: ToolChangeCommand) {
    this.addNameModel = 'Add'
    this.newJoinModel.push(value.name)
  }

  get addTools () {
    const tools = this.toolChangeCommands
    return tools
      .filter(x => x.name?.toString().substring(1) === x.join?.toString())
      .filter(x => !this.newJoinModel.includes(x.name))
      .filter(x => !this.isJoined(x.name?.toString().substring(1)))
  }

  cancel () {
    this.addNameModel = 'Add'
    this.newJoinModel = []
  }

  save () {
    for (const item of this.newJoinModel) {
      this.sendGcode(`SET_GCODE_VARIABLE MACRO=${item} VARIABLE=join VALUE="'${this.newJoinModel.join('|').replace(/T/g, '')}'"`)
    }
    this.addNameModel = 'Add'
    this.newJoinModel = []
  }

  stoppSpoolJoin (join: string[] | undefined) {
    if (join) {
      for (const item of join) {
        this.sendGcode(`SET_GCODE_VARIABLE MACRO=T${item} VARIABLE=join VALUE="'${item}'"`)
      }
    }
  }

  isJoined (tool: string) {
    for (const joins of this.spoolJoins) {
      if (joins) {
        for (const join of joins) {
          if (join === tool) {
            return true
          }
        }
      }
    }
    return false
  }

  get spoolJoins () {
    const joins: (string[] | undefined)[] = []
    for (const item of this.toolChangeCommands) {
      if (item.name?.substring(1) !== item.join?.toString()) {
        const join = item.join?.toString().split('|')
        if (join) {
          const containsArray = joins.some(subArray =>
            subArray?.length === join?.length &&
            subArray?.every((value, index) => value === join[index])
          )
          if (!containsArray) {
            joins.push(join)
          }
        }
      }
    }
    return joins
  }
}
</script>

<style scoped>
.v-expansion-panel-header>>> .v-expansion-panel-header--active {
  padding: 0 !important;
}

.v-expansion-panel-content>>> .v-expansion-panel-content__wrap {
  padding: 0 !important;
}
</style>
