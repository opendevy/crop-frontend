<template>
  <div class="tab-menu-container">
    <div class="option-tab-group fcs-container">
      <div v-for="tab in tabList" :key="tab.key" class="option-tab">
        <Button
          :class="`${fontSize} weight-semi icon-cursor ${filterTab === tab.key ? 'active-tab' : ''}`"
          @click="setTab(tab.key)"
          >{{ tab.name }}</Button
        >
        <div v-if="filterTab === tab.key" class="active-underline"></div>
      </div>
    </div>

    <div
      class="option-tab-group option-tab-collapse icon-cursor"
      @click="
        () => {
          this.showTabMenu = !this.showTabMenu
        }
      "
    >
      <label :class="`${fontSize} weight-semi icon-cursor`">
        {{ currentTab }}
      </label>
      <img :class="`arrow-icon ${showTabMenu ? 'arrow-up' : 'arrow-down'}`" src="@/assets/icons/arrow-down-white.svg" />

      <div
        v-if="showTabMenu"
        class="option-item-collapse collapse-left"
        v-click-outside="
          () => {
            this.showTabMenu = false
          }
        "
      >
        <div
          v-for="tab in tabList"
          :key="tab.key"
          :class="`collapse-item text-center font-medium weight-semi icon-cursor ${
            filterTab === tab.key ? 'active-item' : ''
          }`"
          @click="setTab(tab.key)"
        >
          {{ tab.short_name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
const Vco = require('v-click-outside')
Vue.use(Vco)

export default Vue.extend({
  components: {},
  props: {
    tabList: {
      type: [Array, Object],
      default: function () {
        return []
      }
    },
    default: {
      type: String,
      default: ''
    },
    fontSize: {
      type: String,
      default: 'font-large'
    }
  },
  data() {
    return {
      filterTab: '' as string,
      showTabMenu: false as boolean,
      currentTab: '' as string
    }
  },
  watch: {
    default: {
      handler(newActive: string) {
        this.filterTab = this.$props.default
      },
      deep: true
    }
  },
  mounted() {
    if (this.$props.tabList.length > 0) {
      if (this.$props.default) this.filterTab = this.$props.default
      else this.filterTab = this.$props.tabList[0].key
      this.currentTab = this.$props.tabList[0].short_name
    }
  },

  methods: {
    setTab(key: string) {
      this.filterTab = key
      this.currentTab = this.$props.tabList.find((tab: any) => tab.key === key).short_name
      this.$emit('onChange', this.filterTab)
    }
  }
})
</script>

<style lang="less" scoped>
.tab-menu-container {
  .option-tab-group {
    @media @max-sl-mobile {
      display: none !important;
    }

    &.option-tab-collapse {
      display: none;

      @media @max-sl-mobile {
        position: relative;
        display: flex !important;
        align-items: center;
        padding: 6px 10px;
        border: 2px solid @color-blue500;
        border-radius: 8px;
        width: fit-content;

        label {
          color: @color-petrol500;
        }

        .arrow-icon {
          transition: all 0.3s;
          margin-left: 4px;

          &.arrow-up {
            transform: rotate(180deg);
          }
        }
      }

      .option-item-collapse {
        position: absolute;
        top: 50px;
        background: @gradient-color-primary;
        background-origin: border-box;
        border: 2px solid rgba(255, 255, 255, 0.14);
        box-shadow: 18px 11px 14px rgba(0, 0, 0, 0.25);
        border-radius: 8px;
        min-width: 188px;
        z-index: 999;

        &.collapse-left {
          left: 0;
        }

        &.collapse-right {
          right: 0;
        }

        .collapse-item {
          padding: 18px 0;
          border-bottom: 1px solid #c4c4c420;

          &:last-child {
            border-bottom: 0;
          }

          &.active-item {
            color: @color-petrol500;
          }

          a {
            color: #fff;
          }
        }
      }
    }

    .option-tab {
      margin-right: 38px;

      @media @max-sl-mobile {
        margin-right: 28px;
      }

      &:last-child {
        margin-right: 0;
      }

      button {
        background: transparent;
        border: none;
        outline: none;
        padding: 0;
        margin-bottom: 8px;

        &.active-tab {
          color: @color-petrol500;
        }
      }

      .active-underline {
        height: 4px;
        border-radius: 10px;
        background: @color-petrol400;
      }
    }
  }
}
</style>