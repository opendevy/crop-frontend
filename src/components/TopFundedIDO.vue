<template>
  <div class="top-ido">
    <h3 class="weight-bold fcs-container">
      Top Funded IDO
      <img class="section-symbol ml-8" src="@/assets/icons/trophy.svg" alt="trophy icon" />
    </h3>

    <div class="top-ido-table">
      <div v-for="item in topIDO" :key="item.mint" class="top-ido-item fcsb-container">
        <div class="fcs-container">
          <CoinIcon class="coin-icon large mr-16" :mint-address="item.mint" />
          <div class="project-title text-left">
            <span class="font-medium weight-semi d-block">{{ item.title }}</span>
            <span class="short-desc font-xsmall weight-semi">{{ item.short_desc }}</span>
          </div>
        </div>

        <div class="ath-container fcs-container">
          <span class="ath-title font-medium weight-semi spacing-small fcs-container">ROI (ATH)</span>
          <div class="ath-badge-container fc-container">
            <span class="ath-badge font-medium weight-semi spacing-small ml-8">
              {{ item.ath > 0 ? '+' : '-' }}{{ item.ath }} %
            </span>
            <Tooltip placement="bottomLeft">
              <template slot="title">
                <div>If you invested $100 you would have ${{ item.var100 }}</div>
              </template>
              <img class="info-icon" src="@/assets/icons/info.svg" />
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Tooltip } from 'ant-design-vue'

export default Vue.extend({
  components: { Tooltip },
  props: {},
  data() {
    return {
      topIDO: [] as any
    }
  },

  async mounted() {
    let responseData: any = []

    try {
      responseData = await fetch('https://api.cropper.finance/fertilizer/').then((res) => res.json())

      let temptopIDO = []

      for (let i in responseData.message) {
        if (responseData.message[i].closed == 1 && responseData.message[i].ath) {
          let ath, var100

          if (responseData.message[i].ath) {
            ath =
              Math.round(
                ((responseData.message[i].ath - responseData.message[i].token_price) /
                  responseData.message[i].token_price) *
                  1000
              ) / 10
            var100 = Math.round(100 * (1 + ath / 100) * 1000) / 1000
          }

          temptopIDO.push({
            mint: responseData.message[i].mint,
            title: responseData.message[i].title,
            short_desc: responseData.message[i].short_desc,
            ath: ath,
            var100: var100
          })
        }
      }

      this.topIDO = temptopIDO
    } catch (e) {
      // dummy data
      console.log('alarams', e)
    } finally {
    }
  },

  methods: {}
})
</script>

<style lang="less" scoped>
.top-ido {
  // global stylesheet
  .section-symbol {
    height: 30px;
  }

  .info-icon {
    height: 12px;
    width: 12px;
    border-radius: 50%;
    margin-left: 4px;
  }

  .coin-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  // class stylesheet
  .top-ido-table {
    margin-top: 20px;

    .top-ido-item {
      background: rgba(23, 32, 88, 0.9);
      border-radius: 8px;
      padding: 18px 32px;
      margin-bottom: 10px;

      &:last-child {
        margin-bottom: 0;
      }

      @media @max-sl-mobile {
        padding: 18px;
      }

      .ath-container {
        @media @max-sl-mobile {
          display: block !important;
        }

        .ath-title {
          @media @max-sl-mobile {
            display: block;
            margin-bottom: 4px;
          }
        }

        .ath-badge-container {
          .ath-badge {
            padding: 4px 8px;
            background: @color-petrol400;
            border-radius: 4px;
            color: @color-blue800;
          }
        }
      }
    }
  }
}
</style>