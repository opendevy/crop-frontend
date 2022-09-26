<template>
  <div class="progress-container">
    <Progress
      type="line"
      :stroke-width="14"
      :percent="Number(percent.toFixed(1))"
      :show-info="false"
    />
    <div class="progress-info-container">
      <div
        v-if="Number(percent.toFixed(1)) > 1"
        class="progress-end"
        :style="'margin-left: calc(' + Number(percent.toFixed(1)) + '% - 2px)'"
      ></div>
      <div
        class="progress-percent-container fcs-container"
        :class="percent === 100 ? 'max' : ''"
        :style="
          Number(percent.toFixed(1)) < 90
            ? 'margin-left: calc(' + Number(percent.toFixed(1)) + '% - 2px)'
            : 'margin-left: 90%'
        "
      >
        <!--<label class="progress-percent font-xsmall"> {{ percent }}% {{ content }} </label>-->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Progress } from 'ant-design-vue'

export default Vue.extend({
  components: {
    Progress
  },
  props: {
    percent: {
      type: Number,
      default: 0
    },
    content: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
    }
  },

  mounted() {
  },

  methods: {
  }
})
</script>

<style lang="less" scoped>
.progress-container {
  margin: 8px 0;

  .progress-info-container {
    position: relative;
    padding: 0 4px;

    .progress-end {
      width: 2px;
      height: 14px;
      background: @color-petrol500;
      box-shadow: 0 2px 3px rgba(0, 0, 0, 0.55);
      margin: -20px 0 4px 0;
    }

    .progress-percent-container {
      padding-top: 4px;

      &.max {
        justify-content: flex-end !important;
      }

      .progress-percent {
        white-space: nowrap;
      }
    }
  }
}
</style>