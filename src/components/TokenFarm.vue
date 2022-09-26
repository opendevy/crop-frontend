<template>
  <div class="farm container">
    <CreateFarmProgram
      v-if="!farmProgramCreated && wallet.connected"
      :isSuperOwner="wallet.address === superOwnerAddress"
      @onCreate="createFarmProgram"
    />

    <StakeModel
      v-if="stakeModalOpening"
      title="Supply & Stake LP"
      :loading="staking"
      :farmInfo="farmInfo"
      :suppling="suppling"
      :labelizedPermission="labelizedPermission"
      @onOk="supplyAndStake"
      @onCancel="cancelStake"
    />

    <StakeErrorModal
      v-if="stakeLPError"
      @onRetry="onRetryStakeLP"
      @onRemove="onRemoveLiquidity"
      @onNothing="onNothing"
    />

    <CoinModal
      v-if="unstakeModalOpening"
      title="Unstake LP"
      :coin="lp"
      :loading="unstaking"
      @onOk="unstakeAndRemove"
      @onCancel="cancelUnstake"
      :lpbreakdown="this.unstakePoolInfo"
      text="You will have to validate 2 operations, Unstake LP & Unstake Liquidity. <br /><br />
      If the pop up for the second operation does not appear, it may have popped up behind your browser. You can check this by minimizing your browser."
    />

    <CoinModalAddReward
      v-if="addRewardModalOpening"
      title="Add Reward"
      :coin="rewardCoin"
      :loading="adding"
      @onOk="addReward"
      @onCancel="cancelAddReward"
    />

    <CoinModalAddReward
      v-if="stakeModalOpeningLP"
      title="Stake LP"
      :coin="lp"
      :coinIcon="false"
      :farmInfo="farmInfo"
      :loading="staking"
      text="<div style='text-align:center'>You now need to <b>stake your LP tokens</b> to start farming</div>"
      @onOk="stake"
      @onCancel="cancelStakeLP"
    />

    <CreateFarm v-if="createFarmModalOpening" @onCancel="cancelCreateFarm" />

    <div class="card">
      <div class="card-body">
        <div v-if="showGuide && userMigrations.length > 0" class="guide-card">
          <div class="guide-content">
            <label class="font-large weight-bold">Migration tool</label>
            <img class="icon-cursor close-icon" src="@/assets/icons/close-circle.svg" @click="hideGuide" />
            <div
              class="guide-detail fcc-container"
              v-for="migrationFarm in userMigrations"
              :key="migrationFarm.oldFarmId"
            >
              <div class="fs-container">
                <img class="note-icon" src="@/assets/icons/status-warning.svg" />
                <span class="font-small weight-semi letter-large">
                  The
                  <label class="highlight"
                    >{{ migrationFarm.farmInfo.lp.coin.symbol }}-{{ migrationFarm.farmInfo.lp.pc.symbol }}</label
                  >
                  farm is ended, you must migrate your LP tokens to continue farming.
                </span>
              </div>
              <Button class="note-btn font-small weight-semi spacing-large" @click="migrateFarm(migrationFarm)"
                >Migrate LP Tokens</Button
              >
            </div>
          </div>
        </div>

        <div class="farm-content">
          <div class="farm-option-bar fce-container">
            <div class="option-filter-group">
              <div
                class="option-filter option-sort fcc-container icon-cursor"
                @click="
                  () => {
                    this.showOptionMenu = !this.showOptionMenu
                  }
                "
              >
                <span class="font-body-medium weight-semi option-filter-sort fcc-container">
                  <label>Sort by:</label>
                  <span class="sort-detail">
                    {{ this.sortMethod === 'liquidity' ? 'Liquidity' : 'APR %' }}
                    {{ this.sortAsc ? '(High > Low)' : '(Low > High)' }}
                    <img
                      class="arrow-icon"
                      :class="showOptionMenu ? 'arrow-up' : 'arrow-down'"
                      src="@/assets/icons/arrow-down-white.svg"
                    />
                  </span>
                </span>
              </div>

              <div class="option-filter option-filter-collapse option-filter-fixed fcc-container icon-cursor">
                <img
                  src="@/assets/icons/filter.svg"
                  @click="
                    () => {
                      this.showOptionMenu = !this.showOptionMenu
                    }
                  "
                />
              </div>

              <div
                v-if="showOptionMenu"
                class="option-collapse-menu collapse-right"
                v-click-outside="
                  () => {
                    this.showOptionMenu = false
                  }
                "
              >
                <div
                  class="option-collapse-item text-center texts weight-bold icon-cursor"
                  :class="sortMethod === 'liquidity' && !sortAsc ? 'active-item' : ''"
                  @click="setSortOption('liquidity', false)"
                >
                  Liquidity (Low > High)
                </div>
                <div
                  class="option-collapse-item text-center texts weight-bold icon-cursor"
                  :class="sortMethod === 'liquidity' && sortAsc ? 'active-item' : ''"
                  @click="setSortOption('liquidity', true)"
                >
                  Liquidity (High > Low)
                </div>
                <div
                  class="option-collapse-item text-center texts weight-bold icon-cursor"
                  :class="sortMethod === 'apr' && !sortAsc ? 'active-item' : ''"
                  @click="setSortOption('apr', false)"
                >
                  APR % (Low > High)
                </div>
                <div
                  class="option-collapse-item text-center texts weight-bold icon-cursor"
                  :class="sortMethod === 'apr' && sortAsc ? 'active-item' : ''"
                  @click="setSortOption('apr', true)"
                >
                  APR % (High > Low)
                </div>
              </div>

              <NuxtLink to="/farms" class="option-filter fcc-container icon-cursor">
                <span class="font-body-medium weight-semi option-filter-sort fcc-container">
                  <label class="icon-cursor">Go to Farms</label>
                  <img class="move-icon" src="@/assets/icons/goto.svg" />
                </span>
              </NuxtLink>
            </div>
          </div>

          <div v-if="farm.initialized && farmLoaded">
            <div class="farm-table isDesktop">
              <Row class="farm-item" v-for="(farm, idx) in showFarms" :key="farm.farmInfo.poolId" :gutter="16">
                <Col class="fcs-container" span="6">
                  <div class="state">
                    <div class="lp-icons">
                      <div class="lp-icons-group">
                        <div class="icons">
                          <CoinIcon :mint-address="farm.farmInfo.lp.coin.mintAddress" />
                          <span class="font-medium weight-semi">{{ farm.farmInfo.lp.coin.symbol }} - </span>
                          <CoinIcon :mint-address="farm.farmInfo.lp.pc.mintAddress" />
                          <span class="font-medium weight-semi">{{ farm.farmInfo.lp.pc.symbol }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="farm-infos">
                      <div class="farm-info-group font-xsmall">
                        <div class="farm-info-img">
                          <img src="@/assets/icons/sandglass.svg" />
                        </div>
                        from
                        {{ new Date(farm.farmInfo.poolInfo.start_timestamp * 1e3).toLocaleDateString('en-US') }}
                        to
                        {{ new Date(farm.farmInfo.poolInfo.end_timestamp * 1e3).toLocaleDateString('en-US') }}
                      </div>
                      <div class="farm-info-group font-xsmall">
                        <div class="farm-info-img">
                          <img src="@/assets/icons/reward.svg" />
                        </div>
                        Remaining rewards
                        {{
                          Math.round(
                            new TokenAmount(farm.farmInfo.reward.balance.wei, farm.farmInfo.reward.decimals).toEther() *
                              1000
                          ) / 1000
                        }}
                        {{ farm.farmInfo.reward.symbol }}
                      </div>
                    </div>
                  </div>
                </Col>

                <Col class="fce-container" span="2">
                  <div class="state">
                    <div class="farm-labels">
                      <div v-if="farm.labelized" class="label labelized weight-semi">Labelized</div>
                      <div v-else class="label permissionless weight-semi">Permissionless</div>

                      <div v-if="currentTimestamp > farm.farmInfo.poolInfo.end_timestamp" class="label ended">
                        Ended
                      </div>
                      <div
                        v-if="currentTimestamp < farm.farmInfo.poolInfo.start_timestamp * 1 + 86400 * 7"
                        class="label new"
                      >
                        New
                      </div>
                    </div>
                  </div>
                </Col>

                <Col class="fce-container" span="3">
                  <div class="state">
                    <div class="title font-small weight-semi spacing-large">Total Deposited</div>
                    <div
                      v-if="
                        farm.farmInfo.poolInfo.start_timestamp > currentTimestamp ||
                        currentTimestamp > farm.farmInfo.poolInfo.end_timestamp
                      "
                      class="value font-medium weight-semi spacing-small"
                    >
                      -
                    </div>
                    <div v-else class="value font-medium weight-semi spacing-small">
                      ${{
                        Math.round(farm.farmInfo.liquidityUsdValue)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }}
                    </div>
                  </div>
                </Col>

                <Col class="fce-container" span="3">
                  <div class="state">
                    <div class="title font-small weight-semi spacing-large">
                      Total APR
                      <Tooltip
                        placement="bottomLeft"
                        v-if="
                          !(
                            farm.farmInfo.poolInfo.start_timestamp > currentTimestamp ||
                            currentTimestamp > farm.farmInfo.poolInfo.end_timestamp
                          )
                        "
                      >
                        <template slot="title">
                          <div>
                            <div class="tooltip-line">
                              Fees <span>{{ farm.farmInfo.apr_details.apy }}%</span>
                            </div>
                            <hr />
                            <div class="tooltip-line">
                              Rewards <span>{{ farm.farmInfo.apr_details.apr }}%</span>
                            </div>
                          </div>
                        </template>
                        <div class="info-icon">
                          <img src="@/assets/icons/info.svg" />
                        </div>
                      </Tooltip>
                    </div>
                    <div
                      v-if="
                        farm.farmInfo.poolInfo.start_timestamp > currentTimestamp ||
                        currentTimestamp > farm.farmInfo.poolInfo.end_timestamp
                      "
                      class="value font-medium weight-semi spacing-small"
                    >
                      -
                    </div>
                    <div v-else class="value font-medium weight-semi spacing-small">
                      <img v-if="farm.farmInfo.apr > 300" src="@/assets/icons/fire.svg" />
                      <img v-if="farm.farmInfo.apr > 1000" src="@/assets/icons/fire.svg" />
                      {{ Math.round(farm.farmInfo.apr * 100) / 100 }}%
                    </div>
                  </div>
                </Col>

                <Col class="fce-container" span="4">
                  <div class="state">
                    <div class="title font-small weight-semi spacing-large">Pending Rewards</div>
                    <div
                      v-if="farm.farmInfo.poolInfo.start_timestamp > currentTimestamp"
                      class="value font-medium weight-semi spacing-small"
                    >
                      -
                    </div>
                    <div v-else class="value font-medium weight-semi spacing-small">
                      {{ ((
                        !wallet.connected || 
                        (Math.round(farm.userInfo.pendingReward.format().replace(/,/g, '') * 100000) / 100000) &lt; 0 
                        ) ? farm.farmInfo.reward.symbol + ' ' + 0 : farm.farmInfo.reward.symbol + ' ' + (Math.round(farm.userInfo.pendingReward.format().replace(/,/g, '') * 100000) / 100000)) }}
                    </div>
                  </div>
                </Col>

                <Col class="fce-container" span="3">
                  <div class="state">
                    <div class="title font-small weight-semi spacing-large">
                      Value Deposited
                      <Tooltip
                        placement="bottomLeft"
                        v-if="
                          !(farm.farmInfo.poolInfo.start_timestamp > currentTimestamp) &&
                          farm.userInfo.depositBalance.format() > 0
                        "
                      >
                        <template slot="title">
                          <div>
                            <div class="tooltip-line">
                              LP Tokens
                              <span>{{ farm.userInfo.depositFormat.replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}</span>
                            </div>
                            <hr />
                            <div class="tooltip-line">
                              {{ farm.farmInfo.lp.coin.symbol }}
                              <span>
                                {{ farm.userInfo.depositCoin.replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}
                              </span>
                            </div>
                            <hr />
                            <div class="tooltip-line">
                              {{ farm.farmInfo.lp.pc.symbol }}
                              <span>
                                {{ farm.userInfo.depositPc.replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}
                              </span>
                            </div>
                          </div>
                        </template>
                        <div class="info-icon">
                          <img src="@/assets/icons/info.svg" />
                        </div>
                      </Tooltip>
                    </div>
                    <div
                      v-if="farm.farmInfo.poolInfo.start_timestamp > currentTimestamp"
                      class="value font-medium weight-semi spacing-small"
                    >
                      -
                    </div>
                    <div v-else class="value font-medium weight-semi spacing-small">
                      {{
                        !wallet.connected
                          ? 0
                          : farm.userInfo.depositBalanceUSD
                          ? '$ ' + farm.userInfo.depositBalanceUSD
                          : farm.userInfo.depositBalance.format()
                      }}
                    </div>
                  </div>
                </Col>

                <Col class="state fcsb-container" span="3">
                  <div class="farm-btn-group">
                    <div
                      class="btn-container"
                      v-if="
                        currentTimestamp < farm.farmInfo.poolInfo.end_timestamp &&
                        farm.farmInfo.poolInfo.start_timestamp < currentTimestamp
                      "
                    >
                      <Button
                        v-if="wallet.connected"
                        class="btn-transparent font-small weight-bold"
                        id="dep"
                        :disabled="
                          !wallet.connected ||
                          !farm.farmInfo.poolInfo.is_allowed ||
                          farm.farmInfo.poolInfo.end_timestamp < currentTimestamp ||
                          farm.farmInfo.poolInfo.start_timestamp > currentTimestamp
                        "
                        @click="openStakeModal(farm.labelized, farm.farmInfo, farm.farmInfo.lp)"
                      >
                        {{
                          !farm.farmInfo.poolInfo.is_allowed
                            ? 'Not Allowed'
                            : currentTimestamp > farm.farmInfo.poolInfo.end_timestamp
                            ? 'Ended'
                            : farm.farmInfo.poolInfo.start_timestamp > currentTimestamp
                            ? 'Unstarted'
                            : 'Deposit'
                        }}
                      </Button>

                      <Button v-else class="btn-transparent font-small weight-bold" @click="$accessor.wallet.openModal">
                        {{
                          !farm.farmInfo.poolInfo.is_allowed
                            ? 'Not Allowed'
                            : currentTimestamp > farm.farmInfo.poolInfo.end_timestamp
                            ? 'Ended'
                            : farm.farmInfo.poolInfo.start_timestamp > currentTimestamp
                            ? 'Unstarted'
                            : 'Deposit'
                        }}
                      </Button>
                    </div>

                    <div
                      class="btn-container"
                      v-if="
                        currentTimestamp < farm.farmInfo.poolInfo.end_timestamp &&
                        farm.farmInfo.poolInfo.start_timestamp < currentTimestamp &&
                        farm.farmInfo.currentLPtokens > 0.001
                      "
                    >
                      <Button
                        class="btn-transparent font-small weight-bold"
                        :disabled="
                          !wallet.connected ||
                          !farm.farmInfo.poolInfo.is_allowed ||
                          farm.farmInfo.poolInfo.end_timestamp < currentTimestamp ||
                          farm.farmInfo.poolInfo.start_timestamp > currentTimestamp
                        "
                        @click="openStakeModalLP(farm.farmInfo, farm.farmInfo.lp)"
                      >
                        {{
                          !farm.farmInfo.poolInfo.is_allowed
                            ? 'Not Allowed'
                            : currentTimestamp > farm.farmInfo.poolInfo.end_timestamp
                            ? 'Ended'
                            : farm.farmInfo.poolInfo.start_timestamp > currentTimestamp
                            ? 'Unstarted'
                            : 'Deposit LP'
                        }}
                      </Button>
                    </div>

                    <div class="btn-container">
                      <!-- Harvest & Withdraw -->
                      <Button
                        v-if="farm.farmInfo.poolInfo.end_timestamp < currentTimestamp"
                        class="btn-primary font-small weight-bold"
                        :disabled="!wallet.connected || farm.userInfo.depositBalance.isNullOrZero()"
                        @click.stop="openUnstakeModal(farm.farmInfo, farm.farmInfo.lp, farm.userInfo.depositBalance)"
                      >
                        Harvest
                      </Button>

                      <Button
                        v-else
                        class="btn-primary font-small weight-bold"
                        :disabled="!wallet.connected || harvesting[idx] || farm.userInfo.pendingReward.isNullOrZero()"
                        :loading="harvesting[idx]"
                        @click="harvest(farm.farmInfo, idx)"
                      >
                        Harvest
                      </Button>
                    </div>
                  </div>
                  <div class="show-more icon-cursor text-center" @click="showMore(idx)">
                    <img src="@/assets/icons/dot3.svg" />
                    <div
                      v-if="showMoreMenu[idx]"
                      class="option-collapse-menu collapse-right"
                      v-click-outside="hideMore"
                    >
                      <div
                        v-if="!(farm.farmInfo.poolInfo.end_timestamp < currentTimestamp)"
                        class="option-collapse-item text-center font-medium weight-semi icon-cursor"
                      >
                        <a class="social-link fcc-container" :href="farm.farmInfo.twitterShare" target="_blank">
                          Share
                          <img class="social-icon" src="@/assets/icons/share.svg" />
                        </a>
                      </div>
                      <div class="option-collapse-item text-center font-medium weight-semi icon-cursor">
                        <a class="social-link fcc-container" :href="farm.farmInfo.twitterLink" target="_blank">
                          Twitter
                          <img class="social-icon" src="@/assets/icons/twitter-white.svg" />
                        </a>
                      </div>
                      <div class="option-collapse-item text-center font-medium weight-semi icon-cursor">
                        <a
                          :disabled="!wallet.connected || farm.userInfo.depositBalance.isNullOrZero()"
                          @click.stop="openUnstakeModal(farm.farmInfo, farm.farmInfo.lp, farm.userInfo.depositBalance)"
                        >
                          Withdraw
                        </a>
                      </div>
                      <div
                        v-if="farm.farmInfo.poolId === removeRewardsFarmAddress"
                        class="option-collapse-item text-center font-medium weight-semi icon-cursor"
                      >
                        <Button size="large" ghost :disabled="!wallet.connected" @click.stop="removeRewards(farm)">
                          Remove Rewards
                        </Button>
                      </div>
                      <div
                        v-if="
                          farm.farmInfo.poolInfo.owner.toBase58() == wallet.address &&
                          farm.farmInfo.poolInfo.is_allowed &&
                          currentTimestamp < farm.farmInfo.poolInfo.end_timestamp
                        "
                        class="option-collapse-item text-center font-medium weight-semi icon-cursor"
                      >
                        <a @click="openAddRewardModal(farm)"> Add Rewards </a>
                      </div>
                      <div
                        v-if="
                          farm.farmInfo.poolInfo.owner.toBase58() == wallet.address &&
                          !farm.farmInfo.poolInfo.is_allowed &&
                          currentTimestamp < farm.farmInfo.poolInfo.end_timestamp
                        "
                        class="option-collapse-item text-center font-medium weight-semi icon-cursor"
                      >
                        <a @click="payFarmFee(farm)"> Pay Farm Fees </a>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            <div class="farm-table isTablet">
              <Collapse v-model="showCollapse" class="farm-collapse-tablet" accordion>
                <CollapsePanel v-for="(farm, idx) in showFarms" v-show="true" :key="farm.farmInfo.poolId">
                  <Row slot="header" class="farm-collapse-tablet-head">
                    <Col class="farm-collapse-item fcc-container" span="24">
                      <Col class="state text-center" span="8">
                        <div class="lp-icons">
                          <div class="lp-icons-group">
                            <div class="icons">
                              <CoinIcon :mint-address="farm.farmInfo.lp.coin.mintAddress" />
                              <span class="font-medium weight-semi">{{ farm.farmInfo.lp.coin.symbol }} - </span>
                              <CoinIcon :mint-address="farm.farmInfo.lp.pc.mintAddress" />
                              <span class="font-medium weight-semi">{{ farm.farmInfo.lp.pc.symbol }}</span>
                            </div>
                          </div>
                        </div>
                      </Col>

                      <Col class="state text-center" span="2">
                        <div class="farm-labels">
                          <div v-if="farm.labelized" class="label labelized weight-semi">Labelized</div>
                          <div v-else class="label permissionless weight-semi">Permissionless</div>

                          <div v-if="currentTimestamp > farm.farmInfo.poolInfo.end_timestamp" class="label ended">
                            Ended
                          </div>
                          <div
                            v-if="currentTimestamp < farm.farmInfo.poolInfo.start_timestamp * 1 + 86400 * 7"
                            class="label new"
                          >
                            New
                          </div>
                        </div>
                      </Col>

                      <Col class="state text-center" span="5">
                        <div class="title font-small weight-semi spacing-large">Total Deposited</div>
                        <div
                          v-if="
                            farm.farmInfo.poolInfo.start_timestamp > currentTimestamp ||
                            currentTimestamp > farm.farmInfo.poolInfo.end_timestamp
                          "
                          class="value font-medium weight-semi spacing-small"
                        >
                          -
                        </div>
                        <div v-else class="value font-medium weight-semi spacing-small">
                          ${{
                            Math.round(farm.farmInfo.liquidityUsdValue)
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          }}
                        </div>
                      </Col>

                      <Col class="state text-center" span="4">
                        <div class="title font-small weight-semi spacing-large">
                          Total APR
                          <Tooltip
                            placement="bottomLeft"
                            v-if="
                              !(
                                farm.farmInfo.poolInfo.start_timestamp > currentTimestamp ||
                                currentTimestamp > farm.farmInfo.poolInfo.end_timestamp
                              )
                            "
                          >
                            <template slot="title">
                              <div>
                                <div class="tooltip-line">
                                  Fees <span>{{ farm.farmInfo.apr_details.apy }}%</span>
                                </div>
                                <hr />
                                <div class="tooltip-line">
                                  Rewards <span>{{ farm.farmInfo.apr_details.apr }}%</span>
                                </div>
                              </div>
                            </template>
                            <div class="info-icon">
                              <img src="@/assets/icons/info.svg" />
                            </div>
                          </Tooltip>
                        </div>
                        <div
                          v-if="
                            farm.farmInfo.poolInfo.start_timestamp > currentTimestamp ||
                            currentTimestamp > farm.farmInfo.poolInfo.end_timestamp
                          "
                          class="value font-medium weight-semi spacing-small"
                        >
                          -
                        </div>
                        <div v-else class="value font-medium weight-semi spacing-small">
                          <img v-if="farm.farmInfo.apr > 300" src="@/assets/icons/fire.svg" />
                          <img v-if="farm.farmInfo.apr > 1000" src="@/assets/icons/fire.svg" />
                          {{ Math.round(farm.farmInfo.apr * 100) / 100 }}%
                        </div>
                      </Col>

                      <Col class="state text-center" span="5">
                        <div class="title font-small weight-semi spacing-large">Pending Reward</div>
                        <div
                          v-if="farm.farmInfo.poolInfo.start_timestamp > currentTimestamp"
                          class="value font-medium weight-semi spacing-small"
                        >
                          -
                        </div>
                        <div v-else class="value font-medium weight-semi spacing-small">
                          {{ (!wallet.connected || (Math.round(farm.userInfo.pendingReward.format().replace(/,/g, '') * 100000) / 100000) &lt; 0) ? farm.farmInfo.reward.symbol + ' ' + 0 : farm.farmInfo.reward.symbol + ' ' + (Math.round(farm.userInfo.pendingReward.format().replace(/,/g, '') * 100000) / 100000) }}
                        </div>
                      </Col>
                    </Col>

                    <Col
                      v-if="farm.farmInfo.poolId != showCollapse"
                      class="farm-collapse-item btn-show-collapse"
                      span="24"
                    >
                      <img src="@/assets/icons/arrow-down-blue.svg" />
                    </Col>
                  </Row>

                  <Row class="farm-collapse-content">
                    <Col class="farm-collapse-item" span="24">
                      <Col class="state" span="14">
                        <div class="farm-infos">
                          <div class="farm-info-group font-xsmall">
                            <div class="farm-info-img">
                              <img src="@/assets/icons/sandglass.svg" />
                            </div>
                            from
                            {{ new Date(farm.farmInfo.poolInfo.start_timestamp * 1e3).toLocaleDateString('en-US') }}
                            to
                            {{ new Date(farm.farmInfo.poolInfo.end_timestamp * 1e3).toLocaleDateString('en-US') }}
                          </div>

                          <div>
                            <div class="farm-info-group font-xsmall">
                              <div class="farm-info-img">
                                <img src="@/assets/icons/reward.svg" />
                              </div>
                              Remaining rewards
                              {{
                                Math.round(
                                  new TokenAmount(
                                    farm.farmInfo.reward.balance.wei,
                                    farm.farmInfo.reward.decimals
                                  ).toEther() * 1000
                                ) / 1000
                              }}
                              {{ farm.farmInfo.reward.symbol }}
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col class="state" span="10">
                        <div class="title font-small weight-semi spacing-large fce-container">Value Deposited</div>
                        <div
                          v-if="farm.farmInfo.poolInfo.start_timestamp > currentTimestamp"
                          class="value font-medium weight-semi spacing-small text-right"
                        >
                          -
                        </div>
                        <div v-else class="value font-medium weight-semi spacing-small text-right">
                          {{
                            !wallet.connected
                              ? 0
                              : farm.userInfo.depositBalanceUSD
                              ? '$ ' + farm.userInfo.depositBalanceUSD
                              : farm.userInfo.depositBalance.format()
                          }}
                        </div>
                      </Col>
                    </Col>

                    <Col class="farm-collapse-item fcsb-container" span="24">
                      <div class="fcc-container">
                        <a
                          v-if="!(farm.farmInfo.poolInfo.end_timestamp < currentTimestamp)"
                          class="social-link fcc-container font-medium weight-semi icon-cursor"
                          :href="farm.farmInfo.twitterShare"
                          target="_blank"
                        >
                          Share
                          <img class="social-icon" src="@/assets/icons/share.svg" />
                        </a>
                        <a
                          class="social-link fcc-container font-medium weight-semi icon-cursor"
                          :href="farm.farmInfo.twitterLink"
                          target="_blank"
                        >
                          Twitter
                          <img class="social-icon" src="@/assets/icons/twitter-white.svg" />
                        </a>
                      </div>

                      <div>
                        <div class="fcc-container">
                          <div class="btn-container">
                            <Button
                              v-if="farm.farmInfo.poolInfo.end_timestamp < currentTimestamp"
                              class="btn-primary font-small weight-bold"
                              :disabled="!wallet.connected || farm.userInfo.depositBalance.isNullOrZero()"
                              @click.stop="
                                openUnstakeModal(farm.farmInfo, farm.farmInfo.lp, farm.userInfo.depositBalance)
                              "
                            >
                              Harvest
                            </Button>

                            <Button
                              v-else
                              class="btn-primary font-small weight-bold"
                              :disabled="
                                !wallet.connected || harvesting[idx] || farm.userInfo.pendingReward.isNullOrZero()
                              "
                              :loading="harvesting[idx]"
                              @click="harvest(farm.farmInfo, idx)"
                            >
                              Harvest
                            </Button>
                          </div>

                          <div class="btn-container" v-if="farm.farmInfo.poolInfo.end_timestamp > currentTimestamp">
                            <Button
                              class="btn-primary font-small weight-bold"
                              :disabled="!wallet.connected || farm.userInfo.depositBalance.isNullOrZero()"
                              @click.stop="
                                openUnstakeModal(farm.farmInfo, farm.farmInfo.lp, farm.userInfo.depositBalance)
                              "
                            >
                              Withdraw
                            </Button>
                          </div>

                          <div
                            class="btn-container"
                            v-if="
                              currentTimestamp < farm.farmInfo.poolInfo.end_timestamp &&
                              farm.farmInfo.poolInfo.start_timestamp < currentTimestamp
                            "
                          >
                            <Button
                              v-if="wallet.connected"
                              class="btn-transparent font-small weight-bold"
                              id="dep"
                              :disabled="
                                !wallet.connected ||
                                !farm.farmInfo.poolInfo.is_allowed ||
                                farm.farmInfo.poolInfo.end_timestamp < currentTimestamp ||
                                farm.farmInfo.poolInfo.start_timestamp > currentTimestamp
                              "
                              @click="openStakeModal(farm.labelized, farm.farmInfo, farm.farmInfo.lp)"
                            >
                              {{
                                !farm.farmInfo.poolInfo.is_allowed
                                  ? 'Not Allowed'
                                  : currentTimestamp > farm.farmInfo.poolInfo.end_timestamp
                                  ? 'Ended'
                                  : farm.farmInfo.poolInfo.start_timestamp > currentTimestamp
                                  ? 'Unstarted'
                                  : 'Deposit'
                              }}
                            </Button>

                            <Button
                              v-else
                              class="btn-transparent font-small weight-bold"
                              @click="$accessor.wallet.openModal"
                            >
                              {{
                                !farm.farmInfo.poolInfo.is_allowed
                                  ? 'Not Allowed'
                                  : currentTimestamp > farm.farmInfo.poolInfo.end_timestamp
                                  ? 'Ended'
                                  : farm.farmInfo.poolInfo.start_timestamp > currentTimestamp
                                  ? 'Unstarted'
                                  : 'Deposit'
                              }}
                            </Button>
                          </div>

                          <div
                            class="btn-container"
                            v-if="
                              currentTimestamp < farm.farmInfo.poolInfo.end_timestamp &&
                              farm.farmInfo.poolInfo.start_timestamp < currentTimestamp &&
                              farm.farmInfo.currentLPtokens > 0.001
                            "
                          >
                            <Button
                              class="btn-transparent font-small weight-bold"
                              :disabled="
                                !farm.farmInfo.poolInfo.is_allowed ||
                                farm.farmInfo.poolInfo.end_timestamp < currentTimestamp ||
                                farm.farmInfo.poolInfo.start_timestamp > currentTimestamp
                              "
                              @click="openStakeModalLP(farm.farmInfo, farm.farmInfo.lp)"
                            >
                              {{
                                !farm.farmInfo.poolInfo.is_allowed
                                  ? 'Not Allowed'
                                  : currentTimestamp > farm.farmInfo.poolInfo.end_timestamp
                                  ? 'Ended'
                                  : farm.farmInfo.poolInfo.start_timestamp > currentTimestamp
                                  ? 'Unstarted'
                                  : 'Deposit LP'
                              }}
                            </Button>
                          </div>
                        </div>

                        <div class="fcc-container" style="margin-top: 8px">
                          <div
                            v-if="
                              farm.farmInfo.poolInfo.owner.toBase58() == wallet.address &&
                              farm.farmInfo.poolInfo.is_allowed &&
                              currentTimestamp < farm.farmInfo.poolInfo.end_timestamp
                            "
                            class="btn-container"
                          >
                            <Button class="btn-primary font-small weight-bold" @click="openAddRewardModal(farm)">
                              Add Rewards
                            </Button>
                          </div>
                          <div
                            v-if="
                              farm.farmInfo.poolInfo.owner.toBase58() == wallet.address &&
                              !farm.farmInfo.poolInfo.is_allowed &&
                              currentTimestamp < farm.farmInfo.poolInfo.end_timestamp
                            "
                            class="btn-container"
                          >
                            <Button class="btn-primary font-small weight-bold" @click="payFarmFee(farm)">
                              Pay Farm Fees
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <div class="btn-hide-collapse" @click="hideCollapse">
                    <img class="btn-hide-collapse-icon" src="@/assets/icons/arrow-down-blue.svg" />
                  </div>
                </CollapsePanel>
              </Collapse>
            </div>

            <div class="farm-table isMobile">
              <Collapse v-model="showCollapse" class="farm-collapse-mobile" accordion>
                <CollapsePanel v-for="(farm, idx) in showFarms" v-show="true" :key="farm.farmInfo.poolId">
                  <Row slot="header" class="farm-collapse-mobile-head">
                    <Col class="farm-collapse-item" span="24">
                      <div class="lp-icons">
                        <div class="lp-icons-group">
                          <div class="icons">
                            <CoinIcon :mint-address="farm.farmInfo.lp.coin.mintAddress" />
                            <span class="font-medium weight-semi">{{ farm.farmInfo.lp.coin.symbol }} - </span>
                            <CoinIcon :mint-address="farm.farmInfo.lp.pc.mintAddress" />
                            <span class="font-medium weight-semi">{{ farm.farmInfo.lp.pc.symbol }}</span>
                          </div>
                        </div>
                        <div class="farm-labels">
                          <div v-if="farm.labelized" class="label labelized weight-semi">Labelized</div>
                          <div v-else class="label permissionless weight-semi">Permissionless</div>

                          <div v-if="currentTimestamp > farm.farmInfo.poolInfo.end_timestamp" class="label ended">
                            Ended
                          </div>
                          <div
                            v-if="currentTimestamp < farm.farmInfo.poolInfo.start_timestamp * 1 + 86400 * 7"
                            class="label new"
                          >
                            New
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col class="farm-collapse-item" span="24">
                      <Col class="state text-center" span="8">
                        <div class="title font-small weight-semi spacing-large">Total Deposited</div>
                        <div
                          v-if="
                            farm.farmInfo.poolInfo.start_timestamp > currentTimestamp ||
                            currentTimestamp > farm.farmInfo.poolInfo.end_timestamp
                          "
                          class="value font-medium weight-semi spacing-small"
                        >
                          -
                        </div>
                        <div v-else class="value font-medium weight-semi spacing-small">
                          ${{
                            Math.round(farm.farmInfo.liquidityUsdValue)
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          }}
                        </div>
                      </Col>

                      <Col class="state text-center" span="8">
                        <div class="title font-small weight-semi spacing-large">
                          Total APR
                          <Tooltip
                            placement="bottomLeft"
                            v-if="
                              !(
                                farm.farmInfo.poolInfo.start_timestamp > currentTimestamp ||
                                currentTimestamp > farm.farmInfo.poolInfo.end_timestamp
                              )
                            "
                          >
                            <template slot="title">
                              <div>
                                <div class="tooltip-line">
                                  Fees <span>{{ farm.farmInfo.apr_details.apy }}%</span>
                                </div>
                                <hr />
                                <div class="tooltip-line">
                                  Rewards <span>{{ farm.farmInfo.apr_details.apr }}%</span>
                                </div>
                              </div>
                            </template>
                            <div class="info-icon">
                              <img src="@/assets/icons/info.svg" />
                            </div>
                          </Tooltip>
                        </div>
                        <div
                          v-if="
                            farm.farmInfo.poolInfo.start_timestamp > currentTimestamp ||
                            currentTimestamp > farm.farmInfo.poolInfo.end_timestamp
                          "
                          class="value font-medium weight-semi spacing-small"
                        >
                          -
                        </div>
                        <div v-else class="value font-medium weight-semi spacing-small">
                          <img v-if="farm.farmInfo.apr > 300" src="@/assets/icons/fire.svg" />
                          <img v-if="farm.farmInfo.apr > 1000" src="@/assets/icons/fire.svg" />
                          {{ Math.round(farm.farmInfo.apr * 100) / 100 }}%
                        </div>
                      </Col>

                      <Col class="state text-center" span="8">
                        <div class="title font-small weight-semi spacing-large">Pending Reward</div>
                        <div
                          v-if="farm.farmInfo.poolInfo.start_timestamp > currentTimestamp"
                          class="value font-medium weight-semi spacing-small"
                        >
                          -
                        </div>
                        <div v-else class="value font-medium weight-semi spacing-small">
                          {{ (!wallet.connected || (Math.round(farm.userInfo.pendingReward.format().replace(/,/g, '') * 100000) / 100000) &lt; 0) ? farm.farmInfo.reward.symbol + ' ' + 0 : farm.farmInfo.reward.symbol + ' ' + (Math.round(farm.userInfo.pendingReward.format().replace(/,/g, '') * 100000) / 100000) }}
                        </div>
                      </Col>
                    </Col>

                    <Col
                      v-if="farm.farmInfo.poolId != showCollapse"
                      class="farm-collapse-item btn-show-collapse"
                      span="24"
                    >
                      <img src="@/assets/icons/arrow-down-blue.svg" />
                    </Col>
                  </Row>

                  <Row class="farm-collapse-content">
                    <Col class="farm-collapse-item" span="24">
                      <Col class="state" span="14">
                        <div class="farm-infos">
                          <div class="farm-info-group font-xsmall">
                            <div class="farm-info-img">
                              <img src="@/assets/icons/sandglass.svg" />
                            </div>
                            from
                            {{ new Date(farm.farmInfo.poolInfo.start_timestamp * 1e3).toLocaleDateString('en-US') }}
                            to
                            {{ new Date(farm.farmInfo.poolInfo.end_timestamp * 1e3).toLocaleDateString('en-US') }}
                          </div>

                          <div>
                            <div class="farm-info-group font-xsmall">
                              <div class="farm-info-img">
                                <img src="@/assets/icons/reward.svg" />
                              </div>
                              Remaining rewards
                              {{
                                Math.round(
                                  new TokenAmount(
                                    farm.farmInfo.reward.balance.wei,
                                    farm.farmInfo.reward.decimals
                                  ).toEther() * 1000
                                ) / 1000
                              }}
                              {{ farm.farmInfo.reward.symbol }}
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col class="state" span="10">
                        <div class="title font-small weight-semi spacing-large fr-container">Value Deposited</div>
                        <div
                          v-if="farm.farmInfo.poolInfo.start_timestamp > currentTimestamp"
                          class="value font-medium weight-semi spacing-small text-right"
                        >
                          -
                        </div>
                        <div v-else class="value font-medium weight-semi spacing-small text-right">
                          {{
                            !wallet.connected
                              ? 0
                              : farm.userInfo.depositBalanceUSD
                              ? '$ ' + farm.userInfo.depositBalanceUSD
                              : farm.userInfo.depositBalance.format()
                          }}
                        </div>
                      </Col>
                    </Col>

                    <Col class="farm-collapse-item fcc-container" span="24">
                      <div class="btn-container">
                        <Button
                          v-if="farm.farmInfo.poolInfo.end_timestamp < currentTimestamp"
                          class="btn-primary font-small weight-bold"
                          :disabled="!wallet.connected || farm.userInfo.depositBalance.isNullOrZero()"
                          @click.stop="openUnstakeModal(farm.farmInfo, farm.farmInfo.lp, farm.userInfo.depositBalance)"
                        >
                          Harvest
                        </Button>

                        <Button
                          v-else
                          class="btn-primary font-small weight-bold"
                          :disabled="!wallet.connected || harvesting[idx] || farm.userInfo.pendingReward.isNullOrZero()"
                          :loading="harvesting[idx]"
                          @click="harvest(farm.farmInfo, idx)"
                        >
                          Harvest
                        </Button>
                      </div>

                      <div class="btn-container" v-if="farm.farmInfo.poolInfo.end_timestamp > currentTimestamp">
                        <Button
                          class="btn-primary font-small weight-bold"
                          :disabled="!wallet.connected || farm.userInfo.depositBalance.isNullOrZero()"
                          @click.stop="openUnstakeModal(farm.farmInfo, farm.farmInfo.lp, farm.userInfo.depositBalance)"
                        >
                          Withdraw
                        </Button>
                      </div>

                      <div
                        class="btn-container"
                        v-if="
                          currentTimestamp < farm.farmInfo.poolInfo.end_timestamp &&
                          farm.farmInfo.poolInfo.start_timestamp < currentTimestamp
                        "
                      >
                        <Button
                          v-if="wallet.connected"
                          class="btn-transparent font-small weight-bold"
                          id="dep"
                          :disabled="
                            !wallet.connected ||
                            !farm.farmInfo.poolInfo.is_allowed ||
                            farm.farmInfo.poolInfo.end_timestamp < currentTimestamp ||
                            farm.farmInfo.poolInfo.start_timestamp > currentTimestamp
                          "
                          @click="openStakeModal(farm.labelized, farm.farmInfo, farm.farmInfo.lp)"
                        >
                          {{
                            !farm.farmInfo.poolInfo.is_allowed
                              ? 'Not Allowed'
                              : currentTimestamp > farm.farmInfo.poolInfo.end_timestamp
                              ? 'Ended'
                              : farm.farmInfo.poolInfo.start_timestamp > currentTimestamp
                              ? 'Unstarted'
                              : 'Deposit'
                          }}
                        </Button>

                        <Button
                          v-else
                          class="btn-transparent font-small weight-bold"
                          @click="$accessor.wallet.openModal"
                        >
                          {{
                            !farm.farmInfo.poolInfo.is_allowed
                              ? 'Not Allowed'
                              : currentTimestamp > farm.farmInfo.poolInfo.end_timestamp
                              ? 'Ended'
                              : farm.farmInfo.poolInfo.start_timestamp > currentTimestamp
                              ? 'Unstarted'
                              : 'Deposit'
                          }}
                        </Button>
                      </div>

                      <div
                        class="btn-container"
                        v-if="
                          currentTimestamp < farm.farmInfo.poolInfo.end_timestamp &&
                          farm.farmInfo.poolInfo.start_timestamp < currentTimestamp &&
                          farm.farmInfo.currentLPtokens > 0.001
                        "
                      >
                        <Button
                          class="btn-transparent font-small weight-bold"
                          :disabled="
                            !farm.farmInfo.poolInfo.is_allowed ||
                            farm.farmInfo.poolInfo.end_timestamp < currentTimestamp ||
                            farm.farmInfo.poolInfo.start_timestamp > currentTimestamp
                          "
                          @click="openStakeModalLP(farm.farmInfo, farm.farmInfo.lp)"
                        >
                          {{
                            !farm.farmInfo.poolInfo.is_allowed
                              ? 'Not Allowed'
                              : currentTimestamp > farm.farmInfo.poolInfo.end_timestamp
                              ? 'Ended'
                              : farm.farmInfo.poolInfo.start_timestamp > currentTimestamp
                              ? 'Unstarted'
                              : 'Deposit LP'
                          }}
                        </Button>
                      </div>
                    </Col>

                    <Col
                      v-if="
                        farm.farmInfo.poolInfo.owner.toBase58() == wallet.address &&
                        currentTimestamp < farm.farmInfo.poolInfo.end_timestamp
                      "
                      class="farm-collapse-item fcc-container"
                      span="24"
                    >
                      <div
                        v-if="
                          farm.farmInfo.poolInfo.owner.toBase58() == wallet.address &&
                          farm.farmInfo.poolInfo.is_allowed &&
                          currentTimestamp < farm.farmInfo.poolInfo.end_timestamp
                        "
                        class="btn-container"
                      >
                        <Button class="btn-primary font-small weight-bold" @click="openAddRewardModal(farm)">
                          Add Rewards
                        </Button>
                      </div>
                      <div
                        v-if="
                          farm.farmInfo.poolInfo.owner.toBase58() == wallet.address &&
                          !farm.farmInfo.poolInfo.is_allowed &&
                          currentTimestamp < farm.farmInfo.poolInfo.end_timestamp
                        "
                        class="btn-container"
                      >
                        <Button class="btn-primary font-small weight-bold" @click="payFarmFee(farm)">
                          Pay Farm Fees
                        </Button>
                      </div>
                    </Col>

                    <Col class="farm-collapse-item fcc-container" span="24">
                      <a
                        v-if="!(farm.farmInfo.poolInfo.end_timestamp < currentTimestamp)"
                        class="social-link fcc-container font-xsmall weight-semi icon-cursor"
                        :href="farm.farmInfo.twitterShare"
                        target="_blank"
                      >
                        Share
                        <img class="social-icon" src="@/assets/icons/share.svg" />
                      </a>
                      <a
                        class="social-link fcc-container font-xsmall weight-semi icon-cursor"
                        :href="farm.farmInfo.twitterLink"
                        target="_blank"
                      >
                        Twitter
                        <img class="social-icon" src="@/assets/icons/twitter-white.svg" />
                      </a>
                    </Col>
                  </Row>

                  <div class="btn-hide-collapse" @click="hideCollapse">
                    <img class="btn-hide-collapse-icon" src="@/assets/icons/arrow-down-blue.svg" />
                  </div>
                </CollapsePanel>
              </Collapse>
            </div>

            <div v-if="totalCount > pageSize" class="pagination-container">
              <div class="pagination-body">
                <Pagination :total="totalCount" :pageSize="pageSize" :defaultCurrent="1" v-model="currentPage">
                </Pagination>
              </div>
            </div>
          </div>

          <div v-else class="fcc-container">
            <Spin :spinning="true">
              <Icon slot="indicator" type="loading" style="font-size: 24px" spin />
            </Spin>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Tooltip, Collapse, Spin, Icon, Row, Col, Button, Pagination } from 'ant-design-vue'
import { get, set, cloneDeep, forIn, indexOf } from 'lodash-es'
import { TokenAmount } from '@/utils/safe-math'
import { FarmInfo } from '@/utils/farms'
import { deposit, withdraw } from '@/utils/stake'
import { getUnixTs } from '@/utils'
import { getBigNumber, toBigNumber } from '@/utils/layouts'
import { LiquidityPoolInfo, LIQUIDITY_POOLS } from '@/utils/pools'
import moment from 'moment'
import {
  FarmProgram,
  FarmProgramAccountLayout,
  FARM_PREFIX,
  PAY_FARM_FEE,
  REWARD_MULTIPLER,
  YieldFarm,
  getCoinBalance,
  getPcBalance,
  getTotalSupply
} from '@/utils/farm'
import { PublicKey } from '@solana/web3.js'
import {
  DEVNET_MODE,
  FARM_PROGRAM_ID,
  FARM_INITIAL_SUPER_OWNER,
  FARM_VERSION,
  REMOVE_REWARDS_FARM_ADDRESS
} from '@/utils/ids'
import { TOKENS } from '@/utils/tokens'
import { addLiquidity, removeLiquidity } from '@/utils/liquidity'
import { loadAccount } from '@/utils/account'
import BigNumber from 'bignumber.js'
const CollapsePanel = Collapse.Panel
const Vco = require('v-click-outside')
Vue.use(Vco)

export default Vue.extend({
  components: {
    Tooltip,
    Collapse,
    CollapsePanel,
    Spin,
    Icon,
    Row,
    Col,
    Button,
    Pagination
  },
  props: {
    farmID: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      farmProgramCreated: true,
      superOwnerAddress: FARM_INITIAL_SUPER_OWNER,
      removeRewardsFarmAddress: REMOVE_REWARDS_FARM_ADDRESS,
      farmLoaded: false as boolean,
      farms: [] as any[],
      showFarms: [] as any[],
      searchName: '',
      searchLifeFarm: false as boolean,
      displayfilters: false,
      lp: null,
      rewardCoin: null,
      farmInfo: null as any,
      harvesting: [] as boolean[],
      stakeModalOpening: false,
      stakeModalOpeningLP: false,
      addRewardModalOpening: false,
      createFarmModalOpening: false,
      staking: false,
      adding: false,
      paying: false,
      TVL: 0,
      suppling: false,
      unstakeModalOpening: false,
      unstaking: false,
      poolType: true,
      endedFarmsPoolId: [] as string[],
      showCollapse: [] as any[],
      currentTimestamp: 0,
      initBasedSearch: 0,
      tempInfo: null as any,
      stakeLPError: false,
      labelizedAmms: {} as any,
      labelizedAmmsExtended: {} as any,
      poolsDatas: {} as any,
      checkedFP: false as boolean,
      updating: false as boolean,
      totalCount: 110,
      pageSize: 50,
      displaynoticeupdate: false,
      currentPage: 1,
      labelizedPermission: false as any,
      sortMethod: 'liquidity' as string,
      sortAsc: true as boolean,
      showOptionMenu: false as boolean,
      showMoreMenu: [] as boolean[],
      showTabMenu: false as boolean,
      showGuide: true as boolean,
      isSearchClicking: false as boolean,
      currentShowMore: -1 as number,
      mostUsed: [
        {
          symbol: 'CRP',
          mintAddress: 'DubwWZNWiNGMMeeQHPnMATNj77YZPZSAz2WVR5WjLJqz'
        },
        {
          symbol: 'USDC',
          mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
        },
        {
          symbol: 'SOL',
          mintAddress: '11111111111111111111111111111111'
        }
      ] as any,
      activeSpinning: false as boolean,
      userMigrations: [] as any[],
      unstakePoolInfo: {} as any
    }
  },

  computed: {
    ...mapState(['app', 'wallet', 'farm', 'url', 'price', 'liquidity'])
  },

  watch: {
    'wallet.tokenAccounts': {
      handler(newTokenAccounts: any) {
        this.updateCurrentLp(newTokenAccounts)
      },
      deep: true
    },

    'farm.infos': {
      handler() {
        this.updateFarms()
      },
      deep: true
    },

    'farm.stakeAccounts': {
      handler() {
        this.updateFarms()
        this.checkFarmMigration()
      },
      deep: true
    },

    showCollapse: {
      handler() {
        // if (!this.poolType && this.showCollapse.length > 0) {
        //   this.showCollapse.splice(0, this.showCollapse.length)
        // }
      },
      deep: true
    },
    searchName: {
      handler(newSearchName: string) {
        this.filterFarms(newSearchName, this.searchLifeFarm)
      },
      deep: true
    },
    currentPage: {
      handler(newPage: number) {
        this.filterFarms(this.searchName, this.searchLifeFarm, newPage)
      },
      deep: true
    }
  },

  mounted() {
    this.getTvl()
    this.$accessor.token.loadTokens()

    this.updateFarms()

    if (this.farmID) {
      console.log(this.farmID)
      this.searchName = this.farmID
    }
  },

  methods: {
    TokenAmount,
    async createFarmProgram() {
      const conn = this.$web3
      const wallet = (this as any).$wallet
      const txid = await FarmProgram.createDefaultProgramData(conn, wallet)

      await this.delay(1500)
      this.checkIfFarmProgramExist()
    },
    async checkFarmMigration() {
      let userMigrations: any = []

      try {
        const migrations = await fetch('https://api.cropper.finance/migration/').then((res) => res.json())
        //const migrations = {"G8V86qfLq3v4EXrZxpUWS4yufDymsddMJkve46z4tnry":"B8XAiSowXmqKbcvhuQKemPwReXTFLPTQdTyMm1xANZpK"}

        forIn(migrations, (newFarmId, oldFarmId, _object) => {
          let userInfoNew = get(this.farm.stakeAccounts, newFarmId)
          let userInfoOld = get(this.farm.stakeAccounts, oldFarmId)
          let oldFarm = get(this.farm.infos, oldFarmId)
          let oldFarmInfo = cloneDeep(oldFarm)
          if (userInfoNew === undefined && userInfoOld != undefined && userInfoOld.depositBalance.wei.toNumber() > 0) {
            userMigrations.push({
              oldFarmId,
              newFarmId,
              farmInfo: oldFarmInfo,
              depositBalance:
                userInfoOld.depositBalance.wei.toNumber() / Math.pow(10, userInfoOld.depositBalance.decimals)
            })
          }
        })
      } catch {
        // dummy data
        this.userMigrations = []
      } finally {
        this.userMigrations = userMigrations
      }
    },
    migrateFarm(migrationFarm: any) {
      const amount = migrationFarm.depositBalance

      const oldFarm = get(this.farm.infos, migrationFarm.oldFarmId)
      const oldFarmInfo = cloneDeep(oldFarm)

      const newFarm = get(this.farm.infos, migrationFarm.newFarmId)
      const newFarmInfo = cloneDeep(newFarm)

      const conn = this.$web3
      const wallet = (this as any).$wallet
      const lp = oldFarm.lp

      const lpAccount = get(this.wallet.tokenAccounts, `${oldFarmInfo.lp.mintAddress}.tokenAccountAddress`)
      const rewardAccount = get(this.wallet.tokenAccounts, `${oldFarmInfo.reward.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${oldFarmInfo.poolId}.stakeAccountAddress`)

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      YieldFarm.migrate(conn, wallet, oldFarmInfo, newFarmInfo, lpAccount, rewardAccount, infoAccount, amount)
        .then(async (txid) => {
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

          const description = `Migrate ${amount} ${lp.name}`
          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Migrate failed',
            description: error.message
          })
          this.$accessor.farm.requestInfos()
          this.$accessor.wallet.getTokenAccounts()
        })
        .finally(() => {
          this.checkFarmMigration()
        })
    },
    async checkIfFarmProgramExist() {
      const conn = this.$web3
      const farmProgramId = new PublicKey(FARM_PROGRAM_ID)
      const seeds = [Buffer.from(FARM_PREFIX), farmProgramId.toBuffer()]
      const [programAccount] = await PublicKey.findProgramAddress(seeds, farmProgramId)
      try {
        const accountData = await loadAccount(conn, programAccount, farmProgramId)
        const farmData = FarmProgramAccountLayout.decode(accountData)
        this.farmProgramCreated = true
        this.superOwnerAddress = farmData.super_owner.toBase58()
      } catch {
        this.farmProgramCreated = false
      }
    },
    async updateLabelizedAmms() {
      this.labelizedAmms = {}
      this.labelizedAmmsExtended = {}
      let responseData = []
      try {
        responseData = await fetch('https://api.cropper.finance/farms/').then((res) => res.json())
      } catch {
        // dummy data
      } finally {
        ;(responseData as any).forEach((element: any) => {
          this.labelizedAmms[element.ammID] = element.labelized
          this.labelizedAmmsExtended[element.ammID] = element
        })
      }

      this.initBasedSearch == 0

      try {
        this.poolsDatas = await fetch('https://api.cropper.finance/cmc/').then((res) => res.json())
      } catch {
        this.poolsDatas = []
      } finally {
        // nothing to do ..
      }
    },
    async getTvl() {
      let cur_date = new Date().getTime()
      if (window.localStorage.TVL_last_updated) {
        const last_updated = parseInt(window.localStorage.TVL_last_updated)
        if (cur_date - last_updated <= 600000) {
          this.TVL = window.localStorage.TVL
          return
        }
      }

      let responseData: any = []
      let tvl = 0

      try {
        responseData = await fetch('https://api.cropper.finance/staking/').then((res) => res.json())
        tvl = (responseData as any).globalTVL * 1
      } catch {
        // dummy data
      } finally {
      }

      this.TVL = Math.round(tvl)

      window.localStorage.TVL_last_updated = new Date().getTime()
      window.localStorage.TVL = this.TVL
    },
    async updateFarms() {
      if (!this.checkedFP) {
        this.checkIfFarmProgramExist()
      }
      this.checkedFP = true

      if (this.updating) {
        return
      }

      this.updating = true

      this.$accessor.token.loadTokens()
      await this.updateLabelizedAmms()
      this.currentTimestamp = moment().unix()

      const conn = this.$web3
      const wallet = (this as any).$accessor.wallet
      const liquidity = (this as any).$accessor.liquidity

      const farms: any = []
      const endedFarmsPoolId: string[] = []
      for (const [poolId, farmInfo] of Object.entries(this.farm.infos)) {
        let isPFO = false

        // @ts-ignore
        const { reward_per_share_net, last_timestamp, end_timestamp, reward_per_timestamp_or_remained_reward_amount } = farmInfo.poolInfo

        // @ts-ignore
        const { reward, lp } = farmInfo

        const newFarmInfo: any = cloneDeep(farmInfo)

        if (end_timestamp.toNumber() < 1635452141) {
          continue
        }

        let partCoin = toBigNumber(0)
        let partPc = toBigNumber(0)

        if (reward && lp) {
          const rewardPerTimestamp = toBigNumber(reward_per_timestamp_or_remained_reward_amount).dividedBy(
            toBigNumber(end_timestamp).minus(toBigNumber(last_timestamp))
          )

          const rewardPerTimestampAmount = new TokenAmount(rewardPerTimestamp, reward.decimals)
          const liquidityItem = get(this.liquidity.infos, lp.mintAddress)

          let newCoin = 0
          let newPc = 0

          if (
            !this.price.prices[liquidityItem?.coin.symbol as string] &&
            this.price.prices[liquidityItem?.pc.symbol as string]
          ) {
            this.price.prices[liquidityItem?.coin.symbol as string] =
              (this.price.prices[liquidityItem?.pc.symbol as string] *
                getBigNumber((liquidityItem?.pc.balance as TokenAmount).toEther())) /
              getBigNumber((liquidityItem?.coin.balance as TokenAmount).toEther())
            newCoin = 1
          }

          if (
            !this.price.prices[liquidityItem?.pc.symbol as string] &&
            this.price.prices[liquidityItem?.coin.symbol as string]
          ) {
            this.price.prices[liquidityItem?.pc.symbol as string] =
              (this.price.prices[liquidityItem?.coin.symbol as string] *
                getBigNumber((liquidityItem?.coin.balance as TokenAmount).toEther())) /
              getBigNumber((liquidityItem?.pc.balance as TokenAmount).toEther())
            newPc = 1
          }

          const rewardPerTimestampAmountTotalValue = rewardPerTimestampAmount
            .toEther()
            .multipliedBy(new BigNumber(60 * 60 * 24 * 365 * this.price.prices[reward.symbol as string]))

          const liquidityCoinValue = (liquidityItem?.coin.balance as TokenAmount)
            .toEther()
            .multipliedBy(new BigNumber(this.price.prices[liquidityItem?.coin.symbol as string]))

          const liquidityPcValue = (liquidityItem?.pc.balance as TokenAmount)
            .toEther()
            .multipliedBy(new BigNumber(this.price.prices[liquidityItem?.pc.symbol as string]))

          let liquidityTotalValue = liquidityPcValue.plus(liquidityCoinValue)

          if (this.price.prices[liquidityItem?.pc.symbol as string] == 1) {
            liquidityTotalValue = liquidityPcValue.multipliedBy(2)
          }

          const liquidityTotalSupply = (liquidityItem?.lp.totalSupply as TokenAmount).toEther()

          partCoin = (liquidityItem?.coin.balance as TokenAmount).toEther().dividedBy(liquidityTotalSupply)
          partPc = (liquidityItem?.pc.balance as TokenAmount).toEther().dividedBy(liquidityTotalSupply)

          const liquidityItemValue = liquidityTotalValue.dividedBy(liquidityTotalSupply)
          let liquidityUsdValue = lp.balance.toEther().multipliedBy(liquidityItemValue)
          newFarmInfo.lpUSDvalue = liquidityItemValue

          let farmUsdValue = newFarmInfo.lp.balance.toEther().multipliedBy(liquidityItemValue)

          let baseCalculation = getBigNumber(farmUsdValue)
          if (baseCalculation < 0.01) {
            baseCalculation = 1
          }

          let apr = ((getBigNumber(rewardPerTimestampAmountTotalValue) / baseCalculation) * 100).toFixed(2)

          if (apr === 'NaN' || apr === 'Infinity') {
            apr = '0'
          }

          if (isNaN(liquidityUsdValue)) {
            liquidityUsdValue = 0
          }

          if (
            this.currentTimestamp < newFarmInfo.poolInfo.end_timestamp &&
            (rewardPerTimestampAmountTotalValue as any) * 86400 * 7 < 1 &&
            liquidityUsdValue < 2 &&
            !window.localStorage['owner_' + newFarmInfo.poolId]
          ) {
            continue
          }

          // @ts-ignore
          newFarmInfo.apr = apr

          newFarmInfo.apr_details = {
            apr: Math.round((apr as any) * 100) / 100,
            apy: 0
          } as any

          if (this.poolsDatas[liquidityItem.ammId] && this.poolsDatas[liquidityItem.ammId]['apy']) {
            let apy = this.poolsDatas[liquidityItem.ammId]['apy']
            newFarmInfo.apr = Math.round(((apr as any) * 1 - (apy as any) * -1) * 100) / 100
            newFarmInfo.apr_details.apy = Math.round(apy * 100) / 100
          }

          if (wallet) {
            let unstaked = get(wallet.tokenAccounts, `${liquidityItem.lp.mintAddress}.balance`)
            //getBigNumber((liquidityItem?.lp.totalSupply as TokenAmount).toEther());
            if (unstaked) {
              newFarmInfo.currentLPtokens = getBigNumber((unstaked as TokenAmount).toEther())
            } else {
              newFarmInfo.currentLPtokens = 0
            }
          } else {
            newFarmInfo.currentLPtokens = 0
          }

          // @ts-ignore
          newFarmInfo.liquidityUsdValue = liquidityUsdValue

          if (rewardPerTimestampAmount.toEther().toString() === '0') {
            //endedFarmsPoolId.push(poolId)
          }

          if (newCoin) {
            delete this.price.prices[liquidityItem?.coin.symbol as string]
          }

          if (newPc) {
            delete this.price.prices[liquidityItem?.pc.symbol as string]
          }
        }

        let userInfo = get(this.farm.stakeAccounts, poolId)
        if (userInfo && lp && FARM_VERSION === 1) {
          userInfo = cloneDeep(userInfo)

          const { rewardDebt, depositBalance } = userInfo
          let currentTimestamp = this.currentTimestamp

          if (currentTimestamp > end_timestamp.toNumber()) {
            currentTimestamp = end_timestamp.toNumber()
          }

          const duration = currentTimestamp - last_timestamp.toNumber()

          const rewardPerTimestamp = toBigNumber(reward_per_timestamp_or_remained_reward_amount)
          const liquidityItem = get(this.liquidity.infos, lp.mintAddress)
          const lpTotalSupply = (liquidityItem?.lp.totalSupply as TokenAmount).wei
          newFarmInfo.lpTotalSupply = lpTotalSupply
          const rewardPerShareCalc = rewardPerTimestamp
            .multipliedBy(duration)
            .multipliedBy(REWARD_MULTIPLER)
            .dividedBy(lpTotalSupply)
            .plus(getBigNumber(reward_per_share_net))

          let pendingReward = depositBalance.wei
            .multipliedBy(rewardPerShareCalc)
            .dividedBy(REWARD_MULTIPLER)
            .minus(rewardDebt.wei)

          userInfo.needRefresh = false

          if (pendingReward.toNumber() > newFarmInfo.reward.balance.wei.toNumber()) {
            pendingReward = newFarmInfo.reward.balance.wei
            userInfo.needRefresh = true
            this.displaynoticeupdate = true
          }

          userInfo.depositFormat = (Math.round(userInfo.depositBalance.format() * 100000) / 100000).toFixed(2)

          userInfo.depositCoin = (
            Math.round((partCoin as any) * userInfo.depositBalance.format() * 10000) / 10000
          ).toFixed(2)

          userInfo.depositPc = (Math.round((partPc as any) * userInfo.depositBalance.format() * 10000) / 10000).toFixed(
            2
          )

          if (newFarmInfo.lpUSDvalue) {
            userInfo.depositBalanceUSD = (
              Math.round(newFarmInfo.lpUSDvalue * userInfo.depositBalance.format() * 100) / 100
            )
              .toFixed(2)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }

          userInfo.pendingReward = new TokenAmount(pendingReward, newFarmInfo.reward.decimals)
        } else if (userInfo && lp && FARM_VERSION > 1) {
          userInfo = cloneDeep(userInfo)

          const { rewardDebt, depositBalance } = userInfo
          let currentTimestamp = this.currentTimestamp

          if (currentTimestamp > end_timestamp.toNumber()) {
            currentTimestamp = end_timestamp.toNumber()
          }

          const duration = currentTimestamp - last_timestamp.toNumber()

          const rewardPerTimestamp = toBigNumber(reward_per_timestamp_or_remained_reward_amount).dividedBy(
            toBigNumber(end_timestamp).minus(toBigNumber(last_timestamp))
          )

          const rewardPerShareCalc = rewardPerTimestamp
            .multipliedBy(duration)
            .multipliedBy(REWARD_MULTIPLER)
            .dividedBy(newFarmInfo.lp.balance.wei)
            .plus(getBigNumber(reward_per_share_net))

          const JUMP_DEBT = new BigNumber(10000000000000000000)
          const _rewardDebt = rewardDebt.wei.minus(JUMP_DEBT)
          let pendingReward = depositBalance.wei
            .multipliedBy(rewardPerShareCalc)
            .dividedBy(REWARD_MULTIPLER)
            .minus(_rewardDebt)

          userInfo.needRefresh = false

          if (pendingReward.toNumber() > newFarmInfo.reward.balance.wei.toNumber()) {
            pendingReward = newFarmInfo.reward.balance.wei
            userInfo.needRefresh = true
            this.displaynoticeupdate = true
          }

          userInfo.depositFormat = (
            Math.round(userInfo.depositBalance.format().replace(/,/g, '') * 100000) / 100000
          ).toFixed(2)

          userInfo.depositCoin = (
            Math.round((partCoin as any) * userInfo.depositBalance.format().replace(/,/g, '') * 10000) / 10000
          ).toFixed(2)

          userInfo.depositPc = (
            Math.round((partPc as any) * userInfo.depositBalance.format().replace(/,/g, '') * 10000) / 10000
          ).toFixed(2)

          if (newFarmInfo.lpUSDvalue) {
            userInfo.depositBalanceUSD = (
              Math.round(newFarmInfo.lpUSDvalue * userInfo.depositBalance.format().replace(/,/g, '') * 100) / 100
            )
              .toFixed(2)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }

          userInfo.pendingReward = new TokenAmount(pendingReward, newFarmInfo.reward.decimals)
        } else {
          userInfo = {
            // @ts-ignore
            depositBalance: new TokenAmount(0, farmInfo.lp.decimals),
            // @ts-ignore
            pendingReward: new TokenAmount(0, farmInfo.reward.decimals)
          }
        }

        if (
          (newFarmInfo as any).poolInfo.is_allowed > 0 ||
          (newFarmInfo as any).poolInfo.owner.toBase58() === this.wallet.address
        ) {
          let labelized = false
          if (lp) {
            const liquidityItem = get(this.liquidity.infos, lp.mintAddress)

            if (this.labelizedAmms[newFarmInfo.poolId]) {
              if (this.labelizedAmmsExtended[newFarmInfo.poolId].farmhidden == true) {
                continue
              }

              if (this.labelizedAmmsExtended[newFarmInfo.poolId].labelized == true) {
                labelized = true
              }
            }
          }

          if (TOKENS[newFarmInfo.lp.coin.mintAddress] && TOKENS[newFarmInfo.lp.coin.mintAddress].twitter) {
            ;(newFarmInfo as any).twitterLink = TOKENS[newFarmInfo.lp.coin.mintAddress].twitter
          }

          if (newFarmInfo.lp.coin.symbol == 'CRP') {
            ;(newFarmInfo as any).twitterLink = 'https://twitter.com/CropperFinance'
          } else if (newFarmInfo.lp.coin.symbol == 'wCAPS' || newFarmInfo.lp.coin.symbol == 'wCAPS_v1') {
            ;(newFarmInfo as any).twitterLink = 'https://twitter.com/Ternoa_'
          } else if (newFarmInfo.lp.coin.symbol == 'SAMO') {
            ;(newFarmInfo as any).twitterLink = 'https://twitter.com/samoyedcoin'
          } else if (newFarmInfo.lp.coin.symbol == 'XVC') {
            ;(newFarmInfo as any).twitterLink = 'https://twitter.com/Xverseofficial'
          }

          ;(newFarmInfo as any).twitterShare = `http://twitter.com/share?text=I am now farming ${
            (newFarmInfo as any).lp.coin.symbol
          }-${(newFarmInfo as any).lp.pc.symbol} on @CropperFinance with ${
            newFarmInfo.apr
          }%25 APR%0A%0ACome and join me at https://cropper.finance/farms/?s=${
            (newFarmInfo as any).poolId
          }%0A%0AFarm now, Harvest later.&url= `

          if (!isPFO || true) {
            farms.push({
              labelized,
              userInfo,
              farmInfo: newFarmInfo
            })
          }
        }
      }

      if (this.sortAsc) {
        if (this.sortMethod == 'apr') {
          this.farms = farms.sort((a: any, b: any) => b.farmInfo.apr - a.farmInfo.apr)
        } else if (this.sortMethod == 'liquidity') {
          this.farms = farms.sort((a: any, b: any) => b.farmInfo.liquidityUsdValue - a.farmInfo.liquidityUsdValue)
        }
      } else {
        if (this.sortMethod == 'apr') {
          this.farms = farms.sort((a: any, b: any) => a.farmInfo.apr - b.farmInfo.apr)
        } else if (this.sortMethod == 'liquidity') {
          this.farms = farms.sort((a: any, b: any) => a.farmInfo.liquidityUsdValue - b.farmInfo.liquidityUsdValue)
        }
      }

      this.endedFarmsPoolId = endedFarmsPoolId

      if (this.farmID) {
        console.log(this.farmID)
        this.searchName = this.farmID
      }

      this.filterFarms(this.searchName, this.searchLifeFarm, this.currentPage)
    },
    filterFarms(searchName: string, searchLifeFarm: boolean, pageNum: number = 1) {
      this.currentPage = pageNum
      this.showFarms = this.farms

      // filter for not allowed farms
      this.showFarms = this.showFarms.filter(
        (farm: any) =>
          farm.farmInfo.poolInfo.is_allowed > 0 ||
          (farm.farmInfo.poolInfo.owner.toBase58() === this.wallet.address && farm.farmInfo.poolInfo.is_allowed === 0)
      )

      if (
        searchName != '' &&
        this.farms.filter(
          (farm: any) => (farm.farmInfo.poolId as string).toLowerCase() == (searchName as string).toLowerCase()
        ).length > 0
      ) {
        this.showFarms = this.farms.filter(
          (farm: any) => (farm.farmInfo.poolId as string).toLowerCase() == (searchName as string).toLowerCase()
        )
      } else if (
        searchName != '' &&
        this.farms.filter(
          (farm: any) =>
            (farm.farmInfo.lp.pc.symbol as string).toLowerCase() == (searchName as string).toLowerCase() ||
            (farm.farmInfo.lp.coin.symbol as string).toLowerCase() == (searchName as string).toLowerCase()
        ).length > 0
      ) {
        this.showFarms = this.farms.filter(
          (farm: any) =>
            (farm.farmInfo.lp.pc.symbol as string).toLowerCase() == (searchName as string).toLowerCase() ||
            (farm.farmInfo.lp.coin.symbol as string).toLowerCase() == (searchName as string).toLowerCase()
        )
      } else if (searchName != '') {
        this.showFarms = this.farms.filter((farm: any) =>
          (farm.farmInfo.lp.symbol as string).toLowerCase().includes((searchName as string).toLowerCase())
        )
      }

      this.totalCount = this.showFarms.length

      const currentTimestamp = moment().unix()
      if (!searchLifeFarm) {
        //opened
        this.showFarms = this.showFarms.filter(
          (farm: any) =>
            farm.farmInfo.poolInfo.start_timestamp < currentTimestamp &&
            farm.farmInfo.poolInfo.end_timestamp > currentTimestamp
        )
      } else {
        //ended
        this.showFarms = this.showFarms.filter((farm: any) => farm.farmInfo.poolInfo.end_timestamp < currentTimestamp)
      }
      
      let max = this.showFarms.length
      let start = (this.currentPage - 1) * this.pageSize
      let end = this.currentPage * this.pageSize < max ? this.currentPage * this.pageSize : max
      this.showFarms = this.showFarms.slice(start, end)

      this.showMoreMenu = []
      this.showFarms.forEach((element) => {
        this.showMoreMenu.push(false)
      })
      this.farmLoaded = true
      this.updating = false
    },

    updateCurrentLp(newTokenAccounts: any) {
      if (this.lp) {
        const coin = cloneDeep(this.lp)
        // @ts-ignore
        const lpBalance = get(newTokenAccounts, `${this.lp.mintAddress}.balance`)
        // @ts-ignore
        coin.balance = lpBalance

        this.lp = coin
      }
    },

    openStakeModal(labelized: any, poolInfo: FarmInfo, lp: any) {
      const coin = cloneDeep(lp)
      const lpBalance = get(this.wallet.tokenAccounts, `${lp.mintAddress}.balance`)
      coin.balance = lpBalance

      this.lp = coin

      this.labelizedPermission = labelized
      this.farmInfo = cloneDeep(poolInfo)
      const coinBalance = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.coin.mintAddress}.balance`)
      const pcBalance = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.pc.mintAddress}.balance`)
      this.farmInfo.lp.coin.balance = coinBalance
      this.farmInfo.lp.pc.balance = pcBalance
      this.stakeModalOpening = true
    },

    openStakeModalLP(poolInfo: FarmInfo, lp: any) {
      const coin = cloneDeep(lp)
      const lpBalance = get(this.wallet.tokenAccounts, `${lp.mintAddress}.balance`)
      coin.balance = lpBalance

      this.lp = coin
      this.farmInfo = cloneDeep(poolInfo)
      const coinBalance = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.coin.mintAddress}.balance`)
      const pcBalance = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.pc.mintAddress}.balance`)
      this.farmInfo.lp.coin.balance = coinBalance
      this.farmInfo.lp.pc.balance = pcBalance
      this.stakeModalOpeningLP = true
    },

    openAddRewardModal(farm: any) {
      const rewardCoin = farm.farmInfo.reward
      const coin = cloneDeep(rewardCoin)
      const rewardBalance = get(this.wallet.tokenAccounts, `${rewardCoin.mintAddress}.balance`)
      coin.balance = rewardBalance

      this.rewardCoin = coin
      this.farmInfo = cloneDeep(farm.farmInfo)
      this.addRewardModalOpening = true
    },
    async addReward(amount: string) {
      this.adding = true
      const conn = this.$web3
      const wallet = (this as any).$wallet
      const rewardAccountAddress = get(
        this.wallet.tokenAccounts,
        `${this.farmInfo.reward.mintAddress}.tokenAccountAddress`
      )

      let fetchedFarm = await YieldFarm.loadFarm(
        conn,
        new PublicKey(this.farmInfo.poolId),
        new PublicKey(FARM_PROGRAM_ID)
      )

      if (fetchedFarm) {
        //transfer reward amount
        let addRewardAmount: number = Number.parseFloat(amount)
        let userRwardTokenPubkey = new PublicKey(rewardAccountAddress)

        const key = getUnixTs().toString()
        this.$notify.info({
          key,
          message: 'Making transaction...',
          description: '',
          duration: 0
        })
        fetchedFarm
          .addReward(wallet, userRwardTokenPubkey, addRewardAmount * Math.pow(10, this.farmInfo.reward.decimals))
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
                      attrs: {
                        href: `${this.url.explorer}/tx/${txid}`,
                        target: '_blank'
                      }
                    },
                    'here'
                  )
                ])
            })

            const description = `Add ${amount} ${this.farmInfo.reward.name}`
            this.$accessor.transaction.sub({ txid, description })
          })
          .catch((error) => {
            this.$notify.error({
              key,
              message: 'Adding Reward failed',
              description: error.message
            })

            this.$accessor.farm.requestInfos()
            this.$accessor.wallet.getTokenAccounts()
          })
          .finally(() => {
            this.adding = false
            this.addRewardModalOpening = false

            this.$accessor.farm.requestInfos()
            this.$accessor.wallet.getTokenAccounts()
          })
      }
    },
    async payFarmFee(farm: any) {
      this.paying = true
      const conn = this.$web3
      const wallet = (this as any).$wallet
      let key = 'USDC'
      const usdcCoin = TOKENS[key] // to test. real - USDC
      const usdcAccountAddress = get(this.wallet.tokenAccounts, `${usdcCoin.mintAddress}.tokenAccountAddress`)
      const usdcBalance = get(this.wallet.tokenAccounts, `${usdcCoin.mintAddress}.balance`)
      if (usdcAccountAddress === undefined || usdcAccountAddress === '') {
        this.$notify.error({
          key,
          message: 'Paying farm fee failed',
          description: 'Add USDC token in your wallet, please'
        })
        return
      }

      // check balance if wallet has enough fee
      if (usdcBalance < PAY_FARM_FEE) {
        this.$notify.error({
          key,
          message: 'Paying farm fee failed',
          description: 'Your USDC balance is low than farm fee'
        })
        return
      }

      let fetchedFarm = await YieldFarm.loadFarm(
        conn,
        new PublicKey(farm.farmInfo.poolId),
        new PublicKey(FARM_PROGRAM_ID)
      )

      if (fetchedFarm) {
        //pay farm fee
        let userUSDCTokenPubkey = new PublicKey(usdcAccountAddress)

        const key = getUnixTs().toString()
        this.$notify.info({
          key,
          message: 'Making transaction...',
          description: '',
          duration: 0
        })
        fetchedFarm
          .payFarmFee(wallet, userUSDCTokenPubkey, PAY_FARM_FEE * Math.pow(10, usdcCoin.decimals))
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
                      attrs: {
                        href: `${this.url.explorer}/tx/${txid}`,
                        target: '_blank'
                      }
                    },
                    'here'
                  )
                ])
            })

            const description = `Pay ${PAY_FARM_FEE} ${usdcCoin.name}`
            this.$accessor.transaction.sub({ txid, description })
          })
          .catch((error) => {
            this.$notify.error({
              key,
              message: 'Paying farm fee failed',
              description: error.message
            })

            this.$accessor.farm.requestInfos()
            this.$accessor.wallet.getTokenAccounts()
          })
          .finally(() => {
            this.paying = false
            this.$accessor.farm.requestInfos()
            this.$accessor.wallet.getTokenAccounts()
          })
      }
    },

    stake(amount: number) {
      this.staking = true

      const conn = this.$web3
      const wallet = (this as any).$wallet

      const lpAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.mintAddress}.tokenAccountAddress`)
      const rewardAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.reward.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${this.farmInfo.poolId}.stakeAccountAddress`)

      const key = getUnixTs().toString()

      if (amount <= 0) {
        this.$notify.error({
          key,
          message: 'Add liquidity failed',
          description: 'Added LP token amount is 0'
        })
        console.log('added lp amount is 0')
        return
      }

      this.stakeLP(conn, wallet, this.farmInfo, lpAccount, rewardAccount, infoAccount, amount)

      this.staking = false
      this.stakeModalOpeningLP = false
    },
    supplyAndStake(fromCoinAmount: string, toCoinAmount: string, fixedCoin: string) {
      this.staking = true

      const conn = this.$web3
      const wallet = (this as any).$wallet

      const poolInfo = get(this.liquidity.infos, this.farmInfo.lp.mintAddress)

      const lpAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.mintAddress}.tokenAccountAddress`)
      const rewardAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.reward.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${this.farmInfo.poolId}.stakeAccountAddress`)
      // @ts-ignore
      const fromCoinAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.coin.mintAddress}.tokenAccountAddress`)
      // @ts-ignore
      const toCoinAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.pc.mintAddress}.tokenAccountAddress`)

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      let txStatus = ''
      addLiquidity(
        conn,
        wallet,
        poolInfo,
        fromCoinAccount,
        toCoinAccount,
        lpAccount,
        this.farmInfo.lp.coin,
        this.farmInfo.lp.pc,
        fromCoinAmount,
        toCoinAmount,
        fixedCoin
      )
        .then(async (txid) => {
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

          this.suppling = true

          const description = `Add liquidity for ${fromCoinAmount} ${this.farmInfo.lp.coin?.symbol} and ${toCoinAmount} ${this.farmInfo.lp.pc?.symbol}`
          this.$accessor.transaction.sub({ txid, description })

          txStatus = this.$accessor.transaction.history[txid].status
          let totalDelayTime = 0
          while (txStatus === 'Pending' && totalDelayTime < 45000) {
            let delayTime = 500
            await this.delay(delayTime)
            totalDelayTime += delayTime
            txStatus = this.$accessor.transaction.history[txid].status
          }

          if (txStatus === 'Fail') {
            console.log('add lp failed')
            return
          }

          //update wallet token account infos

          let delayForUpdate = 500
          await this.$accessor.wallet.getTokenAccounts()
          this.stakeModalOpening = false
          this.staking = false
          await this.delay(400)

          this.stakeModalOpeningLP = true
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Add liquidity failed',
            description: error.message
          })
        })
        .finally(async () => {
          this.suppling = false
        })
    },
    async stakeLP(
      conn: any,
      wallet: any,
      farmInfo: any,
      lpAccount: any,
      rewardAccount: any,
      infoAccount: any,
      amount: number
    ) {
      const key = getUnixTs().toString()

      deposit(conn, wallet, farmInfo, lpAccount, rewardAccount, infoAccount, amount)
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

          const description = `Stake ${amount} ${this.farmInfo.lp.name}`
          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Stake failed',
            description: error.message
          })
          this.tempInfo = {
            conn: conn,
            wallet: wallet,
            farmInfo: farmInfo,
            lpAccount: lpAccount,
            rewardAccount: rewardAccount,
            infoAccount: infoAccount,
            amount: amount
          }
          this.stakeLPError = true
          this.$accessor.farm.requestInfos()
          this.$accessor.wallet.getTokenAccounts()
        })
        .finally(() => {
          this.staking = false
          this.stakeModalOpening = false
          this.farmInfo = null
          this.$accessor.farm.requestInfos()
          this.$accessor.wallet.getTokenAccounts()
        })
    },
    onRetryStakeLP() {
      this.stakeLPError = false
      if (!this.tempInfo) {
        return
      }

      this.stakeLP(
        this.tempInfo.conn,
        this.tempInfo.wallet,
        this.tempInfo.farmInfo,
        this.tempInfo.lpAccount,
        this.tempInfo.rewardAccount,
        this.tempInfo.infoAccount,
        this.tempInfo.amount
      )
      this.tempInfo = null
    },
    onRemoveLiquidity() {
      this.stakeLPError = false
      if (!this.tempInfo) {
        return
      }

      const fromCoinAccount = get(
        this.wallet.tokenAccounts,
        `${this.tempInfo.farmInfo.lp.coin.mintAddress}.tokenAccountAddress`
      )
      const toCoinAccount = get(
        this.wallet.tokenAccounts,
        `${this.tempInfo.farmInfo.lp.pc.mintAddress}.tokenAccountAddress`
      )
      this.removeLP(
        this.tempInfo.conn,
        this.tempInfo.wallet,
        this.tempInfo.farmInfo.lp,
        this.tempInfo.lpAccount,
        fromCoinAccount,
        toCoinAccount,
        this.tempInfo.amount
      )

      this.tempInfo = null
    },
    async delay(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },
    cancelStake() {
      this.lp = null
      this.farmInfo = null
      this.stakeModalOpening = false
    },
    cancelStakeLP() {
      this.lp = null
      this.farmInfo = null
      this.stakeModalOpeningLP = false
    },
    cancelCreateFarm() {
      this.createFarmModalOpening = false
    },
    onNothing() {
      this.stakeLPError = false
      this.tempInfo = null
    },
    cancelAddReward() {
      this.rewardCoin = null
      this.farmInfo = null
      this.addRewardModalOpening = false
    },

    openUnstakeModal(poolInfo: FarmInfo, lp: any, lpBalance: any) {
      const coin = cloneDeep(lp)
      coin.balance = lpBalance

      this.lp = coin
      this.farmInfo = cloneDeep(poolInfo)

      let ammId = this.getAmmId(poolInfo)
      const currentPoolInfo = Object.values(this.$accessor.liquidity.infos).find((p: any) => p.ammId === ammId)
      const totalSupply = getTotalSupply(currentPoolInfo)

      const pcBalance = (
        (getPcBalance(currentPoolInfo) * parseFloat(lpBalance.toEther().toString())) /
        totalSupply
      ).toFixed(3)
      const coinBalance = (
        (getCoinBalance(currentPoolInfo) * parseFloat(lpBalance.toEther().toString())) /
        totalSupply
      ).toFixed(3)
      set(this.unstakePoolInfo, 'pcBalance', pcBalance)
      set(this.unstakePoolInfo, 'coinBalance', coinBalance)
      set(this.unstakePoolInfo, 'totalSupply', totalSupply)
      set(this.unstakePoolInfo, 'pcSymbol', get(currentPoolInfo, 'pc.symbol'))
      set(this.unstakePoolInfo, 'coinSymbol', get(currentPoolInfo, 'coin.symbol'))

      this.unstakeModalOpening = true
    },
    removeRewards(farm: any) {
      const conn = this.$web3
      const wallet = (this as any).$wallet

      const rewardAccount = get(this.wallet.tokenAccounts, `${farm.farmInfo.reward.mintAddress}.tokenAccountAddress`)

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      YieldFarm.removeRewards(conn, wallet, farm.farmInfo, rewardAccount)
        .then(async (txid) => {
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

          const description = `Remove Rewards`
          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Remove Rewards failed',
            description: error.message
          })
          this.$accessor.farm.requestInfos()
          this.$accessor.wallet.getTokenAccounts()
        })
        .finally(() => {})
    },
    unstakeAndRemove(amount: string) {
      this.unstaking = true

      const conn = this.$web3
      const wallet = (this as any).$wallet
      const coin = this.farmInfo.lp.coin
      const pc = this.farmInfo.lp.pc
      const lp = this.farmInfo.lp

      const lpAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.mintAddress}.tokenAccountAddress`)
      const rewardAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.reward.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${this.farmInfo.poolId}.stakeAccountAddress`)
      const fromCoinAccount = get(this.wallet.tokenAccounts, `${coin.mintAddress}.tokenAccountAddress`)
      const toCoinAccount = get(this.wallet.tokenAccounts, `${pc.mintAddress}.tokenAccountAddress`)

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      withdraw(conn, wallet, this.farmInfo, lpAccount, rewardAccount, infoAccount, amount)
        .then(async (txid) => {
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

          const description = `Unstake ${amount} ${lp.name}`
          this.$accessor.transaction.sub({ txid, description })

          let txStatus = this.$accessor.transaction.history[txid].status
          while (txStatus === 'Pending') {
            await this.delay(500)
            txStatus = this.$accessor.transaction.history[txid].status
            await this.delay(500)
          }
          if (txStatus === 'Fail') {
            console.log('unstake transaction failed')
            this.unstaking = false
            this.unstakeModalOpening = false
            return
          }

          //update wallet token account infos
          this.$accessor.wallet.getTokenAccounts()
          let delayForUpdate = 1000
          await this.delay(delayForUpdate)

          let value = get(this.wallet.tokenAccounts, `${lp.mintAddress}.balance`)
          value = value.wei.toNumber() / Math.pow(10, value.decimals)
          if (value <= 0) {
            console.log('remove lp amount is 0')
            this.unstaking = false
            this.unstakeModalOpening = false
            return
          }
          value = value.toString()

          this.removeLP(conn, wallet, lp, lpAccount, fromCoinAccount, toCoinAccount, value)
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Unstake failed',
            description: error.message
          })
          this.$accessor.farm.requestInfos()
          this.$accessor.wallet.getTokenAccounts()
        })
        .finally(() => {})
    },
    removeLP(conn: any, wallet: any, lp: any, lpAccount: any, fromCoinAccount: any, toCoinAccount: any, value: any) {
      const key = getUnixTs().toString()
      const poolInfo = get(this.liquidity.infos, lp.mintAddress)
      //remove whole lp amount
      removeLiquidity(conn, wallet, poolInfo, lpAccount, fromCoinAccount, toCoinAccount, value)
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

          const description = `Remove liquidity for ${value} ${lp.name}`

          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Remove liquidity failed',
            description: error.message
          })

          this.$accessor.farm.requestInfos()
          this.$accessor.wallet.getTokenAccounts()
        })
        .finally(() => {
          this.unstaking = false
          this.unstakeModalOpening = false
          this.$accessor.farm.requestInfos()
          this.$accessor.wallet.getTokenAccounts()
        })
    },

    cancelUnstake() {
      this.lp = null
      this.farmInfo = null
      this.unstakeModalOpening = false
    },
    getAmmId(farmInfo: FarmInfo) {
      //get liquidity pool info
      let liquidityPoolInfo: LiquidityPoolInfo = LIQUIDITY_POOLS.find(
        (item) => item.lp.mintAddress === farmInfo.lp.mintAddress
      ) as any

      //check liquidity pool
      if (liquidityPoolInfo == undefined) {
        console.log('find liquidity pool error')
        return ''
      }
      return liquidityPoolInfo.ammId
    },

    harvest(farmInfo: FarmInfo, idx: number) {
      this.harvesting[idx] = true

      const conn = this.$web3
      const wallet = (this as any).$wallet

      const lpAccount = get(this.wallet.tokenAccounts, `${farmInfo.lp.mintAddress}.tokenAccountAddress`)
      const rewardAccount = get(this.wallet.tokenAccounts, `${farmInfo.reward.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${farmInfo.poolId}.stakeAccountAddress`)

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      deposit(conn, wallet, farmInfo, lpAccount, rewardAccount, infoAccount, '0')
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

          const description = `Harvest ${farmInfo.reward.symbol} from ${farmInfo.lp.name}`
          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Harvest failed',
            description: error.message
          })

          this.$accessor.farm.requestInfos()
          this.$accessor.wallet.getTokenAccounts()
        })
        .finally(() => {
          this.$accessor.farm.requestInfos()
          this.harvesting[idx] = false
          this.$accessor.farm.requestInfos()
          this.$accessor.wallet.getTokenAccounts()
        })
    },
    getCountdownFromPeriod(period: number) {
      let remain = period
      let days = Math.floor(remain / (24 * 3600))
      remain = remain % (24 * 3600)
      let hours = Math.floor(remain / 3600)
      remain = remain % 3600
      let minutes = Math.floor(remain / 60)
      remain = remain % 60
      let seconds = remain

      return '' + days + 'd : ' + hours + 'h : ' + minutes + 'm'
    },
    setSortOption(mode: string, asc: boolean) {
      this.sortMethod = mode
      this.sortAsc = asc
      this.showOptionMenu = false
      this.updateFarms()
    },
    hideCollapse() {
      this.showCollapse = []
    },
    reloadTimer() {
      this.activeSpinning = true
      setTimeout(() => {
        this.activeSpinning = false
      }, 1000)
      this.$accessor.farm.requestInfos()
      this.$accessor.wallet.getTokenAccounts()
    },
    showMore(idx: number) {
      if (idx != this.currentShowMore) {
        this.showMoreMenu = this.showMoreMenu.map((item) => {
          return false
        })
      }
      this.showMoreMenu = this.showMoreMenu.map((item, i) => {
        if (i === idx) {
          this.currentShowMore = idx
          return !item
        }
        return item
      })
    },
    hideMore() {
      if (this.currentShowMore != -1) {
        this.showMoreMenu = this.showMoreMenu.map((item) => {
          return false
        })
        this.currentShowMore = -1
      }
    },
    hideGuide() {
      this.showGuide = false
      // window.localStorage.pool_guide = true
    }
  }
})
</script>

<style lang="less" scoped>
// global stylesheet
.farm {
  .info-icon {
    display: flex;
    align-items: center;
    width: 12px;
    height: 12px;
    margin-left: 5px;
  }

  .pagination-container {
    text-align: center;
    width: 100%;
    margin-top: 30px;

    .pagination-body {
      width: 80%;
      display: inline-block;
    }
  }

  .btn-container {
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 48px;
    padding: 3px;
    width: 100px;
    height: auto;
    margin-bottom: 8px;

    @media @max-lg-tablet {
      margin-bottom: 0;
      margin-right: 8px;
    }

    @media @max-sl-mobile {
      width: calc((100% - 24px) / 2);
    }

    &:last-child {
      margin-bottom: 0;
      margin-right: 0;
    }
  }

  .btn-transparent {
    background: transparent;
    padding: 4.5px 0;
    border-radius: 48px;
    border: none;
    width: 100%;
  }

  .btn-primary {
    background: rgba(23, 32, 88, 0.9);
    padding: 4.5px 0;
    border-radius: 48px;
    border: none;
    width: 100%;
    color: #fff;

    &:hover {
      background: rgba(23, 32, 88, 0.9);
    }

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

  .option-collapse-menu {
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

    .option-collapse-item {
      padding: 16px 0;
      border-bottom: 1px solid #c4c4c420;

      &.option-toggle {
        display: none !important;

        @media @max-md-tablet {
          display: flex !important;
        }
      }

      &:last-child {
        border-bottom: 0;
      }

      &.active-item {
        color: @color-petrol500;
      }
    }
  }

  .lp-icons {
    display: flex;
    align-items: center;

    @media @max-lg-tablet {
      justify-content: space-between;
    }

    .lp-icons-group {
      background: @gradient-color-outline;
      background-origin: border-box;
      border-radius: 8px;
      padding: 2px;
      width: fit-content;

      .icons {
        height: 100%;
        background-color: @color-blue800;
        border-radius: 8px;
        padding: 4px 6px;
        display: flex;
        align-items: center;

        img {
          width: 20px;
          height: 20px;
          border-radius: 50%;
        }

        span {
          margin-left: 5px;
          margin-right: 5px;

          &:last-child {
            margin-right: 0;
          }
        }
      }
    }
  }

  .farm-labels {
    .label {
      border-radius: 6px;
      padding: 4px;
      width: fit-content;
      font-size: 10px;
      line-height: 12px;

      &.labelized {
        background: @color-labelized;
      }

      &.permissionless {
        background: @color-permissionless;
      }

      &.ended {
        border: 2px solid @color-ended;
        color: @color-ended;
      }

      &.dual {
        border: 2px solid @color-dual;
        color: @color-dual;
      }

      &.new {
        border: 2px solid @color-new;
        color: @color-new;
      }

      &.ended,
      &.dual,
      &.new {
        padding: 2px 6px;
        margin-top: 8px;
      }
    }
  }

  .option-toggle {
    .toggle-label {
      position: relative;
      opacity: 0.5;
      color: #fff;

      &.active-label {
        opacity: 1;
      }
    }
  }

  .btn-show-collapse {
    text-align: center;
    cursor: pointer;
    border-bottom: none;

    @media @max-lg-tablet {
      padding: 5px;
    }
  }

  .btn-hide-collapse {
    text-align: center;
    cursor: pointer;
    border-bottom: none;

    .btn-hide-collapse-icon {
      transform: rotate(180deg);
    }
  }

  .social-link {
    color: #fff;

    .social-icon {
      width: 18px;
      height: 18px;
      margin-left: 8px;
    }
  }
}

// class stylesheet
.farm.container {
  margin-top: 20px;
  padding: 0 !important;

  .card {
    .card-body {
      padding: 0;

      .guide-card {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: calc(100% - 40px);
        max-width: 420px;
        padding: 18px;
        background: @gradient-color03;
        border-radius: 18px;
        z-index: 999;

        @media @max-sl-mobile {
          left: unset;
        }

        .guide-content {
          position: relative;

          .guide-detail {
            background: @color-blue700;
            padding: 8px 18px;
            margin-top: 8px;
            border-radius: 18px;

            @media @max-sl-mobile {
              padding: 8px;
            }

            .highlight {
              color: @color-petrol500;
            }

            .note-btn {
              background: @gradient-color01;
              box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
              border-radius: 48px;
              padding: 8px;
              border: none;
              height: auto;

              &:hover {
                background: @gradient-color02;
              }
            }
          }

          .close-icon {
            position: absolute;
            top: 0;
            right: 0;
          }

          .note-icon {
            width: 16px;
            height: 16px;
            margin-right: 8px;
          }
        }
      }

      .farm-content {
        .farm-option-bar {
          width: fit-content;
          float: right;
          margin: -60px 0 20px 0;

          .option-filter-group {
            position: relative;
            display: flex;
            align-items: center;

            .option-filter {
              border: 2px solid @color-blue500;
              border-radius: 8px;
              padding: 0 8px;
              height: 40px;
              margin-left: 18px;

              @media @max-sl-mobile {
                height: 32px;
                padding: 0 4px;
              }

              &:first-child {
                margin-left: 0;
              }

              &.option-filter-fixed {
                width: 40px;

                @media @max-sl-mobile {
                  width: 32px;
                }
              }

              &.option-filter-collapse {
                display: none !important;

                @media @max-md-tablet {
                  display: flex !important;
                }
              }

              &.option-toggle {
                @media @max-md-tablet {
                  display: none !important;
                }
              }

              &.option-sort {
                @media @max-md-tablet {
                  display: none !important;
                }
              }

              .option-filter-sort {
                letter-spacing: 0.15px;

                label {
                  color: #eae8f1;
                  opacity: 0.5;
                  margin-right: 8px;
                }

                .sort-detail {
                  display: flex;
                  align-items: center;

                  .arrow-icon {
                    margin-left: 8px;
                  }
                }
              }
            }

            .option-collapse {
              display: none;

              @media @max-md-tablet {
                display: block;
              }
            }
          }
        }

        .farm-table {
          .farm-item {
            display: flex;
            background: rgba(23, 32, 88, 0.9);
            border-radius: 8px;
            padding: 18px;
            margin-top: 8px;
            margin-left: 0 !important;
            margin-right: 0 !important;
            border: 3px solid transparent;

            &:hover {
              border-color: @color-blue500;
            }

            &:first-child {
              margin-top: 0;
            }

            .fcs-container {
              padding: 0 !important;
            }

            .state {
              .title {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                text-align: right;
                color: rgba(255, 255, 255, 0.6);
              }

              .value {
                margin-top: 4px;
                text-align: right;
              }

              .show-more {
                width: 20px;
                position: relative;

                .option-collapse-menu {
                  top: 0;
                  right: 25px;
                }
              }
            }

            .farm-infos {
              margin-top: 15px;

              @media @max-lg-tablet {
                margin-top: 0;
              }

              .farm-info-group {
                display: flex;
                align-items: center;
                color: rgba(255, 255, 255, 0.8);

                .farm-info-img {
                  width: 20px;
                  display: flex;
                }
              }
            }

            .details {
              top: 50%;
              transform: translate(0, -50%);
              position: absolute;
              right: 17px;
              margin-top: unset;
            }
          }

          .farm-collapse-mobile,
          .farm-collapse-tablet {
            .farm-collapse-item {
              margin-bottom: 8px;

              &:last-child {
                margin-bottom: 0;
              }

              .state {
                .title {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  text-align: center;
                  color: rgba(255, 255, 255, 0.6);
                }

                .value {
                  margin-top: 4px;
                  text-align: center;
                }

                .farm-infos {
                  .farm-info-group {
                    display: flex;
                    align-items: center;
                    color: rgba(255, 255, 255, 0.8);
                    margin-bottom: 4px;

                    &:last-child {
                      margin-bottom: 0;
                    }

                    .farm-info-img {
                      width: 20px;
                      display: flex;
                    }
                  }
                }
              }

              .social-link {
                margin-right: 18px;

                &:last-child {
                  margin-right: 0;
                }
              }
            }

            .farm-collapse-content {
              background: @color-blue800;
              padding: 16px;
              margin-bottom: 18px;
              border-radius: 8px;

              .farm-collapse-item {
                margin-bottom: 18px;
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
.farm {
  // ant collapse
  .ant-collapse {
    border: none;
    background: transparent;

    .ant-collapse-item {
      background: rgba(23, 32, 88, 0.9);
      border-radius: 8px;
      overflow: hidden;
      padding: 8px;
      border-bottom: none;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .ant-collapse-header {
        .ant-collapse-arrow {
          display: none;
        }
      }

      .ant-collapse-content {
        border: none !important;
        background: transparent !important;
        padding: 8px;
        margin: 8px 0;
      }
    }

    .ant-collapse-item-disabled > .ant-collapse-header {
      color: unset;
    }
  }

  // ant switch
  .ant-switch {
    margin: 0 8px;
  }

  .farm-table {
    .ant-collapse {
      .ant-collapse-item {
        .ant-collapse-header {
          padding: 0 !important;
        }

        .ant-collapse-content {
          .ant-collapse-content-box {
            padding: 0;
          }
        }
      }
    }
  }
}
</style>