<template>
  <Modal
    title="Exercise your option"
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

    <div class="stake-modal-container" v-if="loaded">

      <div class="balance-form">
        <div class="fcsb-container">
          <div class="fcc-container">
            <button class="select-button fcsb-container">
              <div class="coin-group fcc-container">
                <CoinIcon :url="apiDatas.token_infos[option.optionMint].picUrl" />
                <span class="font-body-medium weight-bold">{{ apiDatas.token_infos[option.optionMint].symbol }}</span>
              </div>
            </button>
            <button
              v-if="!showHalf && optionbalance"
              class="input-button font-xsmall weight-bold fcc-container"
              @click="setMax(1)"
            >
              Max
            </button>
            <button
              v-if="showHalf && optionbalance"
              class="input-button font-xsmall weight-bold fcc-container"
              @click="setMax(0.5)"
            >
              Half
            </button>
          </div>
          <input type="number" v-model="toExercise" @input="getQuote" placeholder="0.00" />
        </div>
        <div v-if="optionbalance" class="label fcsb-container font-xsmall weight-semi">
          <span> Balance: {{ optionbalance }} </span>
        </div>
      </div>

      <div class="text-center"> + </div>

      <div class="balance-form">
        <div class="fcsb-container">
          <div class="fcc-container">
            <button class="select-button fcsb-container">
              <div class="coin-group fcc-container">
                <CoinIcon :url="apiDatas.token_infos[option.quoteAssetMint].picUrl" />
                <span class="font-body-medium weight-bold">{{ apiDatas['token_infos'][option.quoteAssetMint].symbol }}</span>
              </div>
            </button>
          </div>
          <input type="number" disabled v-model="quote" placeholder="0.00" />
        </div>
        <div v-if="quotebalance" class="label fcsb-container font-xsmall weight-semi">
          <span> Balance: {{ quotebalance }} </span>
          <span>
            ~${{
              (Math.round(quotebalance * 1 * 1000) / 1000)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }}
          </span>
        </div>
      </div>

      <div class="text-center"> &darr; </div>

      <div class="balance-form">
        <div class="fcsb-container">
          <div class="fcc-container">
            <button class="select-button fcsb-container">
              <div class="coin-group fcc-container">
                <CoinIcon :url="apiDatas.token_infos[option.underlyingAssetMint].picUrl" />
                <span class="font-body-medium weight-bold">{{ apiDatas['token_infos'][option.underlyingAssetMint].symbol }}</span>
              </div>
            </button>
          </div>
          <input type="number" disabled v-model="toExercise" placeholder="0.00" />
        </div>
        <div v-if="optionbalance" class="label fcsb-container font-xsmall weight-semi">
          <span></span>
          <span>
            ~${{
              (Math.round(toExercise * this.price.prices[apiDatas['token_infos'][option.underlyingAssetMint].symbol] * 1000) / 1000)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }}
          </span>
        </div>
      </div>


      
      <div class="calc-yield text-center" v-if="toExercise > 0"><div class="calc-yield-info"> Profit made ~ 






        <span v-if="Math.round((((toExercise * this.price.prices[apiDatas['token_infos'][option.underlyingAssetMint].symbol])
        - quote) / quote) * 10000) / 100 > 0" style="color:green;font-weight:bold">
       ${{ Math.round((((Math.round(toExercise * this.price.prices[apiDatas['token_infos'][option.underlyingAssetMint].symbol] * 1000) / 1000) - (optionStrikePrice * toExercise) ) * 1000)) / 1000 }} 
       ({{ 
          Math.round((((toExercise * this.price.prices[apiDatas['token_infos'][option.underlyingAssetMint].symbol])
        - quote) / quote) * 10000) / 100
       }}%)
       </span>


        <span v-else style="color:red;font-weight:bold">
       ${{ Math.round((((Math.round(toExercise * this.price.prices[apiDatas['token_infos'][option.underlyingAssetMint].symbol] * 1000) / 1000) - (optionStrikePrice * toExercise) ) * 1000)) / 1000 }} 
       ({{ 
          Math.round((((toExercise * this.price.prices[apiDatas['token_infos'][option.underlyingAssetMint].symbol])
        - quote) / quote) * 10000) / 100
       }}%)
       </span>

       </div></div>


      <div class="calc-footer">

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
              :disabled="optionbalance < toExercise || quote > quotebalance || toExercise <= 0"
              @click="exercise"
              >Exercise</Button
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
import { 
  setAnchorProvider as usePsyAmericanProgram,
  displayExpirationDate,
  displayStrikePrice,
  useExerciseOptions

 } from '@/utils/psyoption'

import moment from 'moment'

import { TokenAmount } from '@/utils/safe-math'

Vue.use(Modal)

export default Vue.extend({
  components: {
    Modal
  },
  data() {
    return {
      showHalf: false as boolean,
      toExercise: 0 as any,
      quote: 0 as any,
      optionStrikePrice: 0 as any,
      optionbalance: 0 as any,
      quotebalance: 0 as any,
      loaded: false as boolean,
      apiDatas: {} as any[]

    }
  },
  computed: {
    ...mapState(['wallet', 'url', 'price', 'token'])
  },

  watch: {

    'option': {
      handler(newTokenAccounts: any) {
        if (this.$wallet?.connected) {
          this.flushDatas()
        }
      },
      deep: true
    },
  },

  async mounted() {


    this.apiDatas = await fetch('https://api.cropper.finance/options/').then((res) =>
              res.json())
    this.loaded = false;
    if(this.option && this.option.optionMint){
      await this.flushDatas()
      this.loaded = true;
    }
  },

  methods: {

    async flushDatas(){
      this.optionbalance = 0
      if(this.option.optionMint){
        this.optionbalance = this.$accessor.wallet.tokenAccounts[this.option.optionMint.toString()].balance.wei.toNumber()
        this.quotebalance = this.$accessor.wallet.tokenAccounts[this.option.quoteAssetMint.toString()].balance.wei.toNumber() / 1000000
        this.optionStrikePrice = this.option.quoteAmountPerContract / 1000000
        this.getQuote()
        this.loaded = true;
      }
    },

    setMax(multiple: number) {
      this.showHalf = !this.showHalf
      this.toExercise = this.optionbalance
      this.getQuote()
    },
    format_date(option: any){
      return displayExpirationDate(option)
    },

    getQuote(){

      if(this.toExercise * 1 != this.toExercise){
        this.toExercise = this.toExercise * 1
      }

      if(this.toExercise > this.optionbalance) { this.toExercise = this.optionbalance }
      this.quote = this.toExercise * this.optionStrikePrice
    },

    async exercise(){

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Exercising ...',
        description: '',
        duration: 0
      })

      await useExerciseOptions(
        this.toExercise,
        this.option,
        await usePsyAmericanProgram(this.$web3, this.$wallet),
        this.$accessor.wallet.tokenAccounts,
        this.$web3,
        this.$wallet
      ).then((txid: string) => {
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
        const description = `Exercise your option`;
        this.$accessor.transaction.sub({ txid, description })
      })
      .catch((error) => {
        this.$notify.error({
          key,
          message: `Exercise failed`,
          description: error.message
        })
      })
      .finally(() => {
      })

      this.$emit('onCancel')
    }


  },
  props: {
    option: {
      type: Object,
      default: null
    },
    show: {
      type: Boolean,
      default: false
    }
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
