<template>
  <div class="fertilizer-project container">
    <div class="card">
      <div class="card-body">
        <Loader
          v-if="subscribeLoading"
          content="Waiting for confirmation"
          @onCancel="() => (subscribeLoading = false)"
        ></Loader>

        <SubscribeModal
          :show="subscribeShow"
          :content="SubscribeModalContent"
          @onCancel="() => (subscribeShow = false)"
          @onOk="
            () => {
              initSubscribe()
            }
          "
        />
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
                  contextualizeUserFromBDD()
                }
              } else {
                this.socialTicket.twitter++
                if (this.socialTicket.twitter >= 3) {
                  taskModalShow = false
                  contextualizeUserFromBDD()
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
                    <div
                      class="project-status"
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
                          ? 'The whitelist starts in'
                          : currentStep === 1
                          ? 'The Whitelist ends in'
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
                      <div v-if="!currentStatus.subscribe && firstload" class="btn-container">
                        <Button
                          class="btn-transparent font-medium weight-semi icon-cursor"
                          id="jw"
                          @click="
                            () => {
                              if (this.wallet.connected) this.subscribeShow = true
                              else this.$accessor.wallet.openModal()
                            }
                          "
                          >Join Whitelist</Button
                        >
                      </div>
                      <div v-else-if="currentStatus.subscribe" class="fcc-container">
                        <img class="status-icon" src="@/assets/icons/check-circle-white.svg" />
                        <span class="font-small weight-semi spacing-large">Ticket earning is in progress</span>
                      </div>
                    </div>
                    <div v-else-if="currentStep === 2">
                      <div v-if="currentTimestamp < fertilizer.sales_end_date">
                        <div v-if="currentStatus.subscribe && isWinner" class="fcc-container">
                          <img class="status-icon" src="@/assets/icons/check-circle-white.svg" />
                          <span class="font-small weight-semi spacing-large">You are registered</span>
                        </div>
                        <div v-else-if="(!isWinner || !currentStatus.subscribe) && firstload" class="fcc-container">
                          <img class="alert-icon" src="@/assets/icons/alert-white.svg" />
                          <span class="font-small weight-semi spacing-large">You are not in the whitelist</span>
                        </div>
                      </div>
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
                  <span class="label font-medium weight-bold">IDO process:</span>
                  <Steps :current="currentStep" size="small" direction="vertical" :status="currentStatus.steps">
                    <Step>
                      <template slot="title">
                        <span class="font-small weight-bold">Preparation</span>
                      </template>
                    </Step>
                    <Step>
                      <template slot="title">
                        <div class="fcsb-container">
                          <span class="font-small weight-bold">Whitelist</span>
                          <span
                            v-if="currentStep > 1 && currentStatus.subscribe"
                            class="status-label success font-small weight-bold"
                            >Registered</span
                          >
                          <span
                            v-else-if="currentStep > 1 && !currentStatus.subscribe"
                            class="status-label closed font-small weight-bold"
                            >Not registered</span
                          >
                        </div>
                        <span v-if="currentStep === 1 && currentTier >= 3" class="status-label description font-small">
                          You are registered for the whitelist
                        </span>
                        <span v-if="currentStep === 1 && currentTier < 3" class="status-label description font-small">
                          You can now register for the whitelist</span
                        >
                      </template>
                    </Step>
                    <Step>
                      <template slot="title">
                        <div class="fcsb-container">
                          <span class="font-small weight-bold">Sales</span>
                          <span v-if="currentStep > 2" class="status-label closed font-small weight-bold">Closed</span>
                        </div>
                        <span v-if="currentStep === 2" class="status-label description font-small"
                          >Winners can participate in the token sale.</span
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
            <div class="project-detail-static">
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
                      <span class="title font-small weight-semi spacing-large">Token Price</span>
                      <div class="value fcs-container">
                        <CoinIcon class="coin-icon" :mint-address="fertilizer.price_token_mint" />
                        <span class="font-medium"
                          ><b>{{ fertilizer.ido_info.sale_rate }}</b> {{ fertilizer.price_token }}</span
                        >
                      </div>
                    </Col>
                    <Col :md="8" :sm="12" :xs="12" class="project-detail-info-item">
                      <span class="title font-small weight-semi spacing-large">Hard Cap</span>
                      <div class="value fcs-container">
                        <CoinIcon class="coin-icon" :mint-address="fertilizer.price_token_mint" />
                        <span class="font-medium"
                          ><b>{{ fertilizer.ido_info.hard_cap.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}</b>
                          {{ fertilizer.price_token }}</span
                        >
                      </div>
                    </Col>
                    <Col :md="8" :sm="12" :xs="12" class="project-detail-info-item">
                      <span class="title font-small weight-semi spacing-large">Pool Size</span>
                      <div class="value fcs-container">
                        <img class="coin-icon" :src="fertilizer.logo" />
                        <span class="font-medium"
                          ><b>{{ fertilizer.pool_size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}</b>
                          {{ fertilizer.token_info.symbol }}</span
                        >
                      </div>
                    </Col>
                    <Col :md="8" :sm="12" :xs="12" class="project-detail-info-item">
                      <span class="title font-small weight-semi spacing-large">Type</span>
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
                      <span class="title font-small weight-semi spacing-large">Registered on</span>
                      <div class="value">
                        <span class="font-medium weight-semi">{{ fertilizer.subscribers }}</span>
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
              class="project-detail-condition"
              v-if="!fertilizer.tba && wallet.connected && !firstload"
              style="text-align: center"
            >
              <Spin :spinning="true">
                <Icon slot="indicator" type="loading" style="font-size: 24px" spin />
              </Spin>
            </div>

            <div class="project-detail-condition" v-if="!fertilizer.tba && !(wallet.connected && !firstload)">
              <div class="project-detail-item pdi002" v-if="currentStep === 1 && KYCStatus.step == 3 && isWinner">
                <div v-if="currentTimestamp < fertilizer.sales_start_date" class="project-detail-sales">
                  <div>
                    <div class="fcc-container">
                      <img class="status-icon" src="@/assets/icons/check-circle-white.svg" />
                      <span class="font-medium weight-semi spacing-small"
                        >Congratulations! You're successfully registered and will be able to buy once the sale starts.

                        <span v-if="KYCStatus.step == 3"><br />Your KYC is valid.</span>
                      </span>
                    </div>
                    <Countdown
                      class="sales-start-countdown"
                      title="Sale start in:"
                      :value="fertilizer.sales_start_date"
                      format="DD:HH:mm:ss"
                      @finish="forceLoadDatas()"
                    />
                  </div>
                </div>
              </div>
              <div
                class="project-detail-item pdi2"
                v-if="
                  ((currentStep === 1 && KYCStatus.step < 3 && isWinner) ||
                    (currentStep === 2 && isWinner && KYCStatus.step < 3)) &&
                  currentTimestamp < fertilizer.sales_end_date
                "
              >
                <div class="project-detail-open" v-if="isWinner">
                  <div>
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
                    <div v-if="KYCStatus.userVerified && KYCStatus.step === 3 && isWinner" class="buy-form">
                      <span class="font-medium weight-semi spacing-small"
                        >You can buy sale tokens and preview what you will receive below.</span
                      >
                      <div class="token-amount">
                        <div class="fcsb-container">
                          <div class="token-amount-input fcs-container">
                            <CoinIcon class="coin-icon" :mint-address="fertilizer.price_token_mint" />
                            <input
                              class="font-medium weight-bold"
                              v-model="buyAmount"
                              @onInput="(amount) => (buyAmount = amount)"
                              type="number"
                              :placeholder="maxAmount - buyedAmount"
                            />
                          </div>
                          <div class="token-max-container fcc-container">
                            <button
                              v-if="buyAmount < maxAmount"
                              class="token-max-btn icon-cursor font-xsmall weight-bold fcc-container"
                              @click="
                                () => {
                                  buyAmount =
                                    maxAmount - buyedAmount > balance.fixed()
                                      ? balance.fixed()
                                      : maxAmount - buyedAmount
                                }
                              "
                            >
                              Max
                            </button>
                            <span class="font-xsmall weight-semi token-max-amount text-right"
                              >max {{ maxAmount - buyedAmount }} {{ fertilizer.token_price }}</span
                            >
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
                      <div class="receive-amount">
                        <label class="font-xmall">You will receive:</label>
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
                      <div class="btn-container">
                        <Button
                          :disabled="
                            buyAmount <= 0 || buyAmount > maxAmount - buyedAmount || buyAmount > balance.fixed()
                          "
                          @click="
                            () => {
                              if (
                                !(buyAmount <= 0 || buyAmount > maxAmount - buyedAmount || buyAmount > balance.fixed())
                              ) {
                                onClickBuyNow()
                              }
                            }
                          "
                          class="btn-transparent font-medium weight-semi icon-cursor"
                          >Buy Now</Button
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="currentStep === 0"></div>
              <div
                v-else-if="currentStep === 1 && currentStatus.subscribe && currentTier <= 2"
                class="project-detail-item pdi3"
              >
                <div class="mb-8">
                  <h4 class="weight-semi">Earn Social Pool Lottery Tickets</h4>
                </div>
                <span class="font-medium">
                  A portion of the token sale will be allocated to the Social Pool. You can earn extra chances for
                  allocation by completing different social tasks.
                </span>
                <div class="ticket-tasks-group fssb-container">
                  <div class="ticket-tasks">
                    <span class="font-medium weight-bold">Earn tickets by completing these tasks:</span>
                    <div class="ticket-task-status-group fcsb-container">
                      <div
                        class="ticket-task-status-card fcsb-container icon-cursor"
                        :class="socialTicket.telegram === 3 ? 'active' : ''"
                        @click="
                          () => {
                            if (this.socialTicket.telegram == 0 ? 0 : this.socialTicket.telegram - 1 < 2) {
                              this.taskModalShow = true
                              this.taskModalType = 0
                            }
                          }
                        "
                      >
                        <div class="ticket-task-status fs-container">
                          <img class="ticket-social-icon" src="@/assets/icons/telegram-white.svg" />
                          <div>
                            <span class="font-medium weight-bold">Telegram tasks</span>
                            <br />
                            <span class="font-xsmall weight-semi"
                              >{{ socialTicket.telegram == 0 ? 0 : socialTicket.telegram - 1 }} /2 Tasks completed</span
                            >
                          </div>
                        </div>
                        <img
                          v-if="socialTicket.telegram === 3"
                          class="status-icon"
                          src="@/assets/icons/check-white.svg"
                        />
                      </div>
                      <div
                        class="ticket-task-status-card fcsb-container icon-cursor"
                        :class="socialTicket.twitter === 3 ? 'active' : ''"
                        @click="
                          () => {
                            if (this.socialTicket.twitter < 3) {
                              this.taskModalShow = true
                              this.taskModalType = 1
                            }
                          }
                        "
                      >
                        <div class="ticket-task-status fs-container">
                          <img class="ticket-social-icon" src="@/assets/icons/twitter-white.svg" />
                          <div>
                            <span class="font-medium weight-bold">Twitter tasks</span>
                            <br />
                            <span class="font-xsmall weight-semi">{{ socialTicket.twitter }}/3 Tasks completed</span>
                          </div>
                        </div>
                        <img
                          v-if="socialTicket.twitter === 3"
                          class="status-icon"
                          src="@/assets/icons/check-white.svg"
                        />
                      </div>
                    </div>
                    <span class="font-medium weight-bold">Share your referral below to earn additional tickets:</span>
                    <div class="ticket-share-group fcsb-container">
                      <input type="text" class="ticket-share-link font-medium" :value="affiliatedLink" disabled />
                      <img class="copy-icon icon-cursor" src="@/assets/icons/copy.svg" @click="copyToClipboard()" />
                      <div v-if="copyNotification" class="copy-notification">
                        <span class="font-small weight-semi spacing-large">Link was copied to clipboard</span>
                      </div>
                    </div>
                    <div class="ticket-btn-group fcsb-container">
                      <div class="share-btn btn-container">
                        <a :href="telegramShareLink" target="_blank">
                          <Button class="btn-primary font-small weight-semi spacing-large icon-cursor"
                            >Share on Telegram</Button
                          ></a
                        >
                      </div>
                      <div class="share-btn btn-container">
                        <a :href="twitterShareLink" target="_blank">
                          <Button class="btn-primary font-small weight-semi spacing-large icon-cursor"
                            >Share on Twitter</Button
                          ></a
                        >
                      </div>
                    </div>
                  </div>
                  <div class="ticket-preview">
                    <div class="ticket-earned">
                      <span class="font-medium weight-bold"
                        >You are now registered for the {{ fertilizer.title }} whitelist and have:</span
                      >
                      <div class="ticket-earned-status fcs-container">
                        <img class="referral-icon" src="@/assets/icons/referral.svg" />
                        <div>
                          <span class="font-medium weight-semi spacing-small">
                            <label class="font-large">{{
                              total_tickets + (currentTier == 2 ? 300 : currentTier == 1 ? 20 : 0)
                            }}</label>
                            Earned Tickets
                          </span>
                          <br />
                          <span class="font-xsmall"
                            >{{ social_tickets > 5 ? 5 : social_tickets }} Social / {{ referral_tickets }} Referrals /
                            {{ currentTier == 2 ? 300 : currentTier == 1 ? 20 : 0 }} Tier tickets</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-else-if="currentStep === 1 && currentStatus.subscribe && currentTier > 2 && KYCStatus.step != 3"
                class="project-detail-item pdi301"
              >
                <div>
                  <div class="fcc-container">
                    <img class="status-icon" src="@/assets/icons/check-circle-white.svg" />
                    <span class="font-medium weight-semi spacing-small"
                      >Congratulations! You're successfully registered and will be able to buy once the sale starts.
                      <span
                        ><br />But you still need to submit your KYC verification to purchase during the sale. Verify
                        your KYC now.</span
                      >
                    </span>
                  </div>
                  <Countdown
                    class="sales-start-countdown"
                    title="Sale start in:"
                    :value="fertilizer.sales_start_date"
                    format="DD:HH:mm:ss"
                    @finish="forceLoadDatas()"
                  />
                </div>
              </div>

              <div v-else-if="currentStep === 2 && !currentStatus.subscribe" class="project-detail-item pdi871">
                <div class="project-detail-sales">
                  <div class="text-center">
                    <div class="fcc-container mb-8">
                      <img class="alert-icon" src="@/assets/icons/alert-white.svg" />
                      <h4 class="weight-bold spacing-medium">
                        Sorry, the whitelist has ended and it looks like you didn't win lottery allocation this time.
                      </h4>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-else-if="currentStep === 2 && !isWinner && lottery_done == 0 && currentStatus.subscribe"
                class="project-detail-item pdi87"
              >
                <div class="project-detail-sales">
                  <div class="text-center">
                    <div class="fcc-container mb-8">
                      <img class="alert-icon" src="@/assets/icons/alert-white.svg" />
                      <h4 class="weight-bold spacing-medium">
                        The lottery is still in progress.<br />Winners will be announced as soon as possible
                      </h4>
                    </div>
                    <span class="font-medium"
                      >Tired of not winning? You can secure guaranteed allocation for every Fertilizer whitelist by
                      staking CRP below..</span
                    >
                  </div>
                </div>
              </div>

              <div
                v-else-if="currentStep === 2 && !isWinner && lottery_done == 1 && currentStatus.subscribe"
                class="project-detail-item pdi5"
              >
                <div class="project-detail-sales">
                  <div class="text-center">
                    <div class="fcc-container mb-8">
                      <img class="alert-icon" src="@/assets/icons/alert-white.svg" />
                      <h4 class="weight-bold spacing-medium">
                        Sorry, the whitelist has ended and it looks like you didn't win allocation this time.
                      </h4>
                    </div>
                    <span class="font-medium"
                      >Tired of not winning? You can secure guaranteed allocation for every Fertilizer whitelist by
                      staking CRP below..</span
                    >
                  </div>
                </div>
              </div>

              <div v-else-if="currentStep === 2 && isWinner" class="project-detail-item pdi4">
                <div v-if="currentTimestamp < fertilizer.sales_start_date" class="project-detail-sales">
                  <div>
                    <div class="fcc-container">
                      <img class="status-icon" src="@/assets/icons/check-circle-white.svg" />
                      <span class="font-medium weight-semi spacing-small"
                        >Congratulations<span v-if="currentTier < 3">, you have a winning lottery ticket</span>! You're
                        successfully registered and will be able to buy once the sale starts.
                        <span v-if="KYCStatus.step != 3"
                          ><br />But you still need to submit your KYC verification to purchase during the sale. Verify
                          your KYC now.</span
                        >
                        <span v-if="KYCStatus.step == 3"><br />Your KYC is valid.</span></span
                      >
                    </div>
                    <Countdown
                      class="sales-start-countdown"
                      title="Sale start in:"
                      :value="fertilizer.sales_start_date"
                      format="DD:HH:mm:ss"
                      @finish="forceLoadDatas()"
                    />
                  </div>
                </div>
                <div
                  v-else-if="
                    currentTimestamp > fertilizer.sales_start_date &&
                    currentTimestamp < fertilizer.sales_end_date &&
                    isWinner
                  "
                >
                  <div class="project-detail-open">
                    <div v-if="true">
                      <div v-if="KYCStatus.userVerified && KYCStatus.step === 3 && isWinner" class="buy-form">
                        <span class="font-medium weight-semi spacing-small"
                          >You can buy sale tokens and preview what you will receive below.</span
                        >
                        <div class="token-amount">
                          <div class="fcsb-container">
                            <div class="token-amount-input fcs-container">
                              <CoinIcon class="coin-icon" :mint-address="fertilizer.price_token_mint" />
                              <input
                                class="font-medium weight-bold"
                                v-model="buyAmount"
                                @onInput="(amount) => (buyAmount = amount)"
                                type="number"
                                :placeholder="maxAmount - buyedAmount"
                              />
                            </div>
                            <div class="token-max-container fcc-container">
                              <button
                                v-if="buyAmount < maxAmount"
                                class="token-max-btn icon-cursor font-xsmall weight-bold fcc-container"
                                @click="
                                  () => {
                                    buyAmount =
                                      maxAmount - buyedAmount > balance.fixed()
                                        ? balance.fixed()
                                        : maxAmount - buyedAmount
                                  }
                                "
                              >
                                Max
                              </button>
                              <span class="font-xsmall weight-semi token-max-amount text-right"
                                >max {{ maxAmount - buyedAmount }} {{ fertilizer.token_price }}</span
                              >
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
                        <div class="receive-amount">
                          <label class="font-xmall">You will receive:</label>
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
                        <div class="btn-container">
                          <Button
                            class="btn-transparent font-medium weight-semi icon-cursor"
                            :disabled="
                              buyAmount <= 0 || buyAmount > maxAmount - buyedAmount || buyAmount > balance.fixed()
                            "
                            @click="
                              () => {
                                if (
                                  !(
                                    buyAmount <= 0 ||
                                    buyAmount > maxAmount - buyedAmount ||
                                    buyAmount > balance.fixed()
                                  )
                                ) {
                                  onClickBuyNow()
                                }
                              }
                            "
                            >Buy Now</Button
                          >
                        </div>
                      </div>
                    </div>
                    <div v-else-if="!isWinner" class="text-center">
                      <div class="fcc-container mb-8">
                        <img class="alert-icon" src="@/assets/icons/alert-white.svg" />
                        <h4 class="weight-bold spacing-medium">
                          Sorry, the whitelist has ended and it looks like you didn't win allocation this time.
                        </h4>
                      </div>
                      <span class="font-medium"
                        >Tired of not winning? You can secure guaranteed allocation for every Fertilizer whitelist by
                        staking CRP below..</span
                      >
                    </div>
                  </div>
                </div>
                <div v-else-if="isWinner && buyedAmount > 0">
                  <div class="project-detail-open">
                    <Countdown
                      class="distribution-start-countdown"
                      title="Distribution starts in:"
                      :value="fertilizer.distribution_start_date"
                      format="DD:HH:mm:ss"
                      @finish="forceLoadDatas()"
                    />
                    <span class="font-medium weight-semi spacing-small"
                      >You will be able to claim your tokens once distribution begins. Be patient!</span
                    >

                    <div class="buy-form">
                      <div class="token-amount fcsb-container">
                        <div class="token-amount-input fcs-container">
                          <CoinIcon class="coin-icon" :mint-address="fertilizer.price_token_mint" />
                          <input class="font-medium weight-bold" type="number" :placeholder="buyedAmount" disabled />
                        </div>
                      </div>
                      <div class="receive-amount">
                        <label class="font-xmall">Bought:</label>

                        <div class="receive-amount-output fcs-container">
                          <img class="coin-icon" :src="fertilizer.logo" />
                          <span class="receive-amount-value font-medium weight-semi spacing-small"
                            >{{ Math.round((buyedAmount * 10000) / fertilizer.ido_info.sale_rate) / 10000 }}
                            {{ fertilizer.token_info.symbol }}</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-else-if="
                  (currentTimestamp > fertilizer.distribution_start_date && !currentStatus.funded && isWinner) ||
                  currentStatus.funded
                "
                class="project-detail-item pdi1"
              >
                <div
                  v-if="
                    currentTimestamp > fertilizer.distribution_start_date &&
                    !currentStatus.funded &&
                    isWinner &&
                    !buyedAmount
                  "
                  class="project-detail-open"
                >
                  <div class="fcc-container">
                    <img class="status-icon" src="@/assets/icons/check-circle-white.svg" />
                    <h4 class="weight-bold spacing-medium">Sorry, you did not participate in the purchase.</h4>
                  </div>
                  <span class="font-medium weight-semi spacing-small">Don't miss the next project.</span>
                </div>
                <div
                  v-else-if="currentTimestamp > fertilizer.distribution_start_date && isWinner && buyedAmount > 0"
                  class="project-detail-open"
                >
                  <span
                    class="font-medium weight-semi spacing-small"
                    style="text-align: center; display: block"
                    v-if="
                      this.currentTier <= 2 && this.fertilizer.mint == 'zebeczgi5fSEtbpfQKVZKCJ3WgYXxjkMUkNNx7fLKAF'
                    "
                    >Airdrop has been proceed !</span
                  ><span
                    class="font-medium weight-semi spacing-small"
                    style="text-align: center; display: block"
                    v-else-if="this.hasClaimed"
                    >You already claim your tokens !</span
                  >
                  <span class="font-medium weight-semi spacing-small" style="text-align: center; display: block" v-else
                    >You can claim your tokens !</span
                  >
                  <div class="buy-form">
                    <div class="token-amount fcsb-container">
                      <div class="token-amount-input fcs-container">
                        <CoinIcon class="coin-icon" :mint-address="fertilizer.price_token_mint" />
                        <input class="font-medium weight-bold" type="number" :value="buyedAmount" disabled />
                      </div>
                    </div>
                    <div class="receive-amount">
                      <label class="font-xmall" v-if="this.hasClaimed">You have claimed:</label>
                      <label class="font-xmall" v-else>You will receive:</label>
                      <div class="receive-amount-output fcs-container">
                        <img class="coin-icon" :src="fertilizer.logo" />
                        <span class="receive-amount-value font-medium weight-semi spacing-small"
                          >{{
                            Math.round(
                              (buyedAmount * (fertilizer.first_liberation / 100) * 10000) /
                                fertilizer.ido_info.sale_rate
                            ) / 10000
                          }}
                          {{ fertilizer.token_info.symbol }}</span
                        >
                      </div>
                    </div>
                    <div
                      class="btn-container"
                      v-if="
                        !this.hasClaimed &&
                        (this.currentTier >= 3 || this.fertilizer.mint != 'zebeczgi5fSEtbpfQKVZKCJ3WgYXxjkMUkNNx7fLKAF')
                      "
                    >
                      <Button
                        class="btn-transparent font-medium weight-semi icon-cursor"
                        @click="
                          () => {
                            onClaimTokens()
                          }
                        "
                        >Claim Now</Button
                      >
                    </div>

                    <div class="receive-amount" style="margin-top: 20px" v-if="fertilizer.first_liberation != 100">
                      <label class="font-xmall">Vested:</label>
                      <div class="receive-amount-output fcs-container">
                        <img class="coin-icon" :src="fertilizer.logo" />
                        <span class="receive-amount-value font-medium weight-semi spacing-small"
                          >{{
                            Math.round(
                              (buyedAmount * (1 - fertilizer.first_liberation / 100) * 10000) /
                                fertilizer.ido_info.sale_rate
                            ) / 10000
                          }}
                          {{ fertilizer.token_info.symbol }}</span
                        >
                      </div>
                    </div>

                    <div v-if="fertilizer.first_liberation != 100 && fertilizer.vested_notice">
                      <br />
                      <span v-html="fertilizer.vested_notice" class="font-medium spacing-small"></span>
                    </div>

                    <div class="btn-container" v-else-if="this.hasClaimed">
                      <NuxtLink :to="fertilizer.swapLink">
                        <Button class="btn-transparent font-medium weight-semi icon-cursor">Trade your Token</Button>
                      </NuxtLink>
                    </div>
                  </div>
                </div>
                <!--
                <div v-else-if="currentStatus.funded" class="text-center">
                  <h4 class="weight-bold spacing-medium">The {{ fertilizer.title }} public sale has finished!</h4>
                  <div class="distribution-details">
                    <span class="font-medium">
                      Sonar Watch raised:
                      <br />
                      <b>500,000 / 500,000 {{ fertilizer.token_price }}</b>
                    </span>
                    <div class="sale-details-group fcc-container">
                      <div class="sale-detail-card text-left">
                        <span class="font-xsmall">ROI (ATH)</span>
                        <br />
                        <span class="font-large weight-bold">8.20x</span>
                      </div>
                      <div class="sale-detail-card text-left">
                        <span class="font-xsmall">ROI (current)</span>
                        <br />
                        <span class="font-large weight-bold">1.07x</span>
                      </div>
                      <div class="sale-detail-card text-left">
                        <span class="font-xsmall">Last Price</span>
                        <br />
                        <span class="font-large weight-bold">0.21 {{ fertilizer.token_price }}</span>
                      </div>
                    </div>
                    <div class="btn-container m-auto"><NuxtLink :to="`/farms/?s=${fertilizer.token_info.symbol}`">
                      <Button class="btn-transparent font-medium weight-semi icon-cursor" style="color:#fff">Start Farming</Button>
                      </NuxtLink>
                    </div>
                  </div>
                </div>
                -->
              </div>
            </div>
            <!-- v-if="currentTier < 5 && currentTimestamp < fertilizer.whitelist_end_date" -->
            <div class="project-detail-static stake fnsb-container">
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
  getLaunchpad,
  getProjectFormatted,
  getUserDatas,
  subscribeToWhitelist,
  isSubscribed,
  buyTokens,
  buyTokensFromSOL,
  claimTokens
} from '@/utils/crp-launchpad'
import { TOKENS, NATIVE_SOL, getTokenByMintAddress } from '@/utils/tokens'
import moment from 'moment'
import { PublicKey } from '@solana/web3.js'
import { get } from 'lodash-es'
const Countdown = Statistic.Countdown
const Step = Steps.Step
const countries = require('i18n-iso-countries')
// 1643500800000

export default Vue.extend({
  async asyncData({ params, redirect }) {
    //const projects = await fetch('https://api.cropper.finance/fertilizer/').then((res) => res.json())
    const projects = await fetch('https://api.cropper.finance/fertilizer/').then((res) => res.json())

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
      firstload: false as boolean,
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
        pool_size: 5000 as any,
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
        max_allocation: {} as any
      },
      balance: null as any,
      projectStatus: {
        preparation: 'Preparation',
        whitelist: 'Whitelist Open',
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
      registeredSCDatas: null as any,
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
      lottery_done: 0,
      isWinner: false as boolean
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
        getLaunchpad()
        this.$accessor.wallet.getTokenAccounts()
        this.loadDatas()
      },
      deep: true
    },
    'wallet.connected': {
      handler(connected: any) {
        this.currentHash = ''
        setAnchorProvider(this.$web3, this.$wallet)
        getLaunchpad()
        this.autoRefreshTime = 5
        this.$accessor.wallet.getTokenAccounts()
        this.loadDatas()
      },
      deep: true
    }
  },

  mounted() {
    setAnchorProvider(this.$web3, this.$wallet)
    getLaunchpad()

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

    async onClaimTokens() {
      const key = getUnixTs().toString()
      this.processing = true

      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

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

      await this.delay(1500)
      this.contextualizeUser()
    },

    async onClickBuyNow() {
      const key = getUnixTs().toString()
      this.processing = true

      const priceTokenAccount = await get(
        this.wallet.tokenAccounts,
        `${this.fertilizer.price_token_mint}.tokenAccountAddress`
      )

      const decimals = this.spTOKENS[this.fertilizer.price_token_mint].decimals

      let amount = this.buyAmount > this.maxAmount ? this.maxAmount : this.buyAmount
      let initAmount = amount

      amount = Math.round(amount * Math.pow(10, decimals))

      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      if (
        this.fertilizer.price_token_mint == 'So11111111111111111111111111111111111111112' ||
        this.fertilizer.price_token_mint == '11111111111111111111111111111111'
      ) {
        await buyTokensFromSOL(this.$web3, this.$wallet, new PublicKey(this.fertilizer.mint), amount, this.currentHash)
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
          })
      } else {
        await buyTokens(
          this.$web3,
          this.$wallet,
          new PublicKey(this.fertilizer.mint),
          new PublicKey(priceTokenAccount),
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
          })
      }

      await this.delay(1500)
      this.contextualizeUser()
    },

    async initSubscribe() {
      const key = getUnixTs().toString()
      this.processing = true
      this.subscribeShow = false
      this.subscribeLoading = true

      await subscribeToWhitelist(this.$web3, this.$wallet, new PublicKey(this.fertilizer.mint))
        .then(async (txid: string) => {
          let txStatus = ''

          let totalDelayTime = 0

          while (txStatus != 'finalized' && totalDelayTime < 30000 && !this.currentStatus.subscribe) {
            let delayTime = 750
            //@ts-ignore
            await this.delay(delayTime)
            totalDelayTime += delayTime

            // @ts-ignore
            const resp = await this.$web3._rpcRequest('getSignatureStatuses', [[txid]])

            if (resp && resp.result && resp.result.value && resp.result.value[0]) {
              txStatus = resp.result.value[0].confirmationStatus
            }
          }

          if (!this.currentStatus.subscribe) {
            await this.contextualizeUser()
          }

          this.subscribeLoading = false
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
          const description = `Subscription`
          this.$accessor.transaction.sub({ txid, description })
          this.autoRefreshTime = 5
          this.processing = false
          this.contextualizeUser()
        })
        .catch((error: Error) => {
          this.$notify.error({
            key,
            message: 'Subscription failed',
            description: error.message
          })
          this.processing = false
          this.subscribeLoading = false
        })
        .finally(() => {})
    },

    async synchronizeUser(datas: any) {
      let body = {
        spl: this.wallet.address,
        mint: this.fertilizer.mint,
        hash: datas?.hashStr
      }

      if (this.referal) {
        //@ts-ignore
        body.referer = this.referal
      }

      let requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
      let res = await fetch('https://flow.cropper.finance/registers/', requestOptions)

      this.autoRefreshTime = 5

      return res
    },

    async synchronizeUserTier() {
      let registeredSCDatas = await getUserDatas(this.$wallet, new PublicKey(this.fertilizer.mint))

      let requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spl: this.wallet.address,
          hash: registeredSCDatas?.hashStr
        })
      }
      await fetch('https://flow.cropper.finance/registers/', requestOptions)
    },

    async contextualizeUserFromBDD(isReload: any) {
      let registeredSCDatas = this.registeredSCDatas
      let responseData
      try {
        responseData = await fetch(
          'https://flow.cropper.finance/registers/' + this.wallet.address + '/' + this.fertilizer.mint + '/'
        ).then((res) => res.json())
      } catch {
        this.currentStatus.subscribe = false
        let reply = await isSubscribed(this.$wallet, new PublicKey(this.fertilizer.mint))

        if (reply && this.currentStep == 1) {
          await this.synchronizeUser(registeredSCDatas)
        }
      } finally {
        if (responseData.message) {
          this.currentStatus.subscribe = false

          let reply = await isSubscribed(this.$wallet, new PublicKey(this.fertilizer.mint))

          if (reply && this.currentStep == 1) {
            await this.synchronizeUser(registeredSCDatas)
          }
        } else {
          this.currentStatus.subscribe = true
          this.social_tickets = responseData.tickets ? (responseData.tickets > 5 ? 5 : responseData.tickets) : 0
          this.socialTicket.telegram = 1
          if (responseData.tg_a) {
            this.socialTicket.telegram++
          }
          if (responseData.tg_b) {
            this.socialTicket.telegram++
          }

          this.socialTicket.twitter = 0
          if (responseData.twitter_a) {
            this.socialTicket.twitter++
          }
          if (responseData.twitter_b) {
            this.socialTicket.twitter++
          }
          if (responseData.retweet) {
            this.socialTicket.twitter++
          }

          this.currentStatus.win = responseData.win && responseData.hash

          this.currentHash = responseData.hash

          this.currentTier = responseData.tier_reference
          if (registeredSCDatas.tier != this.currentTier && this.currentStep == 1 && !isReload) {
            await this.synchronizeUserTier()
            this.userLoading = 0
            this.contextualizeUser(1)
            return
          }

          if (this.social_tickets >= 5 || this.currentTier >= 3) {
            this.autoRefreshTime = 60
          }

          this.referral_tickets = responseData.referal_ticket ? responseData.referal_ticket : 0
          this.total_tickets = this.social_tickets + this.referral_tickets

          let baseTier = this.currentTier

          if (baseTier <= 2) {
            baseTier = 0
          }

          if (this.currentTier >= 3 && !this.istgok && this.KYCStatus.step < 3) {
            try {
              let responseData = await fetch('https://flow.cropper.finance/notif/tg/' + this.wallet.address).then(
                (res) => res.json()
              )
              let tg = responseData[0]
              this.telegramnotiflink = 'https://t.me/cropper_notif_bot?start=' + tg.secretkey
              if (tg.active == 1) {
                this.istgok = true
              }
            } catch {
              // dummy data
            }
          }

          const decimals = this.spTOKENS[this.fertilizer.price_token_mint].decimals

          this.maxAmount = this.fertilizer.max_allocation[baseTier] / Math.pow(10, decimals)

          if (registeredSCDatas) {
            this.buyedAmount = registeredSCDatas.paidAmount / Math.pow(10, decimals)
          }

          if (this.currentStatus.subscribe && this.currentTier >= 3) {
            this.isWinner = true
          }

          if (responseData.win == 1) {
            this.isWinner = true
          }
        }
      }
    },

    async contextualizeUser(isReload = 0) {
      if (!this.wallet.connected) {
        this.hasClaimed = 0
        this.currentStatus.subscribe = false
        this.KYCStatus.step = 1
        this.KYCStatus.verification = 0
        this.KYCStatus.userVerified = false
        this.KYCStatus.sessionID = ''
        this.isWinner = false
        this.istgok = false

        this.firstload = true
        return
      }

      //@ts-ignore
      this.affiliatedLink = 'https://cropper.finance/launchpad/' + this.project.slug + '/?r=' + this.wallet.address
      this.twitterShareLink = `http://twitter.com/share?text=Sign up for ${this.fertilizer.title} on Cropper. Participate in the IDO of an emerging project.  Become an investor. Let's subscribe!&url=${this.affiliatedLink}`
      this.telegramShareLink = `https://telegram.me/share/url?url=${this.affiliatedLink}&text=Sign up for ${this.fertilizer.title} on Cropper. Participate in the IDO of an emerging project. Become an investor. Let's subscribe!`

      this.userLoading = 1

      let responseData

      let registeredSCDatas = await getUserDatas(this.$wallet, new PublicKey(this.fertilizer.mint))
      if (!registeredSCDatas) {
        this.firstload = true
        return
      }

      if (registeredSCDatas && registeredSCDatas.claimedAmount && registeredSCDatas.claimedAmount.toNumber() > 0) {
        this.hasClaimed = 1
        this.autoRefreshTime = 60
      }

      if (
        this.fertilizer.price_token_mint == 'So11111111111111111111111111111111111111112' ||
        this.fertilizer.price_token_mint == '11111111111111111111111111111111'
      ) {
        this.balance = this.wallet.tokenAccounts['11111111111111111111111111111111'].balance
      } else {
        this.balance = get(this.wallet.tokenAccounts, `${this.fertilizer.price_token_mint}.balance`)
      }

      this.registeredSCDatas = registeredSCDatas

      await this.contextualizeUserFromBDD(isReload)

      if (window.localStorage['CYK' + this.wallet.address + 'set']) {
        this.KYCStatus.verification = 2
        this.KYCStatus.step = 3
        this.KYCStatus.userVerified = true
      } else if (
        this.currentTimestamp < this.fertilizer.sales_end_date &&
        this.currentTimestamp > this.fertilizer.whitelist_start_date &&
        this.KYCStatus.step < 3 &&
        this.isWinner
      ) {
        responseData
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

      this.firstload = true

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

        let scValues = await getProjectFormatted(this.fertilizer.mint)
        let token = getTokenByMintAddress(scValues.price_token_mint)

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
          
          if(item.closed == 1){
            const descEl4 = document.querySelector('head link[rel="canonical"]')
            //@ts-ignore
            descEl4?.setAttribute('href', 'https://cropper.finance/token/' + token.symbol + '/')
          } else {
            const descEl4 = document.querySelector('head link[rel="canonical"]')
            descEl4?.setAttribute('href', 'https://cropper.finance/launchpad/' + item.slug + '/')
          }

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


        if (!scValues || !item.active) {
          this.$router.push({
            path: '/launchpad/'
          })
        }

        this.fertilizer.first_liberation = scValues.first_liberation / 100

        const decimals = this.spTOKENS[scValues.price_token_mint].decimals

        scValues.token_price =
          (scValues as any).token_price / (Math.pow(10, 9 - this.fertilizer.token_decimal) * Math.pow(10, decimals))

        this.fertilizer.max_allocation = scValues.max_allocation
        this.fertilizer.distribution_end_date = (moment(scValues.date_distribution).unix() + 86400 * 2) * 1000
        this.fertilizer.distribution_start_date = moment(scValues.date_distribution).unix() * 1000
        this.fertilizer.date_preparation = moment(scValues.date_preparation).unix() * 1000
        this.fertilizer.sales_end_date = moment(scValues.date_sale_end).unix() * 1000
        this.fertilizer.sales_start_date = moment(scValues.date_sale_start).unix() * 1000
        this.fertilizer.whitelist_end_date = moment(scValues.date_whitelist_end).unix() * 1000
        this.fertilizer.whitelist_start_date = moment(scValues.date_whitelist_start).unix() * 1000
        this.fertilizer.ido_info.sale_rate = scValues.token_price
        this.fertilizer.ido_info.hard_cap = scValues.pool_size
        this.fertilizer.ido_info.sale_type = item.type

        this.checkCurrentStep()

        if (scValues.token_price != undefined && scValues.token_price > 0) {
          this.fertilizer.pool_size = Math.round((scValues.pool_size / scValues.token_price) * 100) / 100
        }

        token = getTokenByMintAddress(scValues.price_token_mint)

        if (token) {
          this.fertilizer.price_token = token.symbol
          this.fertilizer.price_token_mint = scValues.price_token_mint
        }

        token = getTokenByMintAddress(this.fertilizer.mint)
        if (token) {
          this.fertilizer.token_info.symbol = token.symbol
        }

        if (this.fertilizer.mint == 'zebeczgi5fSEtbpfQKVZKCJ3WgYXxjkMUkNNx7fLKAF') {
          this.fertilizer.token_info.symbol = 'ZBC'
        }

        this.fertilizer.swapLink = '/swap/?from=' + scValues.price_token_mint + '&to=' + this.fertilizer.mint

        let content = '' as any

        try {
          content = await fetch('https://api.cropper.finance/fertilizer/' + this.fertilizer.mint + '/').then((res) =>
            res.json()
          )
        } catch {
          this.fertilizer.longContent = ''
        } finally {
          this.fertilizer.longContent = content.content
        }

        let registerdList
        try {
          registerdList = await fetch('https://flow.cropper.finance/registers/').then((res) => res.json())
        } catch {
          this.fertilizer.subscribers = ''
        } finally {
          let sub = registerdList.find((items: any) => items.mint === this.fertilizer.mint)
          if (sub) {
            this.fertilizer.subscribers = sub.ct
          }
        }
      }

      const query = new URLSearchParams(window.location.search)
      if(query.get('dev')){

        if(query.get('winner')){
          this.isWinner = true
        } else {
          this.isWinner = false
        }
        
        if(query.get('subscribe')){
          this.currentStatus.subscribe = true
        } else {
          this.currentStatus.subscribe = false
        }
        
        if(query.get('kyc')){
          this.KYCStatus.step = 3
          this.KYCStatus.verification = 1
          this.KYCStatus.userVerified = true
          this.KYCStatus.sessionID = ''
        } else {
          this.KYCStatus.step = 1
          this.KYCStatus.verification = 0
          this.KYCStatus.userVerified = false
          this.KYCStatus.sessionID = ''
        }

        if(query.get('status') && query.get('status') == 'whitelist'){
          this.fertilizer.distribution_end_date = getUnixTs() + (86400 * 1000)
          this.fertilizer.distribution_start_date = getUnixTs() + (86400 * 1000)
          this.fertilizer.date_preparation = getUnixTs() - (86400 * 1000)
          this.fertilizer.sales_end_date = getUnixTs() + (86400 * 1000)
          this.fertilizer.sales_start_date = getUnixTs() + (86400 * 1000)
          this.fertilizer.whitelist_end_date = getUnixTs() + (86400 * 1000)
          this.fertilizer.whitelist_start_date = getUnixTs() - 3600 * 1000
        }

        if(query.get('status') && query.get('status') == 'sales'){
          this.fertilizer.distribution_end_date = getUnixTs() + (86400 * 1000)
          this.fertilizer.distribution_start_date = getUnixTs() + (86400 * 1000)
          this.fertilizer.date_preparation = getUnixTs() - (86400 * 1000)
          this.fertilizer.sales_end_date = getUnixTs() + (86400 * 1000)
          this.fertilizer.sales_start_date = getUnixTs() - 3600 * 1000
          this.fertilizer.whitelist_end_date = getUnixTs() - (86400 * 1000)
          this.fertilizer.whitelist_start_date = getUnixTs() - (86400 * 1000)
          this.buyedAmount = 1;
          this.maxAmount = 100
        }

        if(query.get('status') && query.get('status') == 'preparation'){
          this.fertilizer.distribution_end_date = getUnixTs() + (86400 * 1000)
          this.fertilizer.distribution_start_date = getUnixTs() + (86400 * 1000)
          this.fertilizer.date_preparation = getUnixTs() - 3600 * 1000
          this.fertilizer.sales_end_date = getUnixTs() + (86400 * 1000)
          this.fertilizer.sales_start_date = getUnixTs() + (86400 * 1000)
          this.fertilizer.whitelist_end_date = getUnixTs() + (86400 * 1000)
          this.fertilizer.whitelist_start_date = getUnixTs() + (86400 * 1000)
        }

        if(query.get('status') && query.get('status') == 'distribution'){
          this.fertilizer.distribution_end_date = getUnixTs() + (86400 * 1000)
          this.fertilizer.distribution_start_date = getUnixTs() - 3600 * 1000
          this.fertilizer.date_preparation = getUnixTs() - (86400 * 1000)
          this.fertilizer.sales_end_date = getUnixTs() - (86400 * 1000)
          this.fertilizer.sales_start_date = getUnixTs() - (86400 * 1000)
          this.fertilizer.whitelist_end_date = getUnixTs() - (86400 * 1000)
          this.fertilizer.whitelist_start_date = getUnixTs() - (86400 * 1000)
          this.buyedAmount = 1;
          this.maxAmount = 100
        }

        this.currentStep = 0
        this.checkCurrentStep()
        this.loading = 0
        this.firstload = true
        return;
      } 


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
          padding-top: 52px;

          @media @max-md-tablet {
            width: 100%;
            margin-left: 0;
            margin-top: 16px;
            padding-top: 0;
          }

          .project-detail-condition {
            margin: 32px 0;

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
                }

                .distribution-start-countdown {
                  margin-bottom: 32px;
                }
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
</style>