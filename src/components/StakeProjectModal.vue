<template>
  <Modal
    :title="stakeModalTitle"
    :visible="show"
    :footer="null"
    :mask-closable="true"
    :closable="false"
    :width="420"
    @cancel="$emit('onCancel')"
    centered
  >
    <img
      class="modal-close"
      src="@/assets/icons/close-circle.svg"
      @click="$emit('onCancel')"
      alt="close circle button"
    />
    <div class="stake-modal-container">
      <div class="balance-form">
        <div class="fcsb-container">
          <div class="fcc-container">
            <button class="select-button fcsb-container">
              <div class="coin-group fcc-container">
                <CoinIcon :mint-address="mint" />
                <span class="font-body-medium weight-bold">{{ symbol }}</span>
              </div>
            </button>
            <button
              v-if="!showHalf && coinbalance"
              class="input-button font-xsmall weight-bold fcc-container"
              @click="setMax(1)"
            >
              Max
            </button>
            <button
              v-if="showHalf && coinbalance"
              class="input-button font-xsmall weight-bold fcc-container"
              @click="setMax(0.5)"
            >
              Half
            </button>
          </div>
          <input type="number" v-model="toStake" @input="getsCRP" placeholder="0.00" />
        </div>
        <div v-if="coinbalance" class="label fcsb-container font-xsmall weight-semi">
          <span> Balance: {{ coinbalance }} </span>
          <span>
            ~${{
              this.price.prices[mint] ? (Math.round(coinbalance * this.price.prices[mint] * 1000) / 1000)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',') : (Math.round(coinbalance * this.price.prices[symbol] * 1000) / 1000)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }}
          </span>
        </div>
      </div>
      <div class="calc-yield">
        <span class="calc-yield-title font-medium weight-semi spacing-small text-center">Calculate ${{ symbol }} Yield</span>
        <div class="calc-yield-group">
          <div class="calc-yield-info">
            <label class="label font-small weight-bold">Total lock ({{ symbol }})</label>
            <label class="value font-small weight-semi spacing-large">{{ this.userStaked * 1 + toStake * 1 }}</label>
          </div>
          <div class="calc-yield-info">
            <label class="label font-small weight-bold">APY (%)</label>
            <label class="value font-small weight-semi spacing-large">{{
              Math.round(((Math.round(this.estimatedapy * 100) * boostAPY) / 100) * 100) / 100
            }}</label>
          </div>
          <div class="calc-yield-info">
            <label class="label font-small weight-bold">Estimated reward ({{ symbol }}) </label>
            <label class="value font-small weight-semi spacing-large"
              >{{
                Math.round(
                  (100000 *
                    (this.userStaked * 1 + toStake * 1) *
                    (Math.round(this.estimatedapy * 100) / 100) *
                    boostAPY) /
                    100
                ) / 100000
              }}
              {{ symbol }}</label
            >
          </div>
        </div>
      </div>
      <div class="calc-footer">
        <label class="lock-note font-small weight-bold"
          >Your total staked tokens will be locked until {{ enddatemin }}</label
        >
        <div class="btn-group fcsb-container">
          <div class="btn-container">
            <Button
              class="btn-primary font-medium weight-semi icon-cursor"
              @click="
                () => {
                  $emit('onCancel')
                }
              "
              >Cancel</Button
            >
          </div>
          <div class="btn-container">
            <Button
              class="btn-transparent font-medium weight-semi icon-cursor"
              id="vstake"
              :disabled="coinbalance < toStake || toStake * 1 <= 0"
              @click="stakeToken()"
              >Confirm</Button
            >
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Modal } from 'ant-design-vue'
import { cloneDeep, get } from 'lodash-es'
import { getUnixTs } from '@/utils'
import { TOKENS } from '@/utils/tokens'

import moment from 'moment'

import {
  createFarmState,
  createPool,
  changeTokenPerSecond,
  changeLockDuration,
  fundToProgram,
  
  getPoolInfoByMint,
  getAllPools,

  getUserState,
  
  estimateRewards,
  harvest,
  stake,
  unstake

} from '@/utils/crp-staking-project'

import { TokenAmount } from '@/utils/safe-math'

Vue.use(Modal)

export default Vue.extend({
  components: {
    Modal
  },
  data() {
    return {
      toStake: null as any,
      tierActive: 4,
      crpPrice: 1,
      scrpEstimate: {
        xCRP: 0,
        tiers: 0
      },
      boostAPY: 1,
      unstakeDate: '',
      minutesLock: null as any,
      boostText: '',
      showHalf: false as boolean
    }
  },
  computed: {
    ...mapState(['wallet', 'url', 'price', 'token'])
  },

  mounted() {
    this.crpPrice = this.price.prices['CRP']

  },

  methods: {
    async getsCRP() {
    },

    setMax(multiple: number) {
      this.showHalf = !this.showHalf
      this.toStake = this.coinbalance * multiple
    },

    async stakeToken() {

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      stake(
        this.$web3, 
        this.$wallet,
        this.mint,
        get(this.wallet.tokenAccounts, `${this.mint}.tokenAccountAddress`),
        this.toStake * Math.pow(10, (TOKENS[this.mint] ? TOKENS[this.mint].decimals : TOKENS[this.symbol].decimals)),
      )
        .then((txid) => {
          this.$notify.info({
            key,
            message: 'Transaction has been sent',
            description: (h: any) =>
              h('div', [
                'Confirmation is in progress.  Check your transaction on ',
                h(
                  'a',
                  {
                    attrs: { href: `${this.url.explorer}/tx/${txid}`, target: '_blank' }
                  },
                  'here'
                )
              ])
          })

          const description = `Staking ${this.toStake} ${this.symbol}`

          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Staking failed',
            description: error.message
          })
        })
        .finally(() => {
          this.$accessor.wallet.getTokenAccounts()
          this.$emit('onCancel')
        })
    }
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    enddatemin: {
      type: Number,
      default: 0
    },
    coinbalance: {
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
    },
    stakeModalTitle: {
      type: String,
      default: ''
    },
    symbol: {
      type: String,
      default: ''
    },
    mint: {
      type: String,
      default: ''
    },
  }
})
</script>

<style lang="less" scoped>
// global styles

.btn-container {
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 48px;
  padding: 3px;
  width: 150px;
  height: auto;
  margin-bottom: 8px;

  @media @max-lg-tablet {
    margin-bottom: 0;
    margin-right: 8px;
  }

  &:last-child {
    margin-bottom: 0;
    margin-right: 0;
  }

  &.btn-large {
    width: 100%;
    height: 50px;
  }
}

.btn-transparent {
  background: transparent;
  padding: 10px 0;
  border-radius: 48px;
  border: none;
  width: 100%;
  height: auto;
}

.btn-primary {
  background: @color-blue700;
  padding: 10px 0;
  border-radius: 48px;
  border: none;
  width: 100%;
  height: auto;
  color: #fff;

  &:disabled {
    color: rgba(255, 255, 255, 0.4);
  }

  @media @max-lg-tablet {
    background: @color-blue800;

    &:hover {
      background: @color-blue800;
    }
  }
}

// class styles
.stake-modal-container {
  margin-top: 18px;

  .balance-form {
    background: rgba(226, 227, 236, 0.1);
    border-radius: 18px;
    padding: 12px;

    button {
      border: none;
      background-color: transparent;
      font-weight: 600;
      font-size: 14px;
      line-height: 22px;
      border-radius: 4px;
      white-space: nowrap;
      cursor: pointer;

      &:active,
      &:focus,
      &:hover {
        outline: 0;
      }

      &:hover {
        background-color: @modal-header-bg;
      }
    }

    .input-button {
      height: 32px;
      width: 32px;
      border: 1px solid #6574d6;
      border-radius: 4px;
      color: #ccd1f1;
    }

    .select-button {
      position: relative;
      padding: 0 10px;
      background: @color-blue800;
      border-radius: 8px;
      width: auto;
      margin-right: 8px;
      height: 32px;

      .coin-group img {
        width: 15px;
        height: 15px;
        margin-right: 4px;
        border-radius: 50%;
      }
    }

    .select-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 8px;
      padding: 2px;
      background: @gradient-color04;
      background-origin: border-box;
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: destination-out;
      mask-composite: exclude;
    }

    input {
      width: 0;
      padding: 0;
      border: none;
      background-color: transparent;
      flex: 1 1 auto;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: right;
      font-weight: 600;
      font-size: 25px;
      line-height: 35px;
      letter-spacing: 0.25px;

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      &:active,
      &:focus,
      &:hover {
        outline: 0;
      }
    }

    input[disabled] {
      cursor: not-allowed;
    }

    .label {
      margin-top: 10px;
      color: @color-blue200;
    }
  }

  .tier-group {
    margin-top: 28px;

    .tier-item {
      display: inline-grid;
      row-gap: 4px;
      width: 100%;
      margin-right: 18px;

      &:last-child {
        margin-right: 0;
      }

      .tier-inactive,
      .tier-active {
        padding: 10px 0;
        background: @color-blue800;
        border-radius: 20px;
        color: rgba(255, 255, 255, 0.2);
      }

      .tier-active {
        background: @color-light-blue;
        color: #fff;
      }

      .value-boost {
        color: @color-blue200;
      }
    }
  }

  .calc-yield {
    margin-top: 28px;
    background: @color-blue800;
    padding: 12px 12px 18px 12px;
    border-radius: 18px;

    .calc-yield-title {
      display: block;
    }

    .calc-yield-group {
      display: inline-grid;
      row-gap: 12px;
      margin-top: 12px;
      width: 100%;

      .calc-yield-info {
        display: flex;
        justify-content: space-between;
        align-items: center;

        &:nth-child(2),
        &:nth-child(3) {
          padding-bottom: 12px;
          border-bottom: 1px solid #384d71;
        }

        .label {
          color: @color-blue200;
        }

        .value {
          color: @color-blue100;

          &.reward-value {
            color: #fff;
          }
        }

        &.current-tier {
          .label,
          .value {
            color: #fff;
          }
        }
      }
    }
  }

  .calc-footer {
    margin-top: 28px;

    .lock-note {
      color: @color-blue100;
    }

    .btn-group {
      margin-top: 28px;
    }
  }
}
</style>
