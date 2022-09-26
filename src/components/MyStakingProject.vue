<template>
  <div class="staking container">
    <BaseDetailModal
      :show="baseModalShow"
      :estimatedapy="estimatedAPY"
      @onCancel="() => (baseModalShow = false)"
      @onSelect="onBaseDetailSelect"
    />

    <StakeModal
      :show="stakeModalShow"
      :enddatemin="endDateOfLock"
      :crpbalance="crpbalance"
      :userStaked="userStaked"
      :estimatedapy="estimatedAPY"
      @onCancel="
        () => {
          this.stakeModalShow = false
          this.getGlobalState()
          this.getUserState()
        }
      "
    />

    <StakeProjectModal
      :show="stakeProjectModalShow"
      :enddatemin="endDateOfLock"
      :coinbalance="coinbalance"
      :mint="mint"
      :symbol="symbol"
      :userStaked="userStaked"
      :estimatedapy="estimatedAPY"
      :stakeModalTitle="stakeModalTitle"
      @onCancel="
        () => {
          this.stakeProjectModalShow = false
          this.flush()
        }
      "
    />

    <div class="card">
      <div class="card-body">
        <div class="staking-content">
          <div class="staking-projects">
            <div class="staking-table isDesktop">
              <Row class="staking-item" v-for="(project, idx) in projectInfos" :key="project.key" :gutter="16">
                <Col class="fcs-container" span="6">
                  <div class="state">
                    <div class="lp-icons">
                      <div class="lp-icons-group">
                        <div class="icons">
                          <CoinIcon :mint-address="project.info.token.mintAddress" />
                          <span class="font-medium weight-semi">{{ project.info.token.symbol }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="staking-infos">
                      <div class="staking-info-group font-xsmall">
                        <div class="staking-info-img">
                          <img src="@/assets/icons/lock.svg" />
                        </div>
                        Lock duration : {{ project.info.lockDuration / 86400 }} days
                      </div>
                    </div>

                    <div class="staking-infos">
                      <div class="staking-info-group font-xsmall">
                        <div class="staking-info-img">
                          <img src="@/assets/icons/sandglass.svg" />
                        </div>
                        End of Emission : {{ project.lastRewardTime }}
                      </div>
                    </div>
                  </div>
                </Col>

                <Col class="fce-container" span="2">
                  <div class="state">
                    <div class="staking-labels">
                      <div class="label open weight-semi" v-if="project.active == true">Open Staking</div>
                      <div class="label close weight-semi" v-if="project.active != true">Closed</div>
                    </div>
                  </div>
                </Col>

                <Col class="fce-container" span="3">
                  <div class="state">
                    <div class="title font-small weight-semi spacing-large">Total Deposited</div>
                    <div class="value font-medium weight-semi spacing-small">
                      ${{
                        (Math.round(project.info.tvl * 1000) / 1000).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }}
                    </div>
                  </div>
                </Col>

                <Col class="fce-container" span="3" v-if="project.active == true">
                  <div class="state">
                    <div class="title font-small weight-semi spacing-large">Total APR</div>
                    <div class="value font-medium weight-semi spacing-small">
                      <img v-if="project.info.apy > 300" src="@/assets/icons/fire.svg" />
                      <img v-if="project.info.apy > 1000" src="@/assets/icons/fire.svg" />
                      {{ (Math.round(project.info.apy * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}%
                    </div>
                  </div>
                </Col>

                <Col class="fce-container" span="3" v-if="project.active != true">
                  <div class="state">
                    <div class="title font-small weight-semi spacing-large">Total APR</div>
                    <div class="value font-medium weight-semi spacing-small">&mdash;</div>
                  </div>
                </Col>

                <Col class="fce-container" span="4">
                  <div class="state">
                    <div class="title font-small weight-semi spacing-large">Pending Rewards</div>
                    <div class="value font-medium weight-semi spacing-small">
                      {{ ((
                        !wallet.connected || 
                        (Math.round(project.info.reward.toString().replace(/,/g, '') * 100000) / 100000) &lt; 0 
                        ) ? project.info.token.symbol + ' ' + 0 : project.info.token.symbol + ' ' + (Math.round(project.info.reward.toString().replace(/,/g, '') * 100000) / 100000)) }}
                    </div>
                  </div>
                </Col>

                <Col class="fce-container" span="3">
                  <div class="state">
                    <div class="title font-small weight-semi spacing-large">
                      Token Staked
                      <Tooltip placement="bottomLeft" v-if="project.info.lastTimeLocked > 0">
                        <template slot="title">
                          <div>Lock until {{ project.lastTimeLocked }}</div>
                        </template>
                        <div class="info-icon">
                          <img src="@/assets/icons/info.svg" />
                        </div>
                      </Tooltip>
                    </div>
                    <div class="value font-medium weight-semi spacing-small">
                      {{
                        !wallet.connected
                          ? 0
                          : project.info.token.symbol +
                            ' ' +
                            (Math.round(project.info.amount * 1000) / 1000)
                              .toString()
                              .replace(/,/g, '')
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }}
                    </div>
                  </div>
                </Col>

                <Col class="state fcsb-container" span="3">
                  <div class="staking-btn-group">
                    <div class="btn-container project">
                      <Button
                        v-if="wallet.connected && project.active == true"
                        class="btn-transparent font-small weight-bold"
                        id="dep"
                        @click="stakeToken(project)"
                        >Stake</Button
                      >

                      <Button
                        v-else-if="wallet.connected && project.active == false"
                        class="btn-transparent font-small weight-bold"
                        id="dep"
                        disabled
                        >Stake</Button
                      >

                      <Button v-else class="btn-transparent font-small weight-bold" @click="$accessor.wallet.openModal"
                        >Stake</Button
                      >
                    </div>

                    <div class="btn-container project">
                      <Button
                        class="btn-primary font-small weight-bold"
                        :loading="harvesting[idx]"
                        :disabled="!wallet.connected || project.info.reward <= 0"
                        @click="harvestRewards(project.info.token.mintAddress, project.info.token.symbol)"
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
                      <div class="option-collapse-item text-center font-medium weight-semi icon-cursor">
                        <a class="social-link fcc-container" href="#" target="_blank">
                          Share
                          <img class="social-icon" src="@/assets/icons/share.svg" />
                        </a>
                      </div>
                      <div class="option-collapse-item text-center font-medium weight-semi icon-cursor">
                        <a class="social-link fcc-container" href="#" target="_blank">
                          Twitter
                          <img class="social-icon" src="@/assets/icons/twitter-white.svg" />
                        </a>
                      </div>
                      <div class="option-collapse-item">
                        <Button
                          class="btn-link font-medium weight-semi icon-cursor text-center"
                          :loading="unstaking[idx]"
                          :disabled="!wallet.connected"
                          @click="unstakeTokenProject(project.info.token.mintAddress)"
                        >
                          Unstake
                        </Button>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            <div class="staking-table isTablet">
              <Collapse v-model="showCollapse" class="staking-collapse-tablet" accordion>
                <CollapsePanel v-for="(project, idx) in projectInfos" v-show="true" :key="project.key">
                  <Row slot="header" class="staking-collapse-tablet-head">
                    <Col class="staking-collapse-item fcc-container" span="24">
                      <Col class="state text-center" span="8">
                        <div class="lp-icons">
                          <div class="lp-icons-group">
                            <div class="icons">
                              <CoinIcon :mint-address="project.info.token.mintAddress" />
                              <span class="font-medium weight-semi">{{ project.info.token.symbol }}</span>
                            </div>
                          </div>
                        </div>
                      </Col>

                      <Col class="state text-center" span="2">
                        <div class="staking-labels">
                          <div class="label open weight-semi" v-if="project.active == true">Open Staking</div>
                          <div class="label close weight-semi" v-if="project.active != true">Closed</div>
                        </div>
                      </Col>

                      <Col class="state text-center" span="5">
                        <div class="title font-small weight-semi spacing-large">Total Deposited</div>
                        <div class="value font-medium weight-semi spacing-small">
                          ${{
                            Math.round(project.info.tvl)
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          }}
                        </div>
                      </Col>

                      <Col class="state text-center" span="4">
                        <div class="title font-small weight-semi spacing-large">Total APR</div>
                        <div v-if="project.active" class="value font-medium weight-semi spacing-small">
                          <img v-if="project.info.apy > 300" src="@/assets/icons/fire.svg" />
                          <img v-if="project.info.apy > 1000" src="@/assets/icons/fire.svg" />
                          {{ Math.round(project.info.apy * 100) / 100 }}%
                        </div>
                        <div v-else class="value font-medium weight-semi spacing-small">&mdash;</div>
                      </Col>

                      <Col class="state text-center" span="5">
                        <div class="title font-small weight-semi spacing-large">Pending Reward</div>
                        <div class="value font-medium weight-semi spacing-small">
                          {{ ((
                            !wallet.connected || 
                            (Math.round(project.info.reward.toString().replace(/,/g, '') * 100000) / 100000) &lt; 0 
                            ) ? project.info.token.symbol + ' ' + 0 : project.info.token.symbol + ' ' + (Math.round(project.info.reward.toString().replace(/,/g, '') * 100000) / 100000).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')) }}
                        </div>
                      </Col>
                    </Col>

                    <Col
                      v-if="project.key != showCollapse"
                      class="staking-collapse-item btn-show-collapse icon-cursor text-center"
                      span="24"
                    >
                      <img src="@/assets/icons/arrow-down-blue.svg" />
                    </Col>
                  </Row>

                  <Row class="staking-collapse-content">
                    <Col class="staking-collapse-item" span="24">
                      <Col class="state" span="14">
                        <div class="staking-infos">
                          <div class="staking-info-group font-xsmall">
                            <div class="staking-info-img">
                              <img src="@/assets/icons/lock.svg" />
                            </div>
                            Lock duration : {{ project.info.lockDuration / 86400 }} days
                          </div>
                        </div>

                        <div class="staking-infos">
                          <div class="staking-info-group font-xsmall">
                            <div class="staking-info-img">
                              <img src="@/assets/icons/sandglass.svg" />
                            </div>
                            End of Emission : {{ project.lastRewardTime }}
                          </div>
                        </div>
                      </Col>
                      <Col class="state" span="10">
                        <div class="title font-small weight-semi spacing-large">
                          Token Staked
                          <Tooltip placement="bottomLeft" v-if="project.info.lastTimeLocked > 0">
                            <template slot="title">
                              <div>Lock until {{ project.lastTimeLocked }}</div>
                            </template>
                            <div class="info-icon">
                              <img src="@/assets/icons/info.svg" />
                            </div>
                          </Tooltip>
                        </div>
                        <div class="value font-medium weight-semi spacing-small">
                          {{ !wallet.connected ? 0 : project.info.token.symbol + ' ' + project.info.amount }}
                        </div>
                      </Col>
                    </Col>

                    <Col class="staking-collapse-item fcsb-container" span="24">
                      <div class="fcc-container">
                        <a
                          class="social-link fcc-container font-medium weight-semi icon-cursor"
                          href="#"
                          target="_blank"
                        >
                          Share
                          <img class="social-icon" src="@/assets/icons/share.svg" />
                        </a>
                        <a
                          class="social-link fcc-container font-medium weight-semi icon-cursor"
                          href="#"
                          target="_blank"
                        >
                          Twitter
                          <img class="social-icon" src="@/assets/icons/twitter-white.svg" />
                        </a>
                      </div>

                      <div class="fcc-container">
                        <div class="btn-container project">
                          <Button
                            v-if="wallet.connected && project.active == true"
                            class="btn-transparent font-small weight-bold"
                            id="dep"
                            @click="stakeToken(project)"
                            >Stake</Button
                          >

                          <Button
                            v-else-if="wallet.connected && project.active == false"
                            class="btn-transparent font-small weight-bold"
                            id="dep"
                            disabled
                            >Stake</Button
                          >

                          <Button
                            v-else
                            class="btn-transparent font-small weight-bold"
                            @click="$accessor.wallet.openModal"
                            >Stake</Button
                          >
                        </div>

                        <div class="btn-container project">
                          <Button
                            class="btn-primary font-small weight-bold"
                            :loading="harvesting[idx]"
                            :disabled="!wallet.connected || project.info.reward <= 0"
                            @click="harvestRewards(project.info.token.mintAddress, project.info.token.symbol)"
                          >
                            Harvest
                          </Button>
                        </div>

                        <div class="btn-container project">
                          <Button
                            class="btn-primary font-small weight-bold"
                            :loading="unstaking[idx]"
                            :disabled="!wallet.connected"
                            @click="unstakeTokenProject(project.info.token.mintAddress)"
                          >
                            Unstake
                          </Button>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <div class="btn-hide-collapse icon-cursor text-center" @click="hideCollapse">
                    <img class="btn-hide-collapse-icon" src="@/assets/icons/arrow-down-blue.svg" />
                  </div>
                </CollapsePanel>
              </Collapse>
            </div>

            <div class="staking-table isMobile">
              <Collapse v-model="showCollapse" class="staking-collapse-mobile" accordion>
                <CollapsePanel v-for="(project, idx) in projectInfos" v-show="true" :key="project.key">
                  <Row slot="header" class="staking-collapse-mobile-head">
                    <Col class="staking-collapse-item" span="24">
                      <div class="lp-icons">
                        <div class="lp-icons-group">
                          <div class="icons">
                            <CoinIcon :mint-address="project.info.token.mintAddress" />
                            <span class="font-medium weight-semi">{{ project.info.token.symbol }}</span>
                          </div>
                        </div>
                        <div class="staking-labels">
                          <div class="label open weight-semi" v-if="project.active == true">Open Staking</div>
                          <div class="label close weight-semi" v-if="project.active != true">Closed</div>
                        </div>
                      </div>
                    </Col>

                    <Col class="staking-collapse-item" span="24">
                      <Col class="state text-center" span="8">
                        <div class="title font-small weight-semi spacing-large">Total Deposited</div>
                        <div class="value font-medium weight-semi spacing-small">
                          ${{
                            Math.round(project.info.tvl)
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          }}
                        </div>
                      </Col>

                      <Col class="state text-center" span="8" v-if="project.active == true">
                        <div class="title font-small weight-semi spacing-large">Total APR</div>
                        <div class="value font-medium weight-semi spacing-small">
                          <img v-if="project.info.apy > 300" src="@/assets/icons/fire.svg" />
                          <img v-if="project.info.apy > 1000" src="@/assets/icons/fire.svg" />
                          {{ Math.round(project.info.apy * 100) / 100 }}%
                        </div>
                      </Col>

                      <Col class="state text-center" span="8" v-if="project.active != true">
                        <div class="title font-small weight-semi spacing-large">Total APR</div>
                        <div class="value font-medium weight-semi spacing-small">&mdash;</div>
                      </Col>

                      <Col class="state text-center" span="8">
                        <div class="title font-small weight-semi spacing-large">Pending Reward</div>
                        <div class="value font-medium weight-semi spacing-small">
                          {{ ((
                            !wallet.connected || 
                            (Math.round(project.info.reward.toString().replace(/,/g, '') * 100000) / 100000) &lt; 0 
                            ) ? project.info.token.symbol + ' ' + 0 : project.info.token.symbol + ' ' + (Math.round(project.info.reward.toString().replace(/,/g, '') * 100000) / 100000)) }}
                        </div>
                      </Col>
                    </Col>

                    <Col
                      v-if="project.key != showCollapse"
                      class="staking-collapse-item btn-show-collapse icon-cursor text-center"
                      span="24"
                    >
                      <img src="@/assets/icons/arrow-down-blue.svg" />
                    </Col>
                  </Row>

                  <Row class="staking-collapse-content">
                    <Col class="staking-collapse-item" span="24">
                      <Col class="state" span="14">
                        <div class="staking-infos">
                          <div class="staking-info-group font-xsmall">
                            <div class="staking-info-img">
                              <img src="@/assets/icons/lock.svg" />
                            </div>
                            Lock duration : {{ project.info.lockDuration / 86400 }} days
                          </div>
                        </div>

                        <div class="staking-infos">
                          <div class="staking-info-group font-xsmall">
                            <div class="staking-info-img">
                              <img src="@/assets/icons/sandglass.svg" />
                            </div>
                            End of Emission : {{ project.lastRewardTime }}
                          </div>
                        </div>
                      </Col>
                      <Col class="state" span="10">
                        <div class="title font-small weight-semi spacing-large">
                          Token Staked
                          <Tooltip placement="bottomLeft" v-if="project.info.lastTimeLocked > 0">
                            <template slot="title">
                              <div>Lock until {{ project.lastTimeLocked }}</div>
                            </template>
                            <div class="info-icon">
                              <img src="@/assets/icons/info.svg" />
                            </div>
                          </Tooltip>
                        </div>
                        <div class="value font-medium weight-semi spacing-small">
                          {{ !wallet.connected ? 0 : project.info.token.symbol + ' ' + project.info.amount }}
                        </div>
                      </Col>
                    </Col>

                    <Col class="staking-collapse-item fcc-container" span="24">
                      <div class="btn-container project">
                        <Button
                          v-if="wallet.connected && project.active == true"
                          class="btn-transparent font-small weight-bold"
                          id="dep"
                          @click="stakeToken(project)"
                          >Stake</Button
                        >

                        <Button
                          v-else-if="wallet.connected && project.active == false"
                          class="btn-transparent font-small weight-bold"
                          id="dep"
                          disabled
                          >Stake</Button
                        >

                        <Button
                          v-else
                          class="btn-transparent font-small weight-bold"
                          @click="$accessor.wallet.openModal"
                          >Stake</Button
                        >
                      </div>

                      <div class="btn-container project">
                        <Button
                          class="btn-primary font-small weight-bold"
                          :loading="harvesting[idx]"
                          :disabled="!wallet.connected || project.info.reward <= 0"
                          @click="harvestRewards(project.info.token.mintAddress, project.info.token.symbol)"
                        >
                          Harvest
                        </Button>
                      </div>

                      <div class="btn-container project">
                        <Button
                          class="btn-primary font-small weight-bold"
                          :loading="unstaking[idx]"
                          :disabled="!wallet.connected"
                          @click="unstakeTokenProject(project.info.token.mintAddress)"
                        >
                          Unstake
                        </Button>
                      </div>
                    </Col>

                    <Col class="staking-collapse-item fcc-container" span="24">
                      <a class="social-link fcc-container font-medium weight-semi icon-cursor" href="#" target="_blank">
                        Share
                        <img class="social-icon" src="@/assets/icons/share.svg" />
                      </a>
                      <a class="social-link fcc-container font-medium weight-semi icon-cursor" href="#" target="_blank">
                        Twitter
                        <img class="social-icon" src="@/assets/icons/twitter-white.svg" />
                      </a>
                    </Col>
                  </Row>

                  <div class="btn-hide-collapse icon-cursor text-center" @click="hideCollapse">
                    <img class="btn-hide-collapse-icon" src="@/assets/icons/arrow-down-blue.svg" />
                  </div>
                </CollapsePanel>
              </Collapse>
            </div>
          </div>
        </div>

        <!-- <div class="staking-tiers-details" id="staking-tiers-details">
          <span class="font-large weight-bold">About Tiers</span>
          <div class="staking-tiers-features">
            <Tabs v-model="activeTab">
              <TabPane tab="Tier 1" key="1">
                <Row :gutter="56" class="staking-tier-container fcsb-container">
                  <Col :sm="12" :xs="24" class="staking-tier-tab">
                    <span class="font-medium weight-semi">
                      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
                      the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of
                      type and scrambled it to make a type specimen book.
                      <br /><br />
                      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
                      the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of
                      type and scrambled it to make a type specimen book.
                    </span>
                  </Col>
                  <Col :sm="12" :xs="24" class="staking-tier-preview">
                    <div class="staking-tier-item-box fcc-container">
                      <div class="tier-text">
                        <span class="font-large">Tier 1</span>
                        <br />
                        <span class="font-large weight-bold text-upper">Soon</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tab="Tier 2" key="2">
                <Row :gutter="56" class="staking-tier-container fcsb-container">
                  <Col :sm="12" :xs="24" class="staking-tier-tab">
                    <span class="font-medium weight-semi">
                      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
                      the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of
                      type and scrambled it to make a type specimen book.
                      <br /><br />
                      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
                      the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of
                      type and scrambled it to make a type specimen book.
                    </span>
                  </Col>
                  <Col :sm="12" :xs="24" class="staking-tier-preview">
                    <div class="staking-tier-item-box fcc-container">
                      <div class="tier-text">
                        <span class="font-large">Tier 2</span>
                        <br />
                        <span class="font-large weight-bold text-upper">Soon</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tab="Tier 3" key="3">
                <Row :gutter="56" class="staking-tier-container fcsb-container">
                  <Col :span="12" class="staking-tier-tab">
                    <span class="font-medium weight-semi">
                      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
                      the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of
                      type and scrambled it to make a type specimen book.
                      <br /><br />
                      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
                      the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of
                      type and scrambled it to make a type specimen book.
                    </span>
                  </Col>
                  <Col :span="12" class="staking-tier-preview">
                    <div class="staking-tier-item-box fcc-container">
                      <div class="tier-text">
                        <span class="font-large">Tier 3</span>
                        <br />
                        <span class="font-large weight-bold text-upper">Soon</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tab="Tier 4" key="4">
                <Row :gutter="56" class="staking-tier-container fcsb-container">
                  <Col :span="12" class="staking-tier-tab">
                    <span class="font-medium weight-semi">
                      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
                      the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of
                      type and scrambled it to make a type specimen book.
                      <br /><br />
                      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
                      the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of
                      type and scrambled it to make a type specimen book.
                    </span>
                  </Col>
                  <Col :span="12" class="staking-tier-preview">
                    <div class="staking-tier-item-box fcc-container">
                      <div class="tier-text">
                        <span class="font-large">Tier 4</span>
                        <br />
                        <span class="font-large weight-bold text-upper">Soon</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tab="Tier 5" key="5">
                <Row :gutter="56" class="staking-tier-container fcsb-container">
                  <Col :span="12" class="staking-tier-tab">
                    <span class="font-medium weight-semi">
                      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
                      the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of
                      type and scrambled it to make a type specimen book.
                      <br /><br />
                      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
                      the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of
                      type and scrambled it to make a type specimen book.
                    </span>
                  </Col>
                  <Col :span="12" class="staking-tier-preview">
                    <div class="staking-tier-item-box fcc-container">
                      <div class="tier-text">
                        <span class="font-large">Tier 5</span>
                        <br />
                        <span class="font-large weight-bold text-upper">Soon</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Icon, Tooltip, Button, Progress, Tabs, Carousel, Row, Col, Collapse } from 'ant-design-vue'
import { cloneDeep, get } from 'lodash-es'
import { getTokenBySymbol, getTokenByMintAddress, TokenInfo, NATIVE_SOL, TOKENS } from '@/utils/tokens'
import { getMultipleAccounts, commitment } from '@/utils/web3'
import { PublicKey } from '@solana/web3.js'
import { getUnixTs } from '@/utils'
import BigNumber from 'bignumber.js'
import { TokenAmount, gt } from '@/utils/safe-math'
import * as anchor from '@project-serum/anchor'
import moment from 'moment'
Vue.prototype.moment = moment
const Vco = require('v-click-outside')
Vue.use(Vco)
const { BN } = anchor
const { TabPane } = Tabs
const CollapsePanel = Collapse.Panel

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
  estimateRewardsPerSec,
  calculateTiers,
  TIERS_XCRP,
  stake,
  unstake,
  harvest
} from '@/utils/crp-stake'

import {
  getAllPools as getAllPoolsProject,
  getUserState as getUserStateProject,
  estimateRewards as estimateRewardsProject,
  harvest as harvestProject,
  stake as stakeProject,
  unstake as unstakeProject
} from '@/utils/crp-staking-project'

export default Vue.extend({
  components: {
    Button,
    Tooltip,
    Row,
    Col,
    Collapse,
    CollapsePanel
    // Tabs,
    // TabPane
  },
  data() {
    return {
      // crp staking
      baseModalShow: false as boolean,
      stakeModalShow: false as boolean,
      estimatedAPY: 0 as number,
      lockDuration: 0 as number,
      crpbalance: 0 as any,
      endDateOfLock: 0 as any,
      running: 0 as any,

      totalStaked: '0' as string,
      totalUsers: 0 as number,
      userStaked: 0 as number,
      userStakedUnformated: 0 as number,
      pendingReward: '0' as string,
      pendingRewardDynamic: 0 as number,
      counterdyn: null as any,
      totalStakedPrice: '0' as string,
      TVL: 0 as number,
      timer: null as any,
      autoRefreshTime: 60 as number,
      countdown: 0 as number,
      activeSpinning: false as boolean,
      endOfLock: '' as string,
      canUnstake: false as boolean,

      pctToNexttiers: 0 as number,
      userTier: 0 as number,
      currentTiers: 0 as number,
      nextTiers: 1 as number,
      selectedTier: 0 as number,
      activeTab: '1' as string,

      // staking project
      filterStaking: 'project' as string,
      showCollapse: [] as any[],
      showFilterMenu: false as boolean,
      showTabMenu: false as boolean,
      showMoreMenu: [] as boolean[],
      currentShowMore: -1 as number,

      harvesting: [] as boolean[],
      unstaking: [] as boolean[],
      stakeModalTitle: '' as String,
      stakeProjectModalShow: false,
      symbol: '',
      mint: '',
      coinbalance: 0,
      listingRunning: false,
      projectInfos: [] as any[],
      projectInfosFiltered: [] as any[]
    }
  },
  head: {
    title: 'Staking | Unlock IDO Rewards',
    meta: [
      {
        hid: 'description',
        name: 'description',
        content: "Choose your stake amount and duration. Earn IDO allocations through Cropper's 5 Staking Tiers.",
        id: 'Staking Desc'
      }
    ]
  },
  computed: {
    ...mapState(['wallet', 'swap', 'liquidity', 'url', 'setting', 'price', 'token'])
  },
  watch: {
    'wallet.tokenAccounts': {
      handler(newTokenAccounts: any) {
        if (this.$wallet?.connected) {
          this.getUserState()
          this.getGlobalState()
          this.listAllPoolInfo()
        }
      },
      deep: true
    },
    'wallet.connected': {
      handler(connected: any) {
        this.getUserState()
        this.listAllPoolInfo()
        if (!connected) this.pendingRewardDynamic = 0
      },
      deep: true
    },
    'token.initialized': {
      handler(newState: boolean) {
        this.getGlobalState()
        this.getUserState()
        this.listAllPoolInfo()
      },
      deep: true
    }
  },
  mounted() {
    this.getTvl()
    setAnchorProvider(this.$web3, this.$wallet)
    this.getGlobalState()
    this.getUserState()

    if (this.currentTiers > 1) {
      this.setTierCarousel(this.currentTiers - 1)
      this.selectedTier = this.currentTiers
      this.activeTab = this.currentTiers.toString()
    } else {
      this.setTierCarousel(0)
      this.selectedTier = 1
      this.activeTab = '1'
    }
    if (this.currentTiers === 5) this.pctToNexttiers = 100
    this.setTimer()
    this.listAllPoolInfo()
  },
  methods: {
    setTimer() {
      this.timer = setInterval(async () => {
        if (this.countdown < this.autoRefreshTime) {
          this.countdown += 1
          if (this.countdown === this.autoRefreshTime) {
            await this.flush()
          }
        }
      }, 1000)
    },
    reloadTimer() {
      this.activeSpinning = true
      setTimeout(() => {
        this.activeSpinning = false
      }, 1000)
      this.flush()
      this.$accessor.wallet.getTokenAccounts()
    },
    async flush() {
      this.countdown = 0
      this.getGlobalState()
      this.listAllPoolInfo()
      if (this.$wallet?.connected) {
        this.getUserState()
      }
      this.listAllPoolInfo()
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
    async getGlobalState() {
      if (!this.$accessor.token.initialized) return

      const pools = await getAllPools()
      const current_pool = pools[0].account

      const farm_state = await getFarmState()
      const stakedAmount = new TokenAmount(current_pool.amount, TOKENS['CRP'].decimals)

      this.totalUsers = current_pool.totalUser

      if (this.price.prices['CRP']) {
        this.totalStakedPrice =
          '$' +
          (Math.round(parseFloat(stakedAmount.fixed()) * this.price.prices['CRP'] * 1000) / 1000)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      } else {
        this.totalStakedPrice = '$ ' + parseFloat(stakedAmount.fixed())
      }

      this.totalStaked =
        'CRP ' +
        (Math.round(parseFloat(stakedAmount.fixed()) * 1000) / 1000).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

      // const apr = Number(farm_state.tokenPerSecond.muln(YEAR2SECOND).div(current_pool.amount).toString());
      // this.estimatedAPY = Number((((1 + (apr / 100)/ 365)) ** 365 - 1) * 100);

      const apr =
        (Number(new TokenAmount(farm_state.tokenPerSecond, TOKENS['CRP'].decimals).fixed()) * 365 * 24 * 3600) /
        Number(new TokenAmount(current_pool.amount, TOKENS['CRP'].decimals).fixed())

      this.estimatedAPY = Number(((1 + apr / 365) ** 365 - 1) * 100)
    },
    async getUserState() {
      if (!this.$accessor.token.initialized || !this.$wallet?.connected) {
        return
      }
      let crpbalanceDatas = this.wallet.tokenAccounts[TOKENS['CRP'].mintAddress]

      if (crpbalanceDatas) {
        this.crpbalance = crpbalanceDatas.balance.fixed() * 1
      }

      const farm_state = await getFarmState()
      const extraRewardConfigs = await getExtraRewardConfigs()
      const pools = await getAllPools()
      const current_pool = pools[0]
      const userAccount = await getPoolUserAccount(this.$wallet, current_pool.publicKey)

      const endDateOfLock = userAccount.lastStakeTime.toNumber() + userAccount.lockDuration.toNumber()
      const unlockDateString = moment(new Date(endDateOfLock * 1000)).format('MM/DD/YYYY HH:mm:SS')
      this.endDateOfLock = endDateOfLock
      this.endOfLock = unlockDateString
      this.canUnstake = !(
        (userAccount.lastStakeTime.toNumber() + userAccount.lockDuration.toNumber()) * 1000 >
        new Date().getTime()
      )

      //@ts-ignore
      this.userStaked =
        Math.ceil(parseFloat(new TokenAmount(userAccount.amount, TOKENS['CRP'].decimals).fixed()) * 1000) / 1000
      this.userStakedUnformated = Number(new TokenAmount(userAccount.amount, TOKENS['CRP'].decimals).fixed())

      const rewardAmount = estimateRewards(farm_state, extraRewardConfigs, current_pool.account, userAccount)
      const rewardsPerSec = estimateRewardsPerSec(farm_state, extraRewardConfigs, current_pool.account, userAccount)
      const tiers_info = calculateTiers(this.userStaked, userAccount.lockDuration.toNumber(), this.$accessor.wallet)
      this.$accessor.wallet.setStakingTiers(tiers_info)
      this.pendingReward = new TokenAmount(rewardAmount, TOKENS['CRP'].decimals).fixed()
      this.pendingRewardDynamic = new TokenAmount(rewardAmount, TOKENS['CRP'].decimals).fixed() as unknown as number

      if (this.running != 1) this.dynamicRebase(rewardsPerSec, this.pendingRewardDynamic)

      this.running = 1

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

      if (this.currentTiers > 1) {
        this.setTierCarousel(this.currentTiers - 1)
        this.selectedTier = this.currentTiers
        this.activeTab = this.currentTiers.toString()
      } else {
        this.setTierCarousel(0)
        this.selectedTier = 1
        this.activeTab = '1'
      }
    },
    dynamicRebase(rewardsPerSec: any, pendingRewardDynamic: any) {
      return false
      const nreward = this.pendingRewardDynamic * 1 + rewardsPerSec / 100
      this.pendingRewardDynamic = Math.round(nreward * 1000000000) / 1000000000
      setTimeout(() => {
        this.dynamicRebase(rewardsPerSec, nreward)
      }, 10)
    },
    onBaseDetailSelect(lock_duration: number, estimated_apy: number) {
      this.baseModalShow = false
      this.estimatedAPY = estimated_apy
      this.lockDuration = lock_duration
    },
    async unstakeToken() {
      const pools = await getAllPools()
      const current_pool = pools[0]
      const poolSigner = current_pool.publicKey.toString()
      const rewardMint = current_pool.account.mint.toString()
      const rewardPoolVault = current_pool.account.vault.toString()

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      unstake(
        this.$web3,
        this.$wallet,
        poolSigner,
        rewardMint,
        rewardPoolVault,

        get(this.wallet.tokenAccounts, `${rewardMint}.tokenAccountAddress`),
        this.userStakedUnformated * Math.pow(10, TOKENS['CRP'].decimals)
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

          const description = 'Unstaking CRP'

          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Unstaking failed',
            description: error.message
          })
        })
        .finally(() => {
          this.$accessor.wallet.getTokenAccounts()
          this.flush()
        })
    },
    async getUserAccount() {
      const pools = await getAllPools()
      const current_pool = pools[0]
      const userAccount = await getPoolUserAccount(this.$wallet, current_pool.publicKey)
    },
    async harvestReward() {
      const programState = await getFarmState()

      const pools = await getAllPools()
      const current_pool = pools[0]
      const poolSigner = current_pool.publicKey.toString()
      const rewardMint = current_pool.account.mint.toString()
      const rewardPoolVault = current_pool.account.vault.toString()

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      harvest(
        this.$web3,
        this.$wallet,

        poolSigner,
        rewardMint,
        get(this.wallet.tokenAccounts, `${rewardMint}.tokenAccountAddress`),
        programState.rewardVault
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

          const description = 'Harvesting CRP'

          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Harvest failed',
            description: error.message
          })
        })
        .finally(() => {
          this.flush()
          this.$accessor.wallet.getTokenAccounts()
        })
    },
    stakeToken(project: any) {
      this.stakeModalTitle = `Stake ${project.info.token.symbol} token`
      this.stakeProjectModalShow = true
      this.estimatedAPY = project.info.apy
      this.userStaked = project.info.amount
      this.endDateOfLock = String(new Date(getUnixTs() + project.info.lockDuration * 1000).toLocaleString())
      this.symbol = project.info.token.symbol
      this.mint = project.info.token.mintAddress

      let balanceDatas = this.wallet.tokenAccounts[this.mint]

      if (balanceDatas) {
        this.coinbalance = balanceDatas.balance.fixed() * 1
      }
    },
    unstakeTokenProject(mint: string) {
      unstakeProject(
        this.$web3,
        this.$wallet,
        mint,
        get(this.wallet.tokenAccounts, `${mint}.tokenAccountAddress`),
        10_000_000
      )
    },
    harvestRewards(mint: string, symbol: string) {
      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })
      harvestProject(this.$web3, this.$wallet, mint, get(this.wallet.tokenAccounts, `${mint}.tokenAccountAddress`))
        .then(async (txid) => {
          this.$notify.info({
            key,
            message: 'Transaction has been sent',
            description: (h: any) => h('div', ['Confirmation is in progress.'])
          })

          const description = `Harvest ${symbol}`
          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Add liquidity failed',
            description: error.message
          })
        })
        .finally(async () => {
          this.flush()
          this.$accessor.wallet.getTokenAccounts()
        })
    },
    async listAllPoolInfo() {
      if (!this.$accessor.token.initialized) return
      if (this.listingRunning) return
      this.listingRunning = true
      const pools = await getAllPoolsProject(this.$web3, this.$wallet)

      let tempProjectInfos = []
      let tempProjectInfosEnded = []

      console.log('prices', this.price.prices)

      for (let i = 0; i < pools.length; i++) {
        const pool = pools[i].account
        const key = pools[i].publicKey.toString()
        const mint = pool.mint.toString()
        const token = await getTokenByMintAddress(mint)
        const price = token ? this.price.prices[token.symbol.toUpperCase()] : 0

        const tvl = (new TokenAmount(pool.amount, token?.decimals).fixed() as unknown as number) * price
        const tokenPerSecond = pool.tokenPerSecond.toNumber()
        const lockDuration = pool.lockDuration.toNumber()

        const apr = (tokenPerSecond * 365 * 24 * 3600) / pool.amount.toNumber()

        //const apy = Number(((1 + apr / 365) ** 365 - 1) * 100)
        const apy = apr

        let amount = 0
        let reward = 0
        let lastTimeLocked = 0

        const user = await getUserStateProject(this.$web3, this.$wallet, mint)
        if (user) {
          lastTimeLocked = user.lastStakeTime.toNumber()
          amount = parseFloat(new TokenAmount(user.amount, token?.decimals).fixed())
          reward = parseFloat(new TokenAmount(estimateRewardsProject(pool, user), token?.decimals).fixed())
        }

        let estimateEnd =
          pool.lastRewardTime.toNumber() +
          pools[i].account.remainReward.toNumber() / pools[i].account.tokenPerSecond.toNumber()

        if (getUnixTs() < estimateEnd * 1000) {
          tempProjectInfos.push({
            key,
            lastRewardTime: new Date(estimateEnd * 1000).toLocaleString(),
            lastTimeLocked: new Date((lastTimeLocked + lockDuration) * 1000).toLocaleString(),
            active: getUnixTs() < estimateEnd * 1000,
            info: {
              mint,
              token: token ?? {
                symbol: 'Unkown'
              },
              tokenPerSecond,
              lockDuration,
              apy,
              tvl,
              reward,
              amount,
              lastTimeLocked: lastTimeLocked
            }
          })
        } else {
          tempProjectInfosEnded.push({
            key,
            lastRewardTime: new Date(estimateEnd * 1000).toLocaleString(),
            lastTimeLocked: new Date((lastTimeLocked + lockDuration) * 1000).toLocaleString(),
            active: getUnixTs() < estimateEnd * 1000,
            info: {
              mint,
              token: token ?? {
                symbol: 'Unkown'
              },
              tokenPerSecond,
              lockDuration,
              apy,
              tvl,
              reward,
              amount,
              lastTimeLocked: lastTimeLocked
            }
          })
        }
      }

      tempProjectInfos = tempProjectInfos.sort((a: any, b: any) => b.info.apy - a.info.apy)

      this.projectInfos = tempProjectInfos.concat(tempProjectInfosEnded)

      this.projectInfosFiltered = this.projectInfos

      this.listingRunning = false

      this.showMoreMenu = []
      this.projectInfos.forEach((item) => {
        this.showMoreMenu.push(false)
      })
    },
    getCurrentTier(from: any, to: any) {
      this.selectedTier = to + 1
    },
    setTierCarousel(idx: number) {
      ;(this.$refs.tierCarousel as Vue & { goTo: (idx: number) => number }).goTo(idx)
    },
    setTierTabs() {
      this.activeTab = this.selectedTier.toString()
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
    hideCollapse() {
      this.showCollapse = []
    }
  }
})
</script>

<style lang="less" scoped>
.staking {
  // global styles
  .btn-container {
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 48px;
    padding: 3px;
    width: 85px;
    height: auto;

    &.btn-large {
      width: 100%;
      height: 50px;
    }

    &.project {
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
  }

  .btn-transparent {
    background: transparent;
    padding: 4.5px 0;
    border-radius: 48px;
    border: none;
    width: 100%;
    height: auto;
  }

  .btn-primary {
    background: #2b3367;
    padding: 4.5px 0;
    border-radius: 48px;
    border: none;
    width: 100%;
    height: auto;
    color: #fff;

    &:disabled {
      color: rgba(255, 255, 255, 0.4);
    }
  }

  .btn-link {
    background: transparent;
    border: none;
    height: fit-content;
  }

  .info-icon {
    display: flex;
    align-items: center;
    width: 12px;
    height: 12px;
    margin-left: 5px;
  }

  .tooltip-icon {
    width: 12px;
    height: 12px;
    margin-left: 4px;
  }

  .isDesktop {
    @media @max-lg-tablet {
      display: none;
    }
  }

  .btn-show-collapse {
    border-bottom: none;

    @media @max-lg-tablet {
      padding: 5px;
    }
  }

  .btn-hide-collapse {
    border-bottom: none;

    .btn-hide-collapse-icon {
      transform: rotate(180deg);
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

      a {
        color: #fff !important;
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

  .staking-labels {
    .label {
      border-radius: 6px;
      padding: 4px;
      width: fit-content;
      font-size: 10px;
      line-height: 12px;

      &.open {
        background: @color-petrol500;
      }
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

  // class styles
  &.container {
    margin-top: 38px;

    @media @max-sl-mobile {
      margin-top: 28px;
    }

    .card {
      .card-body {
        padding: 0;

        .staking-head {
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

          .information {
            display: flex;
            align-items: center;
            justify-content: space-between;

            @media @max-sl-mobile {
              width: 100%;
            }

            .action-btn-group {
              display: flex;
              align-items: center;

              .action-btn {
                background: @color-blue600;
                border-radius: 8px;
                padding: 8px;
                margin-left: 8px;
                height: 32px;

                .reload-icon {
                  width: 18px;
                  height: 18px;
                }

                &.active .reload-icon {
                  transform: rotate(360deg);
                  transition: all 1s ease-in-out;
                }

                .dashboard-icon {
                  margin-right: 8px;
                }

                .action-label {
                  color: @color-blue100;
                }
              }
            }
          }
        }

        .staking-content {
          .crp-staking {
            max-width: 870px;
            min-width: 335px;
            width: 100%;
            margin: auto !important;
            background: @color-blue700;
            border: 3px solid @color-blue500;
            padding: 18px;
            box-shadow: 0 40px 70px rgba(0, 0, 0, 0.3);
            border-radius: 18px;

            @media @max-sl-mobile {
              display: inline-block !important;
            }

            .staking-tiers {
              max-width: 369px;
              margin: auto;
              width: 100%;
              height: 458px;
              border: 4px solid @color-petrol500;
              border-radius: 18px;
              padding-bottom: 12px;
              overflow: hidden;
              mask-image: -webkit-radial-gradient(white, black);
              -webkit-mask-image: -webkit-radial-gradient(white, black);

              @media @max-md-tablet {
                max-width: 320px;
              }

              @media @max-sm-mobile {
                max-width: 290px;
              }

              .staking-tier-item {
                position: relative;
                height: 450px;
                background-size: cover !important;
                background-position: center !important;

                .staking-tier-title {
                  position: absolute;
                  top: 12px;
                  width: 100%;
                }

                .staking-tier-soon {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                }

                .staking-tier-desc {
                  position: absolute;
                  bottom: 42px;
                  width: 100%;

                  .crp-balance {
                    color: @color-petrol500;
                  }
                }

                &.tier-1 {
                  background: url('@/assets/tier/Tier1.jpg');
                }

                &.tier-2 {
                  background: url('@/assets/tier/Tier2.jpg');
                }

                &.tier-3 {
                  background: url('@/assets/tier/Tier3.jpg');
                }

                &.tier-4 {
                  background: url('@/assets/tier/Tier4.jpg');
                }

                &.tier-5 {
                  background: url('@/assets/tier/Tier5.jpg');
                }
              }
            }

            .staking-body {
              width: calc(100% - 398px);
              margin-right: 28px;

              @media @max-md-tablet {
                width: calc(100% - 348px);
              }

              @media @max-sl-mobile {
                width: 100%;
                margin-right: 0;
                margin-bottom: 28px;
              }

              .staking-progress {
                margin-top: 28px;

                .staking-progress-label {
                  margin-bottom: 4px;
                }

                .staking-progress-info-container {
                  position: relative;
                  padding: 0 4px;

                  .staking-progress-end {
                    width: 2px;
                    height: 14px;
                    background: @color-petrol500;
                    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.55);
                    margin: -20px 0 4px 0;
                  }

                  .staking-progress-percent-container {
                    padding-top: 4px;

                    &.max-tier {
                      justify-content: flex-end !important;
                    }

                    .staking-progress-percent {
                      white-space: nowrap;
                    }
                  }
                }
              }

              .staking-infos-group {
                margin-top: 28px;

                .staking-info {
                  margin-bottom: 8px;

                  &:last-child {
                    margin-bottom: 0;
                  }

                  .label {
                    color: @color-gray;
                    display: flex;
                    align-items: center;
                  }

                  .value {
                    display: flex;
                    align-items: center;
                    text-align: right;
                    color: #fff;

                    .calc-icon {
                      margin-left: 8px;
                    }
                  }
                }
              }

              .staking-actions-group {
                margin: 18px 0;

                .staking-action-item {
                  background: rgba(226, 227, 236, 0.1);
                  border-radius: 18px;
                  padding: 16px;
                  margin-bottom: 18px;

                  &:last-child {
                    margin-bottom: 0;
                  }

                  .label {
                    color: @color-gray;
                  }

                  .value {
                    font-weight: bold;
                    font-size: 20px;
                    line-height: 25px;
                    color: #fff;
                    display: block;
                  }

                  .stake-btn-group {
                    .btn-container {
                      margin-right: 8px;

                      &:last-child {
                        margin-right: 0;
                      }
                    }
                  }
                }
              }

              .staking-footer {
                .lock-tokens {
                  .label {
                    color: @color-gray;
                  }
                }

                .get-crp {
                  margin-top: 18px;

                  .union-icon {
                    margin-left: 8px;
                  }
                }
              }
            }
          }

          .staking-projects {
            .staking-table {
              .staking-item {
                display: flex;
                background: rgba(23, 32, 88, 0.9);
                border-radius: 8px;
                padding: 18px;
                margin-top: 8px;
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

                .staking-infos {
                  margin-top: 15px;

                  @media @max-lg-tablet {
                    margin-top: 0;
                  }

                  .staking-info-group {
                    display: flex;
                    align-items: center;
                    color: rgba(255, 255, 255, 0.8);

                    .staking-info-img {
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

              .staking-collapse-mobile,
              .staking-collapse-tablet {
                .staking-collapse-item {
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

                    .staking-infos {
                      margin-bottom: 8px;

                      &:last-child {
                        margin-bottom: 0;
                      }

                      .staking-info-group {
                        display: flex;
                        align-items: center;
                        color: rgba(255, 255, 255, 0.8);

                        .staking-info-img {
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

                .staking-collapse-content {
                  background: @color-blue800;
                  padding: 16px;
                  margin-bottom: 18px;
                  border-radius: 8px;

                  .staking-collapse-item {
                    margin-bottom: 18px;
                  }
                }
              }
            }
          }
        }

        // .staking-tiers-details {
        //   max-width: 870px;
        //   min-width: 335px;
        //   width: 100%;
        //   margin: 30px auto !important;
        //   background: @color-blue700;
        //   border: 3px solid @color-blue500;
        //   padding: 18px;
        //   border-radius: 18px;

        //   .staking-tiers-features {
        //     margin: 18px 0;

        //     .staking-tier-container {
        //       margin: 0 !important;

        //       @media @max-sl-mobile {
        //         display: inline-block !important;
        //       }

        //       .staking-tier-tab {
        //         padding-left: 0 !important;

        //         @media @max-sl-mobile {
        //           padding-right: 0 !important;
        //           width: 100%;
        //         }
        //       }

        //       .staking-tier-preview {
        //         padding-right: 0 !important;

        //         @media @max-sl-mobile {
        //           margin-top: 28px;
        //           width: 100%;
        //           padding-left: 0 !important;
        //         }

        //         .staking-tier-item-box {
        //           background: url('@/assets/tier/tier-blur.png');
        //           background-size: cover;
        //           border-radius: 18px;
        //           border: 5px solid @color-blue-dark;
        //           width: 100%;
        //           height: 300px;
        //         }
        //       }
        //     }
        //   }
        // }
      }
    }
  }
}
</style>

<style lang="less">
.staking {
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

  // ant carousel
  .ant-carousel {
    .custom-slick-arrow {
      top: 45%;
      width: 25px;
      height: 25px;
      font-size: 25px;
      color: #fff;
      background-color: rgba(31, 45, 61, 0.11);
      opacity: 0.3;

      &.prev-arrow {
        left: 10px;
        z-index: 1;
      }

      &.next-arrow {
        right: 10px;
      }

      &::before {
        display: none;
      }

      &:hover {
        opacity: 0.5;
      }
    }

    .slick-dots {
      position: absolute;
      display: flex !important;
      align-items: center;
      justify-content: center;
      background: transparent;
      height: 30px;
      bottom: 12px;

      li {
        margin-left: 0;
        margin-right: 16px;
        width: 9px;
        height: 9px;
        background: transparent;
        border-radius: 50%;

        &:last-child {
          margin-right: 0;
        }

        button {
          width: 100% !important;
          height: 100% !important;
          border-radius: 50%;
          background: @color-petrol300;
          opacity: 0.4;
        }

        &.slick-active {
          button {
            background: @color-petrol50;
            opacity: 1;
          }
        }
      }
    }
  }

  // ant progress
  .ant-progress {
    width: 100%;
  }

  // ant tabs
  // .ant-tabs-bar {
  //   border-bottom: 0;
  //   margin: 0 0 28px 0;

  //   .ant-tabs-nav {
  //     .ant-tabs-tab {
  //       margin: 0 18px 0 0;
  //       font-weight: 600;
  //       font-size: 20px;
  //       line-height: 30px;
  //       color: #eae8f1;
  //     }

  //     .ant-tabs-tab-active {
  //       color: @color-petrol500;
  //     }

  //     .ant-tabs-ink-bar {
  //       position: relative;
  //       margin-top: 8px;
  //       width: 50px !important;
  //       height: 4px;
  //       background: @color-petrol400;
  //       border-radius: 10px;
  //     }
  //   }
  // }

  .staking-table {
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
