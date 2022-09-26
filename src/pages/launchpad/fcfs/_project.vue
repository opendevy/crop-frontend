<template>
  <div class="fertilizer-project container fcfs">
    <div class="card">
      <div class="card-body">
        <Loader
          v-if="subscribeLoading"
          content="Waiting for confirmation"
          @onCancel="() => (subscribeLoading = false)"
        ></Loader>

        <TaskProcessModal
          :show="taskModalShow"
          :step="taskModalType === 0 ? socialTicket.telegram : socialTicket.twitter + 1"
          :project="fertilizer.title"
          :type="taskModalType"
          :mint="fertilizer.mint"
          :tg_a="fertilizer.tg_a"
          :tg_b="fertilizer.tg_b"
          :tw_a="fertilizer.tw_a"
          :tw_b="fertilizer.tw_b"
          :retweetlink="fertilizer.retweetlink"
          @onNext="
            () => {
              if (this.taskModalType === 0) {
                this.socialTicket.telegram++
                if (this.socialTicket.telegram >= 4) {
                  taskModalShow = false
                }
              } else {
                this.socialTicket.twitter++
                if (this.socialTicket.twitter >= 3) {
                  taskModalShow = false
                }
              }
            }
          "
          @onPrev="
            () => {
              if (this.taskModalType === 0) this.socialTicket.telegram--
              else this.socialTicket.twitter--
            }
          "
          @onCancel="
            () => {
              contextualizeUser()
              taskModalShow = false
            }
          "
        />

        <IDVerifyModal
          :show="KYCModalShow"
          @onCancel="() => (KYCModalShow = false)"
          @onOk="
            (driver, id, passport, selectedCountry, imgUrl) => {
              sendKYC(driver, id, passport, selectedCountry, imgUrl)
            }
          "
        />

        <div class="project-content">
          <div class="project-status-container">
            <div class="project-back">
              <div class="back-to-list icon-cursor fcs-container" @click="goBack">
                <img class="back-icon" src="@/assets/icons/back.svg" />
                <span class="back-label font-medium weight-bold">Go back</span>
              </div>
            </div>
            <div class="project-preview-ido-container">
              <div class="project-preview-container">
                <div class="project-preview">
                  <div class="project-overview fcsb-container">
                    <div class="project-title fcs-container">
                      <img class="project-logo" :src="fertilizer.logo" />
                      <span class="font-large weight-bold">{{ fertilizer.title }}</span>
                    </div>
                    <div class="fcs-container">
                      <div
                        class="project-status icon-cursor"
                        :class="
                          currentStep === 0
                            ? 'preparation'
                            : currentStep === 1
                            ? 'whitelist'
                            : currentStep === 2 && currentTimestamp < fertilizer.sales_start_date
                            ? 'sales'
                            : currentStep === 2 &&
                              currentTimestamp > fertilizer.sales_start_date &&
                              fertilizer.sales_end_date > currentTimestamp
                            ? 'open'
                            : (currentStep === 2 && currentTimestamp > fertilizer.sales_end_date) ||
                              (currentStep === 3 && !currentStatus.funded)
                            ? 'distribution'
                            : ''
                        "
                      >
                        <span class="font-xsmall weight-bold">
                          {{
                            currentStep === 0
                              ? projectStatus.preparation
                              : currentStep === 1
                              ? projectStatus.whitelist
                              : currentStep === 2 && fertilizer.sales_start_date > currentTimestamp
                              ? projectStatus.sales
                              : currentStep === 2 &&
                                currentTimestamp > fertilizer.sales_start_date &&
                                fertilizer.sales_end_date > currentTimestamp
                              ? projectStatus.open
                              : (currentStep === 2 && currentTimestamp > fertilizer.sales_end_date) ||
                                (currentStep === 3 && !currentStatus.funded)
                              ? projectStatus.distribution
                              : ''
                          }}
                        </span>
                      </div>
                      <Tooltip placement="bottomLeft">
                        <template slot="title">
                          {{
                            currentStep === 0
                              ? 'We are preparing the final details for the launch. Stay updated with Cropper Twitter and Telegram.'
                              : currentStep === 1
                              ? 'You can now register for the Whitelist. Tiers 0-2 will have to participate in the lottery. Tiers 3-5 will be registered automatically.'
                              : currentStep === 2 && fertilizer.sales_start_date > currentTimestamp
                              ? 'The lottery AirDrop for Tiers 0-2 in currently in progress. Tiers 3-5 will be able to purchase once the Open Sale begins.'
                              : currentStep === 2 &&
                                currentTimestamp > fertilizer.sales_start_date &&
                                fertilizer.sales_end_date > currentTimestamp
                              ? 'Tiers 0-2 with winning lottery tickets and Tiers 3-5 can now purchase their allocations.'
                              : (currentStep === 2 && currentTimestamp > fertilizer.sales_end_date) ||
                                (currentStep === 3 && !currentStatus.funded)
                              ? 'Distribution has begun. You can now claim the tokens you purchased during the sale phase.'
                              : ''
                          }}
                        </template>
                        <img class="info-icon left icon-cursor" src="@/assets/icons/info.svg" />
                      </Tooltip>
                      <div class="project-status fcfs ml-8 icon-cursor ">
                        <span class="font-xsmall weight-bold">FCFS</span>
                      </div>
                    </div>
                  </div>

                  <div v-if="fertilizer.tba == 1" class="project-countdown">TBA</div>
                  <div
                    v-else-if="
                      (currentStep === 0 && currentTimestamp < fertilizer.whitelist_start_date) ||
                      (currentStep >= 1 && currentStep < 3)
                    "
                    class="project-countdown"
                  >
                    <Countdown
                      :title="
                        currentStep === 0 && currentTimestamp < fertilizer.whitelist_start_date
                          ? 'Sales starts in'
                          : currentStep === 1
                          ? 'Sales ends in'
                          : currentStep === 2 && currentTimestamp < fertilizer.sales_start_date
                          ? 'Sales start in'
                          : currentStep === 2 &&
                            currentTimestamp > fertilizer.sales_start_date &&
                            currentTimestamp < fertilizer.sales_end_date
                          ? 'Sales end in'
                          : currentStep === 2 && currentTimestamp > fertilizer.sales_end_date
                          ? 'Distribution starts in'
                          : ''
                      "
                      :value="
                        currentStep === 0 && currentTimestamp < fertilizer.whitelist_start_date
                          ? fertilizer.whitelist_start_date
                          : currentStep === 1
                          ? fertilizer.whitelist_end_date
                          : currentStep === 2 && currentTimestamp < fertilizer.sales_start_date
                          ? fertilizer.sales_start_date
                          : currentStep === 2 &&
                            currentTimestamp > fertilizer.sales_start_date &&
                            currentTimestamp < fertilizer.sales_end_date
                          ? fertilizer.sales_end_date
                          : currentStep === 2 && currentTimestamp > fertilizer.sales_end_date
                          ? fertilizer.distribution_start_date
                          : ''
                      "
                      format="DD:HH:mm:ss"
                      @finish="forceLoadDatas()"
                    />
                  </div>
                  <div v-if="currentStep > 0 && fertilizer.tba != 1" class="project-progress">
                    <div v-if="currentStep === 1">
                    </div>
                    <div v-else-if="currentStep === 3">
                      <div v-if="!currentStatus.funded" class="fcc-container">
                        <img class="status-icon" src="@/assets/icons/check-circle-white.svg" />
                        <span class="font-small weight-semi spacing-large">Distribution in progress</span>
                      </div>
                      <div v-else class="btn-container">
                        <NuxtLink :to="`/farms/?s=${fertilizer.token_info.symbol}`"
                          ><Button class="btn-transparent font-medium weight-semi icon-cursor" style="color: #fff"
                            >Start Farming</Button
                          ></NuxtLink
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="project-ido-container">
                <div class="project-ido">
                  <span class="label font-medium weight-bold">FCFS process:</span>
                  <Steps :current="currentStep" size="small" direction="vertical" :status="currentStatus.steps">
                    <Step>
                      <template slot="title">
                        <span class="font-small weight-bold">Preparation</span>
                      </template>
                    </Step>
                    <Step>
                      <template slot="title">
                        <div class="fcsb-container">
                          <span class="font-small weight-bold">Sales</span>
                        </div>
                        <span v-if="currentStep === 1 && currentTier >= 3" class="status-label description font-small">
                          You are registered for the whitelist
                        </span>
                        <span v-if="currentStep === 1 && currentTier < 3" class="status-label description font-small">
                          You can participate in the token sale</span
                        >
                      </template>
                    </Step>
                    <Step>
                      <template slot="title">
                        <div class="fcsb-container">
                          <span class="font-small weight-bold">Distribution</span>
                        </div>
                      </template>
                    </Step>
                  </Steps>
                </div>
              </div>
            </div>
          </div>

          <div class="project-detail-container">

          <!--
            <div class="project-detail-nav d-flex">
              <a
                v-for="(nav, idx) in navList"
                :key="nav.href"
                class="nav-item"
                :href="nav.href"
                @click="selectNav(idx)"
              >
                <span :class="`font-medium weight-semi spacing-small ${activeNav === idx ? 'active' : ''}`">{{
                  nav.title
                }}</span>
                <div v-if="activeNav === idx" class="active-underline mt-8"></div>
              </a>
            </div>
          -->

            <div class="project-detail-condition">
              <div class="project-detail-item">
                <div class="fcfs-container text-center m-auto">
                  <span class="font-medium weight-semi spacing-small d-block"
                    >You can now buy {{ fertilizer.token_info.symbol }} token as First Come First Served mechanism. Attention, the quantity is
                    limited.</span
                  >
                  <ProgressBar :percent="fcfsPercent" content="fullfilled"></ProgressBar>
                  <span class="font-large weight-bold d-block">{{ fertilizer.total_allocation.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}
                          {{ fertilizer.token_info.symbol }} Available</span>
                  <span class="font-medium weight-semi spacing-small">{{    (Math.round(fertilizer.total_paid_amount * 100 ) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}
                          {{ fertilizer.token_info.symbol }} Sold</span>
                </div>


                <div v-if="loaded && !this.wallet.connected" class="project-detail-open w-100 fcsb-container fcfs">


                        <div class="btn-container" style="margin:60px auto 20px auto"><Button
                          class="btn-transparent font-medium weight-semi icon-cursor"
                          id="jw"
                          @click="
                            () => {
                              this.$accessor.wallet.openModal()
                            }
                          "
                          > &nbsp; Connect wallet &nbsp; </Button
                        ></div>
                </div>

                <div v-else-if="loaded && KYCStatus.step != 3 && currentTier < 1" class="project-detail-open w-100 fcsb-container fcfs">
                    <div class="project-detail-sales">
                      <div class="text-center">
                    <br />
                    <br />
                        <div class="fcc-container mb-10">
                          <img class="alert-icon" src="@/assets/icons/alert-white.svg" />
                          <h4 class="weight-bold spacing-medium">
                            You must be at least tier 1 to participate in the FCFS.
                          </h4>
                        </div>
                      </div>
                    </div>

                </div>


                <div v-else-if="loaded && KYCStatus.step != 3" class="project-detail-open w-100 fcsb-container fcfs">

                    <div class="kyc-form">
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
                                KYC Verification privately and securely confirms your identity using a Government Issued
                                ID. This is to ensure that the Whitelist is protected from bots and that the sale is
                                legal for the individuals participating.
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
                            Before you can purchase your allocation, we need to verify your identity. It usually takes
                            between 24 and 48 hours to be verified.
                          </span>
                          <img
                            v-if="KYCStatus.step === 1"
                            class="kyc-status-icon d-flex m-auto"
                            src="@/assets/icons/kyc-verification.svg"
                          />
                          <img
                            v-else-if="KYCStatus.step === 2 && KYCStatus.verification === 1"
                            class="kyc-status-icon d-flex m-auto"
                            src="@/assets/icons/kyc-progress.svg"
                          />
                          <img
                            v-else-if="KYCStatus.step === 2 && KYCStatus.verification === 2"
                            class="kyc-status-icon d-flex m-auto"
                            src="@/assets/icons/kyc-success.svg"
                          />
                          <img
                            v-else-if="KYCStatus.step === 2 && KYCStatus.verification === 0"
                            class="kyc-status-icon d-flex m-auto"
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
                            currentTier <= 5 &&
                            !istgok
                          "
                          class="kyc-notification"
                        >
                          <div class="fcc-container">
                            <img class="warning-icon" src="@/assets/icons/alert-yellow.svg" />
                          </div>
                          <span class="notification-text font-small weight-semi spacing-large"
                            >Get notified of your KYC status updates with Telegram Notifications</span
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


                <div v-if="loaded && KYCStatus.step == 3 && currentStep == 1" class="project-detail-open w-100 fcsb-container fcfs">
                  <div class="buy-form fcfs w-100">
                    <label class="font-small weight-semi spacing-large d-block mb-8">Round {{ project.round }}</label>
                    <div class="fcfs-claim-form">
                      <div>
                        <div class="token-amount">
                          <div class="fcsb-container">
                            <div class="token-amount-input fcs-container">
                              <CoinIcon class="coin-icon" :mint-address="fertilizer.main_sale_mint" />
                              <input
                                class="font-medium weight-bold"
                                v-model="buyAmount"
                                @onInput="(amount) => (buyAmount = amount)"
                                type="number"
                                :placeholder="buyableAmount"
                              />
                            </div>
                            <div class="token-max-container fcc-container">
                              <button
                                v-if="buyAmount < maxAmount"
                                class="token-max-btn icon-cursor font-xsmall weight-bold fcc-container"
                                @click="
                                  () => {
                                    buyAmount =
                                      (buyableAmount) > balance.fixed()
                                        ? balance.fixed()
                                        : buyableAmount
                                  }
                                "
                              >
                                Max
                              </button>
                              <span class="font-xsmall weight-semi token-max-amount text-right"
                                >max {{ buyableAmount }} {{ fertilizer.token_price }}
                                <Tooltip placement="bottomLeft">
                                  <template slot="title">
                                    Want a larger allocation for the next IDO? Increase your Tier to get more Guaranteed
                                    Allocation.
                                  </template>
                                  <img class="info-icon left icon-cursor" src="@/assets/icons/info.svg" /> </Tooltip
                              ></span>
                            </div>
                          </div>

                          <div
                            v-if="balance && !balance.wei.isNaN()"
                            class="token-amount-balance fcsb-container font-xsmall weight-semi"
                          >
                            <span> Balance: {{ balance.fixed() }} </span>
                            <span>
                              ~${{
                                price.prices[fertilizer.price_token]
                                  ? Math.round(price.prices[fertilizer.price_token] * balance.fixed() * 1000) / 1000
                                  : '-'
                              }}
                            </span>
                          </div>
                        </div>

                        <div v-if="fertilizer.extra_rate > 0" class="receive-amount fcfs" style="margin:10px 0">
                          <label class="font-xmall"><small><b>Fees<Tooltip placement="bottomLeft">
                                  <template slot="title">
                                    In the first round of the FCFS we add a fee in CRP to participate. If there is a second round, there will not have any CRP fee. However, there is no guarantee that this second round will happen.
                                  </template>
                                  <img class="info-icon left icon-cursor" src="@/assets/icons/info.svg" /> </Tooltip
                              ></b></small> </label> 
                          

                          <span class="font-medium weight-bold"> &nbsp; 
                            <CoinIcon class="coin-icon" mint-address="DubwWZNWiNGMMeeQHPnMATNj77YZPZSAz2WVR5WjLJqz" /><small>{{ fertilizer.extra_rate * buyAmount / Math.pow(10, 12) }} CRP</small>
                          </span>

                        </div>




                        <div class="receive-amount fcfs">
                          <label class="font-xmall">You will Buy:</label>
                          <div class="receive-amount-output fcs-container">
                            <img class="coin-icon" :src="fertilizer.logo" />
                            <span class="receive-amount-value font-medium weight-semi spacing-small"
                              ><span v-html="Math.round((buyAmount * 10000) / fertilizer.ido_info.sale_rate) / 10000"
                                >0</span
                              >
                              {{ fertilizer.token_info.symbol }}</span
                            >
                          </div>
                        </div>
                        <div class="btn-container">
                          <Button
                            :disabled="
                              buyAmount <= 0 || buyAmount > (buyableAmount) || buyAmount > balance.fixed()
                            "
                            @click="
                              () => {
                                if (
                                  !(
                                    buyAmount <= 0 ||
                                    buyAmount > (buyableAmount) ||
                                    buyAmount > balance.fixed()
                                  )
                                ) {
                                  onClickBuyNow()
                                }
                              }
                            "
                            class="btn-transparent font-medium weight-semi icon-cursor"
                            >Buy now</Button
                          >
                        </div>

                        <div v-if="buyedAmount > 0" class="buy-amount">
                          <label class="font-xmall">You already bought:</label>
                          <div class="buy-amount-output fcs-container">
                            <img class="coin-icon" :src="fertilizer.logo" />
                            <span class="font-medium weight-semi spacing-small"
                              ><span v-html="Math.round((buyedAmount * 10000) / fertilizer.ido_info.sale_rate) / 10000"
                                >0</span
                              >
                              {{ fertilizer.token_info.symbol }}</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                <div v-else-if="loaded && KYCStatus.step == 3 && (currentStep === 0 || currentStep === 1 )  && currentTimestamp < fertilizer.whitelist_start_date" class="" style="padding-top:40px">

                    <Countdown
                      title="Sales starts in"
                      :value="
                        currentStep === 0 && currentTimestamp < fertilizer.whitelist_start_date
                          ? fertilizer.whitelist_start_date
                          : currentStep === 1
                          ? fertilizer.whitelist_end_date
                          : currentStep === 2 && currentTimestamp < fertilizer.sales_start_date
                          ? fertilizer.sales_start_date
                          : currentStep === 2 &&
                            currentTimestamp > fertilizer.sales_start_date &&
                            currentTimestamp < fertilizer.sales_end_date
                          ? fertilizer.sales_end_date
                          : currentStep === 2 && currentTimestamp > fertilizer.sales_end_date
                          ? fertilizer.distribution_start_date
                          : ''
                      "
                      format="DD:HH:mm:ss"
                      @finish="forceLoadDatas()"
                    />

                </div>

                
                <div v-else-if="loaded && KYCStatus.step == 3 && currentStep != 3 && currentTimestamp > fertilizer.sales_end_date" class="" style="padding-top:40px">

                    <Countdown
                      title="Distribution starts in"
                      :value="
                        currentStep === 0 && currentTimestamp < fertilizer.whitelist_start_date
                          ? fertilizer.whitelist_start_date
                          : currentStep === 1
                          ? fertilizer.whitelist_end_date
                          : currentStep === 2 && currentTimestamp < fertilizer.sales_start_date
                          ? fertilizer.sales_start_date
                          : currentStep === 2 &&
                            currentTimestamp > fertilizer.sales_start_date &&
                            currentTimestamp < fertilizer.sales_end_date
                          ? fertilizer.sales_end_date
                          : currentStep === 2 && currentTimestamp > fertilizer.sales_end_date
                          ? fertilizer.distribution_start_date
                          : ''
                      "
                      format="DD:HH:mm:ss"
                      @finish="forceLoadDatas()"
                    />

                </div>

                <div v-else-if="loaded && KYCStatus.step == 3 && currentStep == 0 && project.round == 2" class="" style="padding-top:40px">

                    <Countdown
                      title="Second round will starts in"
                      :value="
                        currentStep === 0 && currentTimestamp < fertilizer.whitelist_start_date
                          ? fertilizer.whitelist_start_date
                          : currentStep === 1
                          ? fertilizer.whitelist_end_date
                          : currentStep === 2 && currentTimestamp < fertilizer.sales_start_date
                          ? fertilizer.sales_start_date
                          : currentStep === 2 &&
                            currentTimestamp > fertilizer.sales_start_date &&
                            currentTimestamp < fertilizer.sales_end_date
                          ? fertilizer.sales_end_date
                          : currentStep === 2 && currentTimestamp > fertilizer.sales_end_date
                          ? fertilizer.distribution_start_date
                          : ''
                      "
                      format="DD:HH:mm:ss"
                      @finish="forceLoadDatas()"
                    />

                </div>

                <div v-if="loaded && KYCStatus.step == 3 && currentStep == 3" class="project-detail-open w-100 fcsb-container fcfs" style="margin-top:20px">

                  <div class="buy-form fcfs" style="width:100%">
                    <label class="font-small weight-semi spacing-large d-block mb-8">Round 1</label>
                    <div class="fcfs-claim-form">
                      <div :class="`${fcfsRoundActive1 ? '' : 'deactive'}`">
                        <div class="token-amount">
                          <div class="fcsb-container">
                            <div class="token-amount-input fcs-container">
                              <CoinIcon class="coin-icon" :mint-address="fertilizer.main_sale_mint" />
                              <span
                                class="font-medium weight-bold"
                                >
                                  {{ buyedAmount }}
                              </span>
                            </div>
                          </div>

                        </div>
                        <div class="receive-amount fcfs">
                          <label class="font-xmall">You will receive:</label>
                          <div class="receive-amount-output fcs-container">
                            <img class="coin-icon" :src="fertilizer.logo" />
                            <span class="receive-amount-value font-medium weight-semi spacing-small"
                              ><span v-html="Math.round((buyedAmount * (fertilizer.first_liberation / 10000000 ) * 10000) / fertilizer.ido_info.sale_rate) / 10000"
                                >0</span
                              >
                              {{ fertilizer.token_info.symbol }}</span
                            >
                          </div>
                        </div>
                        <div class="btn-container">
                          <Button
                            :disabled="
                              !(buyedAmount && !hasClaimed)
                            "
                            @click="
                              () => {
                                if (buyedAmount && !hasClaimed
                                ) {
                                  onClaimTokens(1)
                                }
                              }
                            "
                            class="btn-transparent font-medium weight-semi icon-cursor"
                            >Claim Now</Button
                          >
                        </div>
                      </div>
                      <div v-if="!fcfsRoundActive1" class="round-notification text-center">
                        <span class="font-xsmall weight-bold">You did not participated in the round 1</span>
                      </div>
                    </div>
                  </div>

                  <div class="buy-form fcfs" style="width:100%">
                    <label class="font-small weight-semi spacing-large d-block mb-8">Round 2</label>
                    <div class="fcfs-claim-form">
                      <div :class="`${fcfsRoundActive2 ? '' : 'deactive'}`">
                        <div class="token-amount">
                          <div class="fcsb-container">
                            <div class="token-amount-input fcs-container">
                              <CoinIcon class="coin-icon" :mint-address="fertilizer.main_sale_mint" />
                              <span
                                class="font-medium weight-bold"
                                >
                                  {{ buyedAmount_round2 }}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="receive-amount fcfs">
                          <label class="font-xmall">You will receive:</label>
                          <div class="receive-amount-output fcs-container">
                            <img class="coin-icon" :src="fertilizer.logo" />
                            <span class="receive-amount-value font-medium weight-semi spacing-small"
                              ><span v-html="Math.round((buyedAmount_round2 * 10000) / fertilizer.ido_info.sale_rate) / 10000"
                                >0</span
                              >
                              {{ fertilizer.token_info.symbol }}</span
                            >
                          </div>
                        </div>
                        <div class="btn-container">
                          <Button
                            :disabled="
                              !(buyedAmount_round2 && !hasClaimed_round2)
                            "
                            @click="
                              () => {
                                if (buyedAmount_round2 && !hasClaimed_round2
                                ) {
                                  onClaimTokens(2)
                                }
                              }
                            "
                            class="btn-transparent font-medium weight-semi icon-cursor"
                            >Claim now</Button
                          >
                        </div>
                      </div>
                      <div v-if="!fcfsRoundActive2" class="round-notification text-center">
                        <span class="font-xsmall weight-bold">You did not participated in the round 2</span>
                      </div>
                    </div>
                  </div>
                </div>





              </div>
            </div>

            <div
              class="project-detail-condition"
              v-if="!fertilizer.tba && wallet.connected && !firstload"
              style="text-align: center"
            >
              <Spin :spinning="true">
                <Icon slot="indicator" type="loading" style="font-size: 24px" spin />
              </Spin>
            </div>

            <img v-if="fertilizer.banner" class="project-banner w-100" :src="fertilizer.banner" alt="project banner" />
            <div class="project-detail-static banner">
              <div class="project-detail-card">
                <div class="project-detail-desc">
                  <div class="project-title fcs-container">
                    <div class="fcs-container">
                      <img class="project-logo" :src="fertilizer.logo" />
                      <h4 class="weight-bold spacing-medium">{{ fertilizer.title }}</h4>
                    </div>
                    <a :href="fertilizer.twitter_link" target="_blank"
                      ><img class="twitter-icon" src="@/assets/icons/twitter-white.svg" alt="twitter link"
                    /></a>
                  </div>
                  <div class="project-short-desc">
                    <span class="font-medium weight-semi">{{ fertilizer.short_desc }}</span>
                  </div>
                  <span class="font-medium">{{ fertilizer.long_desc }}</span>
                </div>
                <div class="project-detail-info-group">
                  <Row :gutter="16">
                    <Col :md="8" :sm="12" :xs="12" class="project-detail-info-item">
                      <span class="title font-small weight-semi spacing-large"
                        >Token Price
                        <Tooltip placement="bottomLeft">
                          <template slot="title">
                            This is the pre-sale price of the token and is defined by the project to be attractive in
                            relation to its future market value.
                          </template>
                          <img class="info-icon left icon-cursor" src="@/assets/icons/info.svg" /> </Tooltip
                      ></span>
                      <div class="value fcs-container">
                        <CoinIcon class="coin-icon" :mint-address="fertilizer.main_sale_mint" />
                        <span class="font-medium"
                          ><b>{{ fertilizer.ido_info.sale_rate }}</b> {{ fertilizer.price_token }}</span
                        >
                      </div>
                    </Col>
                    <Col :md="8" :sm="12" :xs="12" class="project-detail-info-item">
                      <span class="title font-small weight-semi spacing-large"
                        >Hard Cap
                        <Tooltip placement="bottomLeft">
                          <template slot="title">
                            This is the amount offered for sale in USDC by the project for this Fertilizer IDO.
                          </template>
                          <img class="info-icon left icon-cursor" src="@/assets/icons/info.svg" /> </Tooltip
                      ></span>
                      <div class="value fcs-container">
                        <CoinIcon class="coin-icon" :mint-address="fertilizer.main_sale_mint" />
                        <span class="font-medium"
                          ><b>{{ fertilizer.ido_info.hard_cap.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}</b>
                          {{ fertilizer.price_token }}</span
                        >
                      </div>
                    </Col>
                    <Col :md="8" :sm="12" :xs="12" class="project-detail-info-item">
                      <span class="title font-small weight-semi spacing-large"
                        >Pool Size
                        <Tooltip placement="bottomLeft">
                          <template slot="title">
                            This is the total amount of tokens to be distributed to all who participate in the
                            Fertilizer IDO.
                          </template>
                          <img class="info-icon left icon-cursor" src="@/assets/icons/info.svg" /> </Tooltip
                      ></span>
                      <div class="value fcs-container">
                        <img class="coin-icon" :src="fertilizer.logo" />
                        <span class="font-medium"
                          ><b>{{ fertilizer.total_allocation.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}</b>
                          {{ fertilizer.token_info.symbol }}</span
                        >
                      </div>
                    </Col>
                    <Col :md="8" :sm="12" :xs="12" class="project-detail-info-item">
                      <span class="title font-small weight-semi spacing-large"
                        >Type
                        <Tooltip placement="bottomLeft">
                          <template slot="title">
                            {{
                              fertilizer.ido_info.sale_type === '100% TGE'
                                ? '100% of the amount purchased during the sale can be claimed at distribution.'
                                : 'A percentage of the amount purchased can be claimed at distribution, while the remaining amount will be unlocked periodically as advised by the IDO details on the Fertilizer page.'
                            }}
                          </template>
                          <img class="info-icon left icon-cursor" src="@/assets/icons/info.svg" /> </Tooltip
                      ></span>
                      <div class="value fcs-container">
                        <img
                          class="lock-icon"
                          :src="
                            require(`@/assets/icons/${
                              fertilizer.ido_info.sale_type === '100% TGE' ? 'unlock' : 'lock'
                            }.svg`)
                          "
                        />
                        <span class="font-medium weight-semi">{{
                          fertilizer.ido_info.sale_type == '100% TGE' ? 'Unlocked' : fertilizer.ido_info.sale_type
                        }}</span>
                      </div>
                    </Col>
                    <Col :md="8" :sm="12" :xs="12" class="project-detail-info-item">
                      <div v-if="fertilizer.fcfs">
                        <span class="title font-small weight-semi spacing-large">Registered on</span>
                        <div class="value">
                          <span class="font-medium weight-semi">{{ fertilizer.subscribers }}</span>
                        </div>
                      </div>
                      <div v-else class="round fcc-container">
                        <div class="text-center">
                          <span class="font-small weight-semi spacing-large d-block">ROUND</span>
                          <span class="font-medium weight-bold">{{ project.round }}</span>
                        </div>
                      </div>
                    </Col>
                    <Col :md="8" :sm="12" :xs="12" class="project-detail-info-item">
                      <span class="title font-small weight-semi spacing-large">Website</span>
                      <div class="value">
                        <a class="website font-medium weight-semi" :href="fertilizer.website_url" target="_blank">{{
                          fertilizer.website
                        }}</a>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>

            <div
              v-if="currentTier < 5 && currentTimestamp < fertilizer.whitelist_end_date"
              class="project-detail-static stake fnsb-container"
            >
              <div class="project-detail-stake">
                <div class="mb-8">
                  <h4 class="weight-semi">
                    <!-- Increase your Tier ranking to receive more lottery tickets or guarantee allocations. -->
                    Develop your Tier to have more allocation
                  </h4>
                </div>
                <!-- <span class="font-medium">Tier 1 starts at 200 CRP.</span> -->
                <div class="btn-container">
                  <Button
                    class="btn-transparent font-medium weight-semi icon-cursor"
                    id="stakecrp"
                    @click="
                      () => {
                        this.$router.push({ path: '/staking/' })
                      }
                    "
                    >Stake CRP Now</Button
                  >
                </div>
              </div>
              <div class="project-tier-bg">
                <img class="tier-bg h-100 w-100" src="@/assets/background/project-tier.png" />
              </div>
            </div>

            <div class="pds" v-html="fertilizer.longContent"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { getUnixTs } from '@/utils'
import { Row, Col, Statistic, Steps, Tooltip, Spin, Icon } from 'ant-design-vue'
import {
  setAnchorProvider,
  //getLaunchpad,
  getProjectFormatted,
  getUserDatas,
  subscribeToWhitelist,
  isSubscribed,
  buyTokens,
  claimTokens
} from '@/utils/crp-ido-fcfs'

import {
  setAnchorProvider as setAnchorProvider_round2,
  //getLaunchpad,
  getProjectFormatted as getProjectFormatted_round2,
  getUserDatas as getUserDatas_round2,
  subscribeToWhitelist as subscribeToWhitelist_round2,
  isSubscribed as isSubscribed_round2,
  buyTokens as buyTokens_round2,
  claimTokens as claimTokens_round2
} from '@/utils/crp-ido-fcfs-round2'

import {
  setAnchorProvider as setAnchorProvider_stake,
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


import { TokenAmount } from '@/utils/safe-math'



import { TOKENS, NATIVE_SOL, getTokenByMintAddress } from '@/utils/tokens'
import moment from 'moment'
import { PublicKey } from '@solana/web3.js'
import { get } from 'lodash-es'
const Countdown = Statistic.Countdown
const Step = Steps.Step
const TEST_TIME = 1643356116915
const countries = require('i18n-iso-countries')
// 1643500800000

export default Vue.extend({
  async asyncData({ params, redirect }) {
    const projects = await fetch('https://api.cropper.finance/fcfs/').then((res) => res.json())

    const filteredProject = await projects.message.find((el: any) => el.slug === params.project)

    if (filteredProject) {
      return {
        project: filteredProject
      }
    } else {
      redirect('/launchpad/')
    }
  },

  components: {
    Row,
    Col,
    Countdown,
    Steps,
    Step,
    Tooltip,
    Spin,
    Icon
  },

  data() {
    return {
      processing: false as boolean,
      total_tickets: 0,
      buyableAmount: 0,
      firstload: false as boolean,
      loaded: false as boolean,
      spTOKENS: {} as any,
      fertilizer: {
        picture: '',
        twitter_link: '',
        logo: '',
        first_liberation: 0,
        longContent: '',
        title: '',
        short_desc: '',
        vested_notice: '',
        price_token: '',
        price_token_mint: '',
        long_desc: '',
        hard_cap: '3000K',
        total_allocation: 0 as any,
        subscribers: '' as any,
        website: '',
        website_url: '',
        token_decimal: 0 as any,
        mint: '',
        tw_a: '',
        tw_b: '',
        tg_a: '',
        tg_b: '',
        retweetlink: '',
        ido_info: {
          hard_cap: 0,
          sale_rate: 0 as any,
          sale_type: ''
        },
        swapLink: '',
        token_info: {
          symbol: ''
        },
        whitelist_start_date: 0 as any,
        whitelist_end_date: 0 as any,
        sales_start_date: 0 as any,
        sales_end_date: 0 as any,
        distribution_start_date: 0 as any,
        distribution_end_date: 0 as any,
        date_preparation: 0 as any,
        max_allocation: {} as any,
        total_paid_amount: 0 as any
      } as any,
      balance: null as any,
      projectStatus: {
        preparation: 'Preparation',
        whitelist: 'Sales Open',
        sales: 'Sales',
        open: 'Open Sales',
        distribution: 'Distribution'
      },
      currentStatus: {
        steps: 'process' as string,
        funded: false as boolean,
        win: false as boolean,
        subscribe: false as boolean
      },
      referal: '' as string,
      socialTicket: {
        telegram: 0 as number,
        twitter: 0 as number
      },
      subscribeLoading: false as boolean,
      hasClaimed: 0 as number,
      hasClaimed_round2: 0 as number,
      userLoading: 0 as number,
      loading: 0 as number,
      SubscribeModalContent: '' as string,
      currentTimestamp: 0 as any,
      currentStep: 0 as number,
      currentTier: 0 as number,
      currentHash: '' as string,
      telegramnotiflink: '' as string,
      affiliatedLink: '' as string,
      twitterShareLink: '' as string,
      telegramShareLink: '' as string,
      subscribeShow: false as boolean,
      taskModalShow: false as boolean,
      taskModalType: 0 as number,
      KYCStatus: {
        step: 1 as number,
        verification: 0 as number,
        userVerified: false as boolean,
        sessionID: '' as string
      },
      userStaked : 0,
      registeredSCDatas: null as any,
      registeredSCDatas_round2: null as any,
      KYCModalShow: false as boolean,
      copyNotification: false as boolean,
      timer: null as any,

      istgok: false as boolean,

      autoRefreshTime: 5,
      countdown: 0,

      social_tickets: 0,
      referral_tickets: 0,
      buyAmount: 0,
      maxAmount: 1500,
      buyedAmount: 0,
      buyedAmount_round2: 0,
      lottery_done: 0,
      isWinner: false as boolean,

      navList: [
        {
          title: 'Intro',
          href: '#nav-intro'
        },
        {
          title: 'Project Details',
          href: '#nav-details'
        },
        {
          title: 'About',
          href: '#nav-about'
        },
        {
          title: 'Features',
          href: '#nav-features'
        },
        {
          title: 'Roadmap',
          href: '#nav-roadmap'
        },
        {
          title: 'Team & Backers',
          href: '#nav-team'
        },
        {
          title: 'Tokenomics',
          href: '#nav-tokenomics'
        }
      ] as any,
      activeNav: 0 as number,
      fcfsPercent: 0 as number,
      fcfsRoundActive1: false as boolean,
      fcfsRoundActive2: false as boolean
    }
  },

  head: {
    title:
      (this as any) && (this as any).project && (this as any).project.seo_title_meta
        ? `${(this as any).project.seo_title_meta} - Cropper`
        : 'IDO - Cropper',
    meta: [
      {
        hid: 'og:site_name',
        property: 'og:site_name',
        content: 'Cropper'
      },
      {
        hid: 'og:type',
        property: 'og:type',
        content: 'website'
      },
      {
        hid: 'og:title',
        property: 'og:title',
        content:
          (this as any) && (this as any).project && (this as any).project.seo_title_meta
            ? `${(this as any).project.seo_title_meta} - Cropper`
            : 'IDO - Cropper'
      },
      {
        itemprop: 'name',
        content:
          (this as any) && (this as any).project && (this as any).project.seo_title_meta
            ? `${(this as any).project.seo_title_meta} - Cropper`
            : 'IDO - Cropper'
      },
      {
        name: 'title',
        content:
          (this as any) && (this as any).project && (this as any).project.seo_title_meta
            ? `${(this as any).project.seo_title_meta} - Cropper`
            : 'IDO - Cropper'
      },
      {
        hid: 'og:description',
        name: 'og:description',
        content:
          (this as any) && (this as any).project && (this as any).project.seo_title_meta
            ? (this as any).project.seo_desc_meta
            : ''
      },
      {
        hid: 'description',
        itemprop: 'description',
        name: 'description',
        content:
          (this as any) && (this as any).project && (this as any).project.seo_title_meta
            ? (this as any).project.seo_desc_meta
            : ''
      },
      {
        hid: 'twitter:card',
        name: 'twitter:card',
        content: 'summary'
      },
      {
        hid: 'twitter:card',
        name: 'twitter:card',
        content:
          (this as any) && (this as any).project && (this as any).project.seo_title_meta
            ? `https://cropper.finance/launchpad/${(this as any).project.slug}/`
            : ''
      },
      {
        hid: 'twitter:title',
        name: 'twitter:title',
        content:
          (this as any) && (this as any).project && (this as any).project.seo_title_meta
            ? `${(this as any).project.seo_title_meta} - Cropper`
            : 'IDO - Cropper'
      },
      {
        hid: 'twitter:description',
        name: 'twitter:description',
        content:
          (this as any) && (this as any).project && (this as any).project.seo_title_meta
            ? (this as any).project.seo_desc_meta
            : ''
      },
      {
        hid: 'twitter:creator',
        name: 'twitter:creator',
        content: '@CropperFinance'
      }
    ],

    link: [
      {
        hid: 'canonical',
        rel: 'canonical',
        href:
          (this as any) && (this as any).project && (this as any).project.seo_title_meta
            ? `https://cropper.finance/launchpad/${(this as any).project.slug}/`
            : ''
      }
    ]
  },

  computed: {
    ...mapState(['app', 'wallet', 'farm', 'url', 'price', 'liquidity', 'token'])
  },

  watch: {
    'wallet.address': {
      handler(newTokenAccounts: any) {
        this.currentHash = ''
        setAnchorProvider(this.$web3, this.$wallet)
        setAnchorProvider_round2(this.$web3, this.$wallet)

       // getLaunchpad()
        this.$accessor.wallet.getTokenAccounts()
        this.loadDatas()
      },
      deep: true
    },
    'wallet.connected': {
      handler(connected: any) {
        this.currentHash = ''
        setAnchorProvider(this.$web3, this.$wallet)
        setAnchorProvider_round2(this.$web3, this.$wallet)
        //getLaunchpad()
        this.autoRefreshTime = 5
        this.$accessor.wallet.getTokenAccounts()
        this.loadDatas()
      },
      deep: true
    }
  },

  mounted() {
    setAnchorProvider(this.$web3, this.$wallet)
    setAnchorProvider_round2(this.$web3, this.$wallet)
//    getLaunchpad()

    this.spTOKENS['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'] = { decimals: 6 }
    this.spTOKENS['11111111111111111111111111111111'] = { decimals: 9 }
    this.spTOKENS['So11111111111111111111111111111111111111112'] = { decimals: 9 }

    const query = new URLSearchParams(window.location.search)
    if (query.get('r')) {
      this.referal = query.get('r') as string
    }

    this.$accessor.wallet.getTokenAccounts()

    //@ts-ignore
    this.fertilizer.mint = this.project.mint
    this.currentTimestamp = moment().valueOf()
    this.loadDatas()
    this.setTimer()
  },
  beforeDestroy() {
    this.autoRefreshTime = 600
  },

  methods: {
    moment() {
      return moment()
    },

    setTimer() {
      this.timer = setInterval(() => {
        if (!this.loading) {
          if (this.countdown < this.autoRefreshTime) {
            this.countdown += 1
            if (this.countdown === this.autoRefreshTime) {
              this.loading = 1
              this.loadDatas()
              this.countdown = 0
            }
          }
        }
      }, 1000)
    },

    checkCurrentStep() {
      if (this.currentStep === 0 && this.currentTimestamp > this.fertilizer.whitelist_start_date) this.currentStep = 1
      if (this.currentStep === 1 && this.currentTimestamp > this.fertilizer.whitelist_end_date) this.currentStep = 2
      if (this.currentStep === 2 && this.currentTimestamp > this.fertilizer.distribution_start_date)
        this.currentStep = 3

      //@ts-ignore
      if (this.project.closed == 1) this.currentStatus.funded = 1
    },
    goBack() {
      this.$router.push({
        path: '/launchpad/'
      })
    },

    async onClaimTokens(round = 1) {
      const key = getUnixTs().toString()
      this.processing = true

      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      if(round == 1){

      claimTokens(this.$web3, this.$wallet, new PublicKey(this.fertilizer.mint))
        .then((txid: string) => {
          this.$notify.info({
            key,
            message: 'Transaction has been sent',
            description: (h: any) =>
              h('div', [
                'Confirmation is in progress.  Check your transaction on ',
                h(
                  'a',
                  {
                    attrs: {
                      href: `${this.url.explorer}/tx/${txid}`,
                      target: '_blank'
                    }
                  },
                  'here'
                )
              ])
          })
          const description = `Claim`
          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error: Error) => {
          this.$notify.error({
            key,
            message: 'Claim failed',
            description: error.message
          })
        })
        .finally(() => {
          this.processing = false
          this.contextualizeUser()
        })

      } else {
      claimTokens_round2(this.$web3, this.$wallet, new PublicKey(this.fertilizer.mint))
        .then((txid: string) => {
          this.$notify.info({
            key,
            message: 'Transaction has been sent',
            description: (h: any) =>
              h('div', [
                'Confirmation is in progress.  Check your transaction on ',
                h(
                  'a',
                  {
                    attrs: {
                      href: `${this.url.explorer}/tx/${txid}`,
                      target: '_blank'
                    }
                  },
                  'here'
                )
              ])
          })
          const description = `Claim`
          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error: Error) => {
          this.$notify.error({
            key,
            message: 'Claim failed',
            description: error.message
          })
        })
        .finally(() => {
          this.processing = false
          this.contextualizeUser()
        })

      }


      await this.delay(1500)
      this.contextualizeUser()
    },

    async onClickBuyNow() {
      const key = getUnixTs().toString()
      this.processing = true

      const priceTokenAccount = await get(
        this.wallet.tokenAccounts,
        `${this.fertilizer.main_sale_mint}.tokenAccountAddress`
      )

      let extraTokenAccount 

      if(this.fertilizer.extra_rate > 0 ){
        extraTokenAccount = await get(
          this.wallet.tokenAccounts,
          `${this.fertilizer.extra_sale_mint}.tokenAccountAddress`
        )
      } else {
        extraTokenAccount = false;
      }


      const decimals = this.spTOKENS[this.fertilizer.main_sale_mint].decimals

      let amount = this.buyAmount > this.maxAmount ? this.maxAmount : this.buyAmount
      let initAmount = amount

      amount = Math.round(amount * Math.pow(10, decimals))

      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })


        let responseData
        try {
          responseData = await fetch('https://flow.cropper.finance/kyc/' + this.wallet.address + '/').then((res) =>
            res.json()
          )
        } catch {
        } finally {
          this.currentHash = responseData.hash
        }


        //@ts-ignore
        if(this.project.round == 1){

            await buyTokens(
              this.$web3,
              this.$wallet,
              new PublicKey(this.fertilizer.mint),
              new PublicKey(priceTokenAccount),
              new PublicKey(extraTokenAccount),
              amount,
              this.currentHash
            )
            .then((txid: string) => {
                this.$notify.info({
                  key,
                  message: 'Transaction has been sent',
                  description: (h: any) =>
                    h('div', [
                      'Confirmation is in progress.  Check your transaction on ',
                      h(
                        'a',
                        {
                          attrs: {
                            href: `${this.url.explorer}/tx/${txid}`,
                            target: '_blank'
                          }
                        },
                        'here'
                      )
                    ])
                })
                const description = `Buy for ${initAmount} ${this.fertilizer.price_token}`
                this.$accessor.transaction.sub({ txid, description })
              })
              .catch((error: Error) => {
                this.$notify.error({
                  key,
                  message: 'Buy failed',
                  description: error.message
                })
              })
              .finally(() => {
                this.processing = false
                this.contextualizeUser()
                this.loadDatas()
              })
          
        } else {



            await buyTokens_round2(
              this.$web3,
              this.$wallet,
              new PublicKey(this.fertilizer.mint),
              new PublicKey(priceTokenAccount),
              new PublicKey(extraTokenAccount),
              amount,
              this.currentHash
            )
            .then((txid: string) => {
                this.$notify.info({
                  key,
                  message: 'Transaction has been sent',
                  description: (h: any) =>
                    h('div', [
                      'Confirmation is in progress.  Check your transaction on ',
                      h(
                        'a',
                        {
                          attrs: {
                            href: `${this.url.explorer}/tx/${txid}`,
                            target: '_blank'
                          }
                        },
                        'here'
                      )
                    ])
                })
                const description = `Buy for ${initAmount} ${this.fertilizer.price_token}`
                this.$accessor.transaction.sub({ txid, description })
              })
              .catch((error: Error) => {
                this.$notify.error({
                  key,
                  message: 'Buy failed',
                  description: error.message
                })
              })
              .finally(() => {
                this.processing = false
                this.contextualizeUser()
                this.loadDatas()
              })
          
        }



      await this.delay(1500)
      this.contextualizeUser()
      this.forceLoadDatas()
    },

    async contextualizeUser(isReload = 0) {
      if (!this.wallet.connected) {
        this.hasClaimed = 0
        this.hasClaimed_round2 = 0
        this.currentStatus.subscribe = false
        this.KYCStatus.step = 1
        this.KYCStatus.verification = 0
        this.KYCStatus.userVerified = false
        this.KYCStatus.sessionID = ''
        this.isWinner = false
        this.istgok = false

        this.firstload = true
        this.loaded = true;
        return
      }

      //@ts-ignore
      this.affiliatedLink = 'https://cropper.finance/launchpad/' + this.project.slug + '/?r=' + this.wallet.address
      this.twitterShareLink = `http://twitter.com/share?text=Sign up for ${this.fertilizer.title} on Cropper. Participate in the IDO of an emerging project.  Become an investor. Let's subscribe!&url=${this.affiliatedLink}`
      this.telegramShareLink = `https://telegram.me/share/url?url=${this.affiliatedLink}&text=Sign up for ${this.fertilizer.title} on Cropper. Participate in the IDO of an emerging project. Become an investor. Let's subscribe!`

      this.userLoading = 1

      let responseData


      if (
        this.fertilizer.main_sale_mint == 'So11111111111111111111111111111111111111112' ||
        this.fertilizer.main_sale_mint == '11111111111111111111111111111111'
      ) {
        this.balance = this.wallet.tokenAccounts['11111111111111111111111111111111'].balance
      } else {
        this.balance = get(this.wallet.tokenAccounts, `${this.fertilizer.main_sale_mint}.balance`)
      }



      if (window.localStorage['CYK' + this.wallet.address + 'set']) {
        this.KYCStatus.verification = 2
        this.KYCStatus.step = 3
        this.KYCStatus.userVerified = true
      } else {
        responseData
        try {
          responseData = await fetch('https://flow.cropper.finance/kyc/' + this.wallet.address + '/').then((res) =>
            res.json()
          )
        } catch {
        } finally {
          if (responseData.session_id || responseData.status == 'VALIDATED') {
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

                responseData = await fetch('https://flow.cropper.finance/kyc/' + this.wallet.address + '/').then(
                  (res) => res.json()
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
      }

      let registeredSCDatas = await getUserDatas(this.$wallet, new PublicKey(this.fertilizer.mint))

      let registeredSCDatas_round2 = await getUserDatas_round2(this.$wallet, new PublicKey(this.fertilizer.mint))

      if (!registeredSCDatas && !registeredSCDatas_round2) {
        this.firstload = true
        this.loaded = true;
        return
      }

      if (registeredSCDatas && registeredSCDatas.claimedAmount && registeredSCDatas.claimedAmount.toNumber() > 0) {
        this.hasClaimed = 1
        this.autoRefreshTime = 60
      }

      if (registeredSCDatas_round2 && registeredSCDatas_round2.claimedAmount && registeredSCDatas_round2.claimedAmount.toNumber() > 0) {
        this.hasClaimed_round2 = 1
        this.autoRefreshTime = 60
      }

      if (
        this.fertilizer.main_sale_mint == 'So11111111111111111111111111111111111111112' ||
        this.fertilizer.main_sale_mint == '11111111111111111111111111111111'
      ) {
        this.balance = this.wallet.tokenAccounts['11111111111111111111111111111111'].balance
      } else {
        this.balance = get(this.wallet.tokenAccounts, `${this.fertilizer.main_sale_mint}.balance`)
      }


      this.registeredSCDatas = registeredSCDatas
      this.registeredSCDatas_round2 = registeredSCDatas_round2

      if (registeredSCDatas) {
          let decimals = this.spTOKENS[this.fertilizer.main_sale_mint].decimals
          this.buyedAmount = registeredSCDatas.paidAmount / Math.pow(10, decimals)

          if( this.buyedAmount > 0){
            this.fcfsRoundActive1 = true;
          }

      }

      if (registeredSCDatas_round2) {
          let decimals = this.spTOKENS[this.fertilizer.main_sale_mint].decimals
          this.buyedAmount_round2 = registeredSCDatas_round2.paidAmount / Math.pow(10, decimals)

          if( this.buyedAmount_round2 > 0){
            this.fcfsRoundActive2 = true;
          }


          if(this.currentStep === 1){
            this.buyedAmount = this.buyedAmount_round2
          }

      }



      this.firstload = true
      this.loaded = true;

      this.userLoading = 0
    },

    async delay(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },

    async forceLoadDatas() {
      this.fertilizer.short_desc = ''
      this.loadDatas()
    },

    async loadDatas() {
      if (!this.wallet.connected) {
        this.autoRefreshTime = 60
      }

      if (this.fertilizer.short_desc == '') {
        let responseData = {} as any

        //@ts-ignore
        let item = this.project

        this.currentTimestamp = moment().valueOf()

        var curdate = new Date()
        this.fertilizer.short_desc = item['short_desc']
        this.fertilizer.long_desc = item['short_desc_2']
        this.fertilizer.title = item['title']
        this.fertilizer.tg_a = item['tg_a']
        this.fertilizer.tg_b = item['tg_b']
        this.fertilizer.tw_a = item['twitter_a']
        this.fertilizer.tw_b = item['twitter_b']
        this.lottery_done = item['lottery_done']

        setTimeout(function () {
          const titleEl = document.querySelector('head title')
          //@ts-ignore
          titleEl?.textContent = item['seo_title_meta'] + ' - Cropper'
          const descEl = document.querySelector('head meta[name="description"]')
          descEl?.setAttribute('content', item['seo_desc_meta'])
          const descEl2 = document.querySelector('head meta[name="og:description"]')
          descEl2?.setAttribute('content', item['seo_desc_meta'])
          const descEl21 = document.querySelector('head meta[name="twitter:description"]')
          descEl21?.setAttribute('content', item['seo_desc_meta'])
          const descEl22 = document.querySelector('head meta[name="twitter:title"]')
          descEl22?.setAttribute('content', item['seo_title_meta'] + ' - Cropper')
          const descEl3 = document.querySelector('head meta[name="og:title"]')
          descEl3?.setAttribute('content', item['seo_title_meta'] + ' - Cropper')

          const descEl4 = document.querySelector('head link[rel="canonical"]')
          descEl4?.setAttribute('href', 'https://cropper.finance/launchpad/' + item.slug + '/')
          const descEl41 = document.querySelector('head meta[name="twitter:card"]')
          descEl41?.setAttribute('content', 'https://cropper.finance/launchpad/' + item.slug + '/')
        }, 500)

        this.fertilizer.retweetlink = item['post_a']
        this.SubscribeModalContent = item['disclaimer']
        this.fertilizer.website_url = item.website_display
        this.fertilizer.vested_notice = item.vested_notice
        this.fertilizer.twitter_link = item.twitter_link
        this.fertilizer.website = item.website_url
        this.fertilizer.logo = item.token_logo
        this.fertilizer.token_decimal = item.token_decimal

        let scValues = await getProjectFormatted(this.fertilizer.mint) as any

        if (!scValues || !item.active) {
          this.$router.push({
            path: '/launchpad/'
          })
        }

        this.fertilizer.first_liberation = scValues.first_liberation / 100



        const decimals = this.spTOKENS[scValues.main_sale_mint].decimals


        scValues.token_price =
          (scValues as any).token_price / (Math.pow(10, 9 - this.fertilizer.token_decimal) * Math.pow(10, decimals))

        this.fertilizer.total_paid_amount = ((scValues as any).total_paid_amount  / scValues.token_price) / (Math.pow(10, 9 - this.fertilizer.token_decimal) * Math.pow(10, decimals))



        this.fertilizer.distribution_end_date = (moment(scValues.date_distribution).unix() + 86400 * 2) * 1000
        this.fertilizer.distribution_start_date = moment(scValues.date_distribution).unix() * 1000
        this.fertilizer.date_preparation = moment(scValues.date_preparation).unix() * 1000
        this.fertilizer.sales_end_date = moment(scValues.date_sale_end).unix() * 1000
        this.fertilizer.sales_start_date = moment(scValues.date_sale_start).unix() * 1000
        this.fertilizer.whitelist_end_date = moment(scValues.date_whitelist_end).unix() * 1000
        this.fertilizer.whitelist_start_date = moment(scValues.date_whitelist_start).unix() * 1000
        this.fertilizer.ido_info.sale_rate = scValues.token_price
        this.fertilizer.ido_info.hard_cap = scValues.total_allocation / (Math.pow(10, 9 - this.fertilizer.token_decimal) * Math.pow(10, decimals))
        this.fertilizer.ido_info.sale_type = item.type

        this.maxAmount = scValues.max_allocation_per_user / (Math.pow(10, 9 - this.fertilizer.token_decimal) * Math.pow(10, decimals))

        this.buyableAmount = this.maxAmount - this.buyedAmount


        if( 
          ((scValues.total_allocation - scValues.total_paid_amount)) / (Math.pow(10, 9 - this.fertilizer.token_decimal) * Math.pow(10, decimals)) < this.buyableAmount){
          this.buyableAmount =  ((scValues.total_allocation - scValues.total_paid_amount)) / (Math.pow(10, 9 - this.fertilizer.token_decimal) * Math.pow(10, decimals))
        }


        this.fertilizer.extra_rate = scValues.extra_rate
        this.fertilizer.extra_sale_mint = scValues.extra_sale_mint

        //@ts-ignore
        if(this.project.round == 2){

          let scValues_round2 = await getProjectFormatted_round2(this.fertilizer.mint) as any


          scValues_round2.token_price =
          (scValues_round2 as any).token_price / (Math.pow(10, 9 - this.fertilizer.token_decimal) * Math.pow(10, decimals))

          this.fertilizer.distribution_end_date = (moment(scValues_round2.date_distribution).unix() + 86400 * 2) * 1000
          this.fertilizer.distribution_start_date = moment(scValues_round2.date_distribution).unix() * 1000
          this.fertilizer.date_preparation = moment(scValues_round2.date_preparation).unix() * 1000
          this.fertilizer.sales_end_date = moment(scValues_round2.date_sale_end).unix() * 1000
          this.fertilizer.sales_start_date = moment(scValues_round2.date_sale_start).unix() * 1000
          this.fertilizer.whitelist_end_date = moment(scValues_round2.date_whitelist_end).unix() * 1000
          this.fertilizer.whitelist_start_date = moment(scValues_round2.date_whitelist_start).unix() * 1000
          this.fertilizer.ido_info.sale_rate = scValues_round2.token_price
          
          this.fertilizer.ido_info.sale_type = item.type

          this.maxAmount = scValues_round2.max_allocation_per_user / (Math.pow(10, 9 - this.fertilizer.token_decimal) * Math.pow(10, decimals))

          this.fertilizer.extra_rate = scValues_round2.extra_rate
          this.fertilizer.extra_sale_mint = scValues_round2.extra_sale_mint


          this.fertilizer.total_paid_amount += ((scValues_round2 as any).total_paid_amount  / scValues_round2.token_price) / (Math.pow(10, 9 - this.fertilizer.token_decimal) * Math.pow(10, decimals))


          this.buyableAmount = this.maxAmount - this.buyedAmount_round2



          if( 
            ((scValues_round2.total_allocation - scValues_round2.total_paid_amount)) / (Math.pow(10, 9 - this.fertilizer.token_decimal) * Math.pow(10, decimals)) < this.buyableAmount){
            this.buyableAmount =  ((scValues_round2.total_allocation - scValues_round2.total_paid_amount)) / (Math.pow(10, 9 - this.fertilizer.token_decimal) * Math.pow(10, decimals))
          }

        }


        let content = '' as any

        try {
          content = await fetch('https://api.cropper.finance/fcfs/' + this.fertilizer.mint + '/').then((res) =>
            res.json()
          )
        } catch {
          this.fertilizer.longContent = ''
        } finally {
          this.fertilizer.longContent = content.content
        }




        this.checkCurrentStep()

        if (scValues.token_price != undefined && scValues.token_price > 0) {
          this.fertilizer.total_allocation = Math.round( ( (scValues.total_allocation / scValues.token_price)  / (Math.pow(10, 9 - this.fertilizer.token_decimal) * Math.pow(10, decimals))   )  * 100) / 100
        }


        this.fcfsPercent = Math.round(this.fertilizer.total_paid_amount * 10000 / this.fertilizer.total_allocation) / 100

        let token = getTokenByMintAddress(scValues.main_sale_mint)

        if (token) {
          this.fertilizer.price_token = token.symbol
          this.fertilizer.main_sale_mint = scValues.main_sale_mint
        }



        token = getTokenByMintAddress(this.fertilizer.mint)
        if (token) {
          this.fertilizer.token_info.symbol = token.symbol
        }

        if (this.fertilizer.mint == 'zebeczgi5fSEtbpfQKVZKCJ3WgYXxjkMUkNNx7fLKAF') {
          this.fertilizer.token_info.symbol = 'ZBC'
        }


        if (this.fertilizer.mint == 'htoHLBJV1err8xP5oxyQdV2PLQhtVjxLXpKB7FsgJQD') {
          this.fertilizer.token_info.symbol = 'HTO'
        }

        this.fertilizer.swapLink = '/swap/?from=' + scValues.main_sale_mint + '&to=' + this.fertilizer.mint


      }



    let tiers_info = {
      tiers: 0,
      xCRP: 0
    }


    try {
      setAnchorProvider_stake(this.$web3, this.$wallet)
      const farm_state = await getFarmState()
      const extraRewardConfigs = await getExtraRewardConfigs()

      const pools = await getAllPools()
      const current_pool = pools[0]
      const userAccount = await getPoolUserAccount(this.$wallet, current_pool.publicKey)


      //@ts-ignore
      this.userStaked = Number(new TokenAmount(userAccount.amount, 9).fixed(3))

 
      tiers_info = calculateTiers(this.userStaked, userAccount.lockDuration.toNumber(), this.$accessor.wallet)
    } catch {}




    this.$accessor.wallet.setStakingTiers(tiers_info)

    this.currentTier = tiers_info.tiers


      await this.contextualizeUser()
      this.loading = 0
    },

    copyToClipboard() {
      var textField = document.createElement('textarea')
      textField.innerText = this.affiliatedLink
      document.body.appendChild(textField)
      textField.select()
      document.execCommand('copy')
      textField.remove()
      this.copyNotification = true
      setTimeout(() => {
        this.copyNotification = false
      }, 3000)
    },

    dataURLtoFile(dataurl: any, filename: any) {
      var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n)

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }

      return new File([u8arr], filename + '.jpg', { type: mime })
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

            this.contextualizeUser()

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
.fertilizer-project {
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

  .project-status {
    padding: 4px 8px;
    border-radius: 6px;

    &.whitelist {
      background: @color-red600;
    }

    &.sales {
      background: @color-purple600;
    }

    &.open {
      background: @color-purple500;
    }

    &.distribution {
      background: @color-yellow600;
      color: @color-neutral900;
    }

    &.preparation {
      background: @color-pink600;
    }

    &.fcfs {
      background: @color-petrol500;
    }
  }

  .status-label {
    &.description {
      color: #fff;
    }

    &.success {
      color: @color-green500;
    }

    &.closed {
      color: @color-red500;
    }
  }

  .status-icon {
    height: 16px;
    width: 16px;
    margin-right: 8px;
  }

  .alert-icon {
    height: 24px;
    width: 24px;
    margin-right: 8px;
  }

  .coin-icon {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-right: 6px;
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

  .lock-icon {
    width: 16px;
    height: 16px;
    margin-right: 6px;
  }

  .twitter-icon {
    width: 24px;
    height: 20px;
    opacity: 0.5;
    margin-left: 16px;
  }

  .isDesktop {
    @media @max-lg-tablet {
      display: none;
    }
  }

  .isTablet {
    display: none;

    @media @max-lg-tablet {
      display: unset;
    }

    @media @max-sl-mobile {
      display: none;
    }
  }

  .isMobile {
    display: none;

    @media @max-sl-mobile {
      display: unset;
    }
  }
}

// class stylesheet
.fertilizer-project.container {
  margin: 38px auto;

  @media @max-sl-mobile {
    margin: 28px auto;
  }

  .round{
      width: 80px;
      height: 55px;
      background: #fff;
      border-radius: 18px;

      span {
        background: @gradient-color03;
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
              
  }

  .card {
    .card-body {
      padding: 0;

      .project-content {
        display: flex;

        @media @max-md-tablet {
          display: block;
        }

        .project-status-container {
          position: fixed;
          width: 300px;

          @media @max-md-tablet {
            position: relative;
            width: 100%;
          }

          .project-back {
            margin-bottom: 28px;

            .back-to-list {
              opacity: 0.5;
              width: fit-content;

              .back-icon {
                margin-right: 8px;
              }

              .back-label {
                color: #fff;
              }
            }
          }

          .project-preview-ido-container {
            @media @max-md-tablet {
              display: flex;
              justify-content: space-between;
            }

            @media @max-sl-mobile {
              display: block;
            }

            .project-preview-container {
              background: @gradient-color03;
              padding: 3px;
              border-radius: 8px;
              margin-bottom: 16px;
              height: fit-content;

              @media @max-md-tablet {
                width: 50%;
                margin-bottom: 0;
                margin-right: 8px;
              }

              @media @max-sl-mobile {
                width: 100%;
                margin-bottom: 16px;
                margin-right: 0;
              }

              .project-preview {
                background: @color-blue900;
                border-radius: 8px;
                padding: 13px;

                .project-overview {
                  .project-title {
                    .project-logo {
                      border-radius: 50%;
                      margin-right: 8px;
                      width: 40px;
                    }
                  }
                }

                .project-countdown {
                  margin-top: 16px;
                }

                .project-progress {
                  margin-top: 16px;
                }
              }
            }

            .project-ido-container {
              background: @gradient-color03;
              padding: 3px;
              border-radius: 8px;

              @media @max-md-tablet {
                width: 50%;
                margin-left: 8px;
              }

              @media @max-sl-mobile {
                width: 100%;
                margin-left: 0;
              }

              .project-ido {
                height: 100%;
                width: 100%;
                background: @color-blue900;
                border-radius: 8px;
                padding: 13px 21px;

                .label {
                  display: block;
                  margin-bottom: 18px;
                }
              }
            }
          }
        }

        .project-detail-container {
          width: calc(100% - 300px - 16px);
          margin-left: calc(300px + 16px);

          @media @max-md-tablet {
            width: 100%;
            margin-left: 0;
            margin-top: 16px;
            padding-top: 0;
          }

          .project-detail-head {
            margin-bottom: 12px;

            .project-guideline {
              padding: 4px 8px;
              background: @color-blue600;
              border-radius: 8px;

              .guideline-label {
                color: @color-blue100;
              }

              .move-icon {
                margin-left: 8px;
              }
            }
          }

          .project-detail-nav {
            margin-bottom: 24px;

            @media @max-lg-tablet {
              display: none !important;
            }

            .nav-item {
              margin-right: 24px;
              color: #ffffff50;

              &:last-child {
                margin-right: 0;
              }

              .active {
                color: @color-petrol500;
              }

              .active-underline {
                height: 4px;
                border-radius: 10px;
                background: @color-petrol400;
              }
            }
          }

          .project-banner {
            border-radius: 8px 8px 0 0;
          }

          .project-detail-condition {
            margin-bottom: 24px;

            .project-detail-item {
              background: @color-blue700;
              border-radius: 8px;
              padding: 32px;

              @media @max-sl-mobile {
                padding: 24px;
              }

              .ticket-tasks-group {
                margin-top: 32px;

                @media @max-lg-tablet {
                  display: block !important;
                }

                .ticket-tasks {
                  width: 60%;
                  padding-right: 48px;

                  @media @max-lg-tablet {
                    width: 100%;
                    padding-right: 0;
                  }

                  .ticket-task-status-group {
                    margin: 24px 0;

                    @media @max-sl-mobile {
                      display: block !important;
                    }

                    .ticket-task-status-card {
                      background: @color-blue400;
                      width: calc((100% - 24px) / 2);
                      padding: 16px;
                      border-radius: 8px;

                      &:hover {
                        box-shadow: 1px 1px 9px 3px #00000047;
                        background: #4355cc;
                      }

                      @media @max-sl-mobile {
                        width: 100%;

                        &:first-child {
                          margin-bottom: 24px;
                        }
                      }

                      &.active {
                        background: @color-green500;
                      }

                      .ticket-task-status {
                        .ticket-social-icon {
                          width: 24px;
                          opacity: 0.5;
                          margin-right: 24px;
                        }
                      }
                    }
                  }

                  .ticket-share-group {
                    position: relative;
                    margin: 8px 0 24px 0;
                    padding: 0 8px;
                    background: rgba(226, 227, 236, 0.1);
                    border-radius: 12px;

                    .ticket-share-link {
                      background: transparent;
                      outline: none;
                      border: none;
                      width: 100%;
                      padding: 10px;
                    }

                    .copy-icon {
                      margin: 0 10px;
                    }

                    .copy-notification {
                      position: absolute;
                      top: 50px;
                      right: 10px;
                      background: @gradient-color-primary;
                      background-origin: border-box;
                      border: 2px solid rgba(255, 255, 255, 0.14);
                      box-shadow: 18px 11px 14px rgba(0, 0, 0, 0.25);
                      border-radius: 8px;
                      padding: 12px;
                    }
                  }

                  .ticket-btn-group {
                    @media @max-sl-mobile {
                      display: block !important;
                    }

                    .share-btn {
                      width: calc((100% - 24px) / 2);

                      @media @max-sl-mobile {
                        width: 100%;

                        &:first-child {
                          margin-bottom: 24px;
                        }
                      }

                      .btn-primary {
                        width: 100%;
                        padding: 10px 0;
                      }
                    }
                  }
                }

                .ticket-preview {
                  width: 40%;
                  height: 100%;
                  background: @color-blue800;
                  border-radius: 8px;
                  padding: 16px;

                  @media @max-lg-tablet {
                    width: 100%;
                    margin-top: 24px;
                  }
                  .ticket-earned {
                    .ticket-earned-status {
                      background: @gradient-color03;
                      padding: 16px;
                      margin-top: 16px;
                      border-radius: 8px;

                      .referral-icon {
                        margin-right: 24px;
                      }
                    }
                  }
                }
              }

              .distribution-details {
                margin-top: 24px;

                .sale-details-group {
                  margin: 24px 0;

                  .sale-detail-card {
                    background: @color-blue500;
                    min-width: 132px;
                    border-radius: 8px;
                    padding: 16px;
                    margin-right: 24px;

                    &:last-child {
                      margin-right: 0;
                    }
                  }
                }

                .btn-container {
                  width: 212px;
                }
              }

              .project-detail-sales {
                .sales-start-countdown {
                  margin-top: 32px;
                }
              }

              .project-detail-open {
                display: table;
                margin: auto;

                &.fcfs {
                  max-width: 550px;
                }

                .kyc-form {
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

                .buy-form {
                  .token-amount {
                    background: rgba(226, 227, 236, 0.1);
                    border-radius: 12px;
                    padding: 10px;
                    margin: 16px 0 8px 0;

                    .token-amount-input {
                      width: calc(100% - 83px);

                      input {
                        border: none;
                        outline: none;
                        background: transparent;
                        width: 100%;

                        &::-webkit-inner-spin-button {
                          display: none;
                        }
                      }
                    }

                    .token-max-container {
                      .token-max-btn {
                        height: 32px;
                        width: 32px;
                        background: transparent;
                        border: 1px solid @color-blue300;
                        border-radius: 4px;
                        color: @color-blue100;
                        margin-right: 4px;
                      }

                      .token-max-amount {
                        color: @color-blue100;
                      }
                    }

                    .token-amount-balance {
                      margin-top: 8px;
                      color: @color-blue200;
                    }
                  }

                  .receive-amount {
                    .receive-amount-output {
                      background: @color-blue800;
                      border-radius: 12px;
                      padding: 10px;
                      margin-top: 4px;

                      .receive-amount-value {
                        color: rgba(255, 255, 255, 0.5);
                      }
                    }
                  }

                  .buy-amount {
                    margin-top: 8px;

                    .buy-amount-output {
                      background: @color-petrol500;
                      border-radius: 12px;
                      padding: 10px;
                      margin-top: 4px;
                    }
                  }

                  .receive-notification {
                    background: @color-blue800;
                    margin-top: 32px;
                    padding: 18px;
                    border-radius: 18px;
                  }

                  .btn-container {
                    margin-top: 24px;
                  }

                  &.fcfs {
                    margin-right: 4px;

                    &:last-child {
                      margin-left: 4px;
                      margin-right: 0;
                    }

                    .fcfs-claim-form {
                      position: relative;
                      padding: 10px 12px;
                      background: rgba(226, 227, 236, 0.1);
                      border-radius: 12px;

                      .token-amount {
                        margin: 0 0 4px 0;
                      }

                      .btn-container {
                        margin-top: 4px;
                      }

                      .round-notification {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 150px;
                        background: @color-blue500;
                        border-radius: 8px;
                        padding: 10px;
                      }

                      .deactive {
                        filter: blur(10px);
                        backdrop-filter: blur(10px);
                      }
                    }
                  }
                }

                .distribution-start-countdown {
                  margin-bottom: 32px;
                }
              }

              .fcfs-container {
                max-width: 505px;
                margin-bottom: 24px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
<style lang="less">
.fertilizer-project {
  // ant steps
  .ant-steps-vertical {
    .ant-steps-item-content {
      min-height: 45px;
    }

    .ant-steps-item-active,
    .ant-steps-item-finish {
      .ant-steps-item-tail::after,
      .ant-steps-item-icon {
        background-color: @color-petrol500 !important;
      }

      .ant-steps-item-title {
        color: @color-petrol500 !important;
      }
    }

    .ant-steps-item-error {
      .ant-steps-item-icon {
        background-color: red !important;
      }
    }

    .ant-steps-item {
      .ant-steps-item-container {
        .ant-steps-item-tail {
          &::after {
            background-color: rgba(255, 255, 255, 0.4);
          }
        }

        .ant-steps-item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          background-color: rgba(255, 255, 255, 0.4);

          .ant-steps-icon {
            display: flex;
            top: 0;
            font-size: 13px;
            line-height: 19.5px;
            letter-spacing: 0.5px;
            font-weight: 600;
            color: @color-blue700;
          }
        }

        .ant-steps-item-title {
          width: 100%;
          color: rgba(255, 255, 255, 0.4);
        }
      }
    }
  }
}

.fcfs .project-detail-static.stake{
  margin-top:20px
}
</style>