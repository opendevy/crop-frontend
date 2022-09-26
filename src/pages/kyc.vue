<template>
  <div class="kyc container">
    <div class="card">
      <div class="card-body">
        <IDVerifyModal
          :show="KYCModalShow"
          @onCancel="() => (KYCModalShow = false)"
          @onOk="
            (driver, id, passport, selectedCountry, imgUrl) => {
              sendKYC(driver, id, passport, selectedCountry, imgUrl)
            }
          "
        />

        <div class="kyc-head fcsb-container">
          <h3 class="title weight-bold">KYC</h3>
        </div>

        <div class="kyc-container">
          <div class="kyc-form m-auto">
            <div class="kyc-progress-container fcs-container" v-if="KYCStatus.step < 3">
              <div class="kyc-step text-center" :class="KYCStatus.step >= 1 ? 'active' : ''">
                <span class="kyc-no m-auto font-medium weight-bold">1</span>
                <span class="kyc-title font-small weight-bold">ID Verification</span>
              </div>
              <div class="kyc-step text-center" :class="KYCStatus.step >= 2 ? 'active' : ''">
                <span class="kyc-no m-auto font-medium weight-bold">2</span>
                <span class="kyc-title font-small weight-bold">Verification</span>
              </div>
              <div class="kyc-step text-center" :class="KYCStatus.step >= 3 ? 'active' : ''">
                <span class="kyc-no m-auto font-medium weight-bold">3</span>
                <span class="kyc-title font-small weight-bold">Start to buy</span>
              </div>
            </div>
            <div v-if="KYCStatus.step < 3">
              <div class="kyc-status-container fcsb-container">
                <div class="kyc-current-step fcs-container">
                  <span class="font-large weight-bold">ID Verification</span>
                  <Tooltip placement="bottomLeft">
                    <template slot="title">
                      KYC Verification privately and securely confirms your identity using a Government Issued ID. This
                      is to ensure that the Whitelist is protected from bots and that the sale is legal for the
                      individuals participating.
                    </template>
                    <img class="info-icon left icon-cursor" src="@/assets/icons/info.svg" />
                  </Tooltip>
                </div>
                <span
                  class="kyc-status font-xsmall weight-bold"
                  :class="
                    KYCStatus.step === 1
                      ? 'failed'
                      : KYCStatus.step === 2 && KYCStatus.verification === 1
                      ? 'progress'
                      : KYCStatus.step === 2 && KYCStatus.verification === 2
                      ? 'success'
                      : KYCStatus.step === 2 && KYCStatus.verification === 0
                      ? 'failed'
                      : ''
                  "
                  >{{
                    KYCStatus.step === 1
                      ? 'Not verified'
                      : KYCStatus.step === 2 && KYCStatus.verification === 1
                      ? 'In progress'
                      : KYCStatus.step === 2 && KYCStatus.verification === 2
                      ? 'Verified'
                      : KYCStatus.step === 2 && KYCStatus.verification === 0
                      ? 'Verification failed'
                      : ''
                  }}</span
                >
              </div>
              <div class="kyc-description">
                <span class="font-small weight-semi spacing-large">
                  Before you can purchase your allocation, we need to verify your identity. It usually takes between 24
                  and 48 hours to be verified.
                </span>
                <img
                  v-if="KYCStatus.step === 1"
                  class="kyc-status-icon flex m-auto"
                  src="@/assets/icons/kyc-verification.svg"
                />
                <img
                  v-else-if="KYCStatus.step === 2 && KYCStatus.verification === 1"
                  class="kyc-status-icon flex m-auto"
                  src="@/assets/icons/kyc-progress.svg"
                />
                <img
                  v-else-if="KYCStatus.step === 2 && KYCStatus.verification === 2"
                  class="kyc-status-icon flex m-auto"
                  src="@/assets/icons/kyc-success.svg"
                />
                <img
                  v-else-if="KYCStatus.step === 2 && KYCStatus.verification === 0"
                  class="kyc-status-icon flex m-auto"
                  src="@/assets/icons/kyc-failed.svg"
                />
              </div>
              <div class="btn-container">
                <Button
                  class="btn-transparent font-medium weight-semi icon-cursor"
                  :disabled="KYCStatus.step === 2 && KYCStatus.verification === 1"
                  @click="KYCConfirm"
                  >{{
                    KYCStatus.step === 1
                      ? 'Verify your ID now'
                      : KYCStatus.step === 2 && KYCStatus.verification === 1
                      ? 'Next'
                      : KYCStatus.step === 2 && KYCStatus.verification === 2
                      ? 'Next'
                      : KYCStatus.step === 2 && KYCStatus.verification === 0
                      ? 'Verify your ID again'
                      : ''
                  }}</Button
                >
              </div>
              <div
                v-if="
                  telegramnotiflink != '' &&
                  KYCStatus.step === 2 &&
                  KYCStatus.verification === 1 &&
                  currentTier >= 3 &&
                  currentTier <= 5
                "
                class="kyc-notification"
              >
                <div class="fcc-container">
                  <img class="warning-icon" src="@/assets/icons/alert-yellow.svg" />
                </div>
                <span class="notification-text font-small weight-semi spacing-large"
                  >Be informed of the validation of you KYC with Telegram notifications</span
                >
                <div class="btn-container">
                  <a
                    target="_blank"
                    :href="telegramnotiflink"
                    class="btn-transparent font-medium weight-semi icon-cursor fcc-container"
                  >
                    Activate
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- <div v-if="initialized"></div>

        <div v-else class="fcc-container">
          <Spin :spinning="true">
            <Icon slot="indicator" type="loading" style="font-size: 24px" spin />
          </Spin>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Button, Tooltip } from 'ant-design-vue'

import {
  setAnchorProvider,
  createFarmState,
  fundToProgram,
  setExtraReward,
  createExtraReward,
  createPool,
  changePoolAmountMultipler,
  changeTokenPerSecond,
  changePoolPoint,
  getFarmStateAddress,
  getFarmState,
  getExtraRewardConfigs,
  getAllPools,
  getPoolUserAccount,
  estimateRewards,
  calculateTiers,
  TIERS_XCRP,
  stake,
  unstake,
  harvest
} from '@/utils/crp-stake'
import { TOKENS } from '@/utils/tokens'
const countries = require('i18n-iso-countries')

export default Vue.extend({
  components: {
    Button,
    Tooltip
  },

  data() {
    return {
      crpbalance: 0 as number,
      // tier
      userStaked: 0 as number,
      pctToNexttiers: 0 as number,
      userTier: 0 as number,
      currentTiers: 0 as number,
      nextTiers: 1 as number,
      tierloaded: false,

      KYCStatus: {
        step: 1 as number,
        verification: 0 as number,
        userVerified: false as boolean,
        sessionID: '' as string
      },
      KYCModalShow: false as boolean
    }
  },

  head: {
    title: 'KYC'
  },

  computed: {
    ...mapState(['app', 'wallet', 'farm', 'url', 'price', 'liquidity'])
  },

  mounted() {
    this.getTiersInfo()
  },

  watch: {
    'wallet.address': {
      handler(newTokenAccounts: any) {
        setAnchorProvider(this.$web3, this.$wallet)
        this.getTiersInfo()
      },
      deep: true
    },
    'wallet.connected': {
      handler(connected: any) {
        setAnchorProvider(this.$web3, this.$wallet)
        this.getTiersInfo()
      },
      deep: true
    }
  },
  methods: {
    async getTiersInfo() {
      await setAnchorProvider(this.$web3, this.$wallet)

      if (!this.$accessor.token.initialized || !this.$wallet?.connected) {
        this.$router.push({
          path: '/swap/'
        })
        return
      }

      let responseData
      try {
        responseData = await fetch('https://flow.cropper.finance/kyc/' + this.wallet.address + '/').then((res) =>
          res.json()
        )
      } catch {
      } finally {
        if (responseData.session_id) {
          this.KYCStatus.sessionID = responseData.session_id
          if (responseData.status == 'PENDING' || responseData.status == 'SUBMITTED') {
            this.KYCStatus.step = 2
            this.KYCStatus.verification = 1
          } else if (responseData.status == 'VALIDATED') {
            this.KYCStatus.verification = 2
            this.KYCStatus.step = 3
            this.KYCStatus.userVerified = true
            window.localStorage['CYK' + this.wallet.address + 'set'] = 1
          } else if (!responseData.status) {
            this.KYCStatus.step = 1
          } else {
            this.KYCStatus.step = 2
            this.KYCStatus.verification = 0
            try {
              const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ spl: this.wallet.address })
              }
              responseData = await fetch('https://flow.cropper.finance/kyc/', requestOptions)

              responseData = await fetch('https://flow.cropper.finance/kyc/' + this.wallet.address + '/').then((res) =>
                res.json()
              )
            } catch {}
          }
        } else if (responseData.message) {
          this.KYCStatus.step = 1
          try {
            const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ spl: this.wallet.address })
            }
            responseData = await fetch('https://flow.cropper.finance/kyc/', requestOptions)

            responseData = await fetch('https://flow.cropper.finance/kyc/' + this.wallet.address + '/').then((res) =>
              res.json()
            )

            //@ts-ignore
            if (responseData.session_id) {
              //@ts-ignore
              this.KYCStatus.sessionID = responseData.session_id
            }
          } catch {
          } finally {
            if (responseData.message) {
              this.KYCStatus.step = 1
            }

            if (responseData.session_id) {
              //@ts-ignore
              this.KYCStatus.sessionID = responseData.session_id
            }
          }
        }

        if (responseData.session_id) {
          //@ts-ignore
          this.KYCStatus.sessionID = responseData.session_id
        }
      }

      let crpbalanceDatas = this.wallet.tokenAccounts[TOKENS['CRP'].mintAddress]

      if (crpbalanceDatas) {
        this.crpbalance = crpbalanceDatas.balance.fixed() * 1
      }

      let tiers_info = {
        tiers: 0,
        xCRP: 0
      }

      try {
        const farm_state = await getFarmState()
        const extraRewardConfigs = await getExtraRewardConfigs()

        const pools = await getAllPools()
        const current_pool = pools[0]
        const userAccount = await getPoolUserAccount(this.$wallet, current_pool.publicKey)

        //@ts-ignore
        this.userStaked = Number(new TokenAmount(userAccount.amount, TOKENS['CRP'].decimals).fixed(3))

        tiers_info = await calculateTiers(this.userStaked, userAccount.lockDuration.toNumber(), this.$accessor.wallet)
      } catch {}

      await this.$accessor.wallet.setStakingTiers(tiers_info)

      this.currentTiers = tiers_info.tiers

      this.nextTiers = tiers_info.tiers + 1

      if (this.nextTiers == TIERS_XCRP.length) {
        this.nextTiers--
        this.currentTiers--
        this.pctToNexttiers = 100
        this.userTier = TIERS_XCRP[this.nextTiers]
      } else {
        this.userTier = tiers_info.xCRP
        this.pctToNexttiers =
          ((tiers_info.xCRP - TIERS_XCRP[this.currentTiers]) /
            (TIERS_XCRP[this.nextTiers] - TIERS_XCRP[this.currentTiers])) *
          100
      }

      if (this.currentTiers === 5) this.pctToNexttiers = 100
      this.tierloaded = true

      if (this.currentTiers < 3 && this.userTier < 3) {
        this.$router.push({
          path: '/swap/'
        })
      }
    },

    async sendKYC(driver: any, id: any, passport: any, selectedCountry: any, imgUrl: any) {
      var myHeaders = new Headers()
      myHeaders.append('Session-Id', this.KYCStatus.sessionID)

      var formdata = new FormData()
      formdata.append('document_type', driver ? 'DRIVER_LICENSE' : id ? 'NATIONAL_ID' : 'PASSPORT')
      formdata.append('country', countries.alpha2ToAlpha3(selectedCountry))

      if (imgUrl.back) {
        formdata.append('back_document', imgUrl.backfiles, 'Front.png')
      }

      if (imgUrl.front) {
        formdata.append('front_document', imgUrl.frontfiles, 'Front.png')
      }

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata
      }

      let rest = await fetch(
        'https://individual-api.synaps.io/v3/identity/submit?step_id=1909259753480',
        requestOptions
      )
        .then((response) => response.text())
        .then((result) => {
          if (JSON.parse(result).api_code == 'WORKFLOW_STEP_UPLOADED') {
            var requestOptions2 = {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ session_id: this.KYCStatus.sessionID })
            }
            fetch('https://flow.cropper.finance/kyc/init/', requestOptions2)

            // this.contextualizeUser()

            this.KYCModalShow = false
          } else {
            //alert(JSON.parse(result).message)
          }
        })
        .catch((error) => console.log('error', error))
    },

    KYCConfirm() {
      if (this.KYCStatus.step === 1 || (this.KYCStatus.step === 2 && this.KYCStatus.verification === 0))
        this.KYCModalShow = true
      else if (this.KYCStatus.step === 2 && this.KYCStatus.verification === 2) {
        this.KYCStatus.step = 3
        this.KYCStatus.userVerified = true
      }
    }
  }
})
</script>

<style lang="less" scoped>
// global stylesheet
.kyc {
  .btn-container {
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 48px;
    padding: 3px;
    height: auto;
  }

  .btn-transparent {
    background: transparent;
    border-radius: 48px;
    border: none;
    height: auto;
    width: 100%;
    padding: 7.5px 0;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .btn-primary {
    background: @color-blue700;
    border-radius: 48px;
    border: none;
    height: auto;
    width: auto;
    padding: 4.5px 23.5px;
  }

  .info-icon {
    width: 12px;
    height: 12px;

    &.left {
      margin-left: 8px;
    }

    &.right {
      margin-right: 8px;
    }
  }
}

// class stylesheet
.kyc.container {
  .kyc-head {
    @media @max-sl-mobile {
      display: block !important;
    }

    .title {
      text-align: center;
      position: relative;
      float: left;

      @media @max-sl-mobile {
        margin-bottom: 18px !important;
      }
    }

    // .information {
    //   display: flex;
    //   align-items: center;
    //   justify-content: space-between;

    //   @media @max-sl-mobile {
    //     width: 100%;
    //   }

    //   .tvl-info {
    //     margin-right: 18px;
    //   }

    //   .action-btn-group {
    //     display: flex;
    //     align-items: center;

    //     .reload-btn {
    //       background: @color-blue600;
    //       border-radius: 8px;
    //       padding: 6px;
    //       display: flex;
    //       align-items: center;
    //       justify-content: center;

    //       @media @max-lg-tablet {
    //         margin-left: 5px;
    //       }

    //       img {
    //         width: 18px;
    //         height: 18px;
    //       }

    //       &.active img {
    //         transform: rotate(360deg);
    //         transition: all 1s ease-in-out;
    //       }
    //     }
    //   }
    // }
  }

  .kyc-container {
    background: @color-blue700;
    border-radius: 8px;
    margin: 38px 0;
    padding: 50px 0;

    @media @max-sl-mobile {
      margin: 28px 0;
    }

    .kyc-form {
      width: 50%;

      .kyc-progress-container {
        margin-bottom: 48px;

        .kyc-step {
          width: calc((100% - 16px) / 3);
          margin-right: 8px;

          &:last-child {
            margin-right: 0;
          }

          .kyc-no {
            display: block;
            background: rgba(255, 255, 255, 0.4);
            width: 24px;
            height: 24px;
            border-radius: 50%;
            margin-bottom: 8px !important;
            color: @color-blue700;
          }

          .kyc-title {
            color: rgba(255, 255, 255, 0.4);
          }

          &.active {
            .kyc-no {
              background: @color-petrol500;
            }

            .kyc-title {
              color: @color-petrol500;
            }
          }
        }
      }

      .kyc-status-container {
        margin-bottom: 16px;

        .kyc-status {
          padding: 4px 8px;
          border-radius: 6px;

          &.failed {
            background: @color-red600;
          }

          &.progress {
            background: @color-yellow600;
          }

          &.success {
            background: @color-petrol500;
          }
        }
      }

      .kyc-description {
        margin-bottom: 24px;

        .kyc-status-icon {
          margin-top: 24px !important;
        }
      }
      .kyc-notification {
        margin-top: 46px;
        width: 100%;
        background: #1f285e;
        border-radius: 5px;
        padding: 10px;
        .notification-text {
          display: block;
          margin: 8px 0;
          text-align: center;
        }
      }
    }
  }
}
</style>
