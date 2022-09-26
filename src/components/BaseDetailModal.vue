<template>
  <Modal
    title="Base detail"
    :visible="show"
    :footer="null"
    :mask-closable="true"
    :closable="false"
    @cancel="$emit('onCancel')"
    centered
  >
    <img
      class="modal-close"
      src="@/assets/icons/close-circle.svg"
      @click="$emit('onCancel')"
      alt="close circle button"
    />
    <div class="base-container">
      <div class="base-title fcsb-container font-medium">
        <label class="label">Base APY</label>
        <label class="value">{{ Math.round(estimatedapy * 100) / 100 }}%</label>
      </div>

      <div class="base-table">
        <div class="base-table-header d-flex font-small weight-bold">
          <Col span="8"> Lock time </Col>
          <Col span="8"> Boost </Col>
          <Col span="8"> Estimated APY </Col>
        </div>
        <div
          class="base-table-body d-flex font-small icon-cursor"
          v-for="data in lockData"
          :key="data.tier"
          @click="$emit('onSelect', data.time, data.apy)"
        >
          <Col span="8"> {{ data.time >= 12 ? data.time / 12 + ' year' : data.time + ' month' }} </Col>
          <Col span="8"> {{ data.boost }} x </Col>
          <Col span="8"> {{ Math.round(100 * (Math.round(estimatedapy * 100) / 100) * data.boost) / 100 }} % </Col>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Modal, Row, Col } from 'ant-design-vue'

import { setAnchorProvider, getExtraRewardConfigs } from '@/utils/crp-stake'

Vue.use(Modal)

export default Vue.extend({
  components: {
    Modal,
    Col
  },

  props: {
    show: {
      type: Boolean,
      default: false
    },
    crpbalance: {
      type: Number,
      default: 0
    },
    estimatedapy: {
      type: Number,
      default: 0
    },
    userStaked: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      lockData: [
        {
          tier: 1,
          time: 1,
          minutesLock: 43200,
          days: 30,
          boost: 1,
          apy: 11.1,
          text: 'Boost for 1 month locked'
        },
        {
          tier: 2,
          time: 3,
          minutesLock: 129600,
          days: 90,
          boost: 1.1,
          apy: 12.21,
          text: 'Boost for 3 months locked'
        },
        {
          tier: 3,
          time: 6,
          minutesLock: 259200,
          days: 180,
          boost: 1.3,
          apy: 14.43,
          text: 'Boost for 6 months locked'
        },
        {
          tier: 4,
          time: 12,
          minutesLock: 525600,
          days: 365,
          boost: 2,
          apy: 22.19,
          text: 'Boost for 1 year locked'
        }
      ]
    }
  },

  mounted() {
    setAnchorProvider(this.$web3, this.$wallet)
    getExtraRewardConfigs().then((res: any) => {
      res.configs.forEach((item: any, index: number) => {
        if (index >= this.lockData.length) {
          return
        }
        this.lockData[index].minutesLock = item.duration / 60
        this.lockData[index].boost = item.extraPercentage / (100 * 1000 * 1000 * 1000) + 1
      })
    })
  }
})
</script>
<style lang="less">
.base-container {
  .base-table {
    margin-top: 20px;
    padding: 12px;
    border: 2px solid #32476c;
    box-sizing: border-box;
    border-radius: 8px;

    .base-table-header {
      margin-bottom: 12px;
    }

    .base-table-body {
      color: @color-gray;
      padding: 5px 0;
      border-bottom: 1px solid #384d71;

      &:last-child {
        border-bottom: none;
      }
    }
  }
}
</style>
