<template>
  <div>
    <div class="dashboard container">
      <div class="card">
        <div class="card-body">
          <div class="dashboard-head fcsb-container">
            <h3 class="title weight-bold">Dashboard</h3>
            <div class="information">
              <div class="action-btn-group fcs-container">
                <div
                  :class="`reload-btn fcc-container icon-cursor ${activeSpinning ? 'active' : ''}`"
                  @click="reloadTimer"
                >
                  <img src="@/assets/icons/reload.svg" />
                </div>
              </div>
            </div>
          </div>

          <div class="dashboard-content">
            <div class="dashboard-analytics">
              <Row :gutter="[20, 20]">
                <Col :span="windowWidth >= 768 ? 12 : 24">
                  <div class="d-flex">
                    <div :class="`tier-container ${flushing || currentTiers === 0 ? 'empty' : ''}`">
                      <div v-if="flushing || currentTiers === 0" class="fcc-container h-100">
                        <div class="text-center">
                          <div class="btn-container mb-8">
                            <NuxtLink
                              to="/staking"
                              class="btn-transparent font-medium weight-semi spacing-small fcc-container"
                              >Stake now</NuxtLink
                            >
                          </div>

                          <span class="staking-label font-medium"
                            ><b>Tier {{ currentTiers }}</b>
                            {{
                              currentTiers === 0
                                ? ''
                                : currentTiers === 1
                                ? 'GrassCropper'
                                : currentTiers === 2
                                ? 'Irrigator'
                                : currentTiers === 3
                                ? 'Guardener'
                                : currentTiers === 4
                                ? 'Reaper'
                                : 'Harvestator'
                            }}
                            <br />
                            <i class="font-xsmall"
                              >CRP Staked
                              <label class="weight-semi">{{
                                (Math.round(userStaked * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                              }}</label></i
                            >
                          </span>
                        </div>
                      </div>
                      <div v-else class="h-100">
                        <span class="staking-label absolute text-center font-medium w-100"
                          ><b>Tier {{ currentTiers }}</b>
                          {{
                            currentTiers === 0
                              ? ''
                              : currentTiers === 1
                              ? 'GrassCropper'
                              : currentTiers === 2
                              ? 'Irrigator'
                              : currentTiers === 3
                              ? 'Guardener'
                              : currentTiers === 4
                              ? 'Reaper'
                              : 'Harvestator'
                          }}
                          <br />
                          <i class="font-xsmall"
                            >CRP Staked
                            <label class="weight-semi">{{
                              (Math.round(userStaked * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            }}</label></i
                          >
                        </span>
                        <img
                          class="tier-img h-100 w-100"
                          :src="require(`@/assets/tier/Tier${currentTiers === 0 ? 1 : currentTiers}.jpg`)"
                          alt="tier image"
                        />
                      </div>
                    </div>

                    <div class="analytics-container">
                      <div class="analytics-box analytics-small analytics-tvl fcs-container">
                        <div class="tvl-info">
                          <span class="tvl-label item-label font-medium weight-semi spacing-small fcs-container"
                            >My TVL
                            <Tooltip placement="bottomLeft">
                              <template slot="title">
                                <div>
                                  <div class="tooltip-line">
                                    Farms
                                    <span>
                                      ${{
                                        this.flushing
                                          ? 0
                                          : (Math.round(posFarming * 100) / 100)
                                              .toString()
                                              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                      }}</span
                                    >
                                  </div>
                                  <hr />
                                  <div class="tooltip-line">
                                    Liquidity
                                    <span>
                                      ${{
                                        this.flushing
                                          ? 0
                                          : (Math.round(posLiquidity * 100) / 100)
                                              .toString()
                                              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                      }}</span
                                    >
                                  </div>
                                  <hr />
                                  <div class="tooltip-line">
                                    Staking
                                    <span>
                                      ${{
                                        this.flushing
                                          ? 0
                                          : (Math.round(posStaking * 100) / 100)
                                              .toString()
                                              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                      }}
                                    </span>
                                  </div>
                                </div>
                              </template>

                              <img class="info-icon icon-cursor" src="@/assets/icons/info.svg" />
                            </Tooltip>
                          </span>
                          <h4 class="weight-bold spacing-medium">
                            ${{
                              this.flushing
                                ? 0
                                : (Math.round(userTVL * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            }}
                          </h4>
                        </div>
                      </div>

                      <div class="analytics-box analytics-small analytics-staking fcsb-container">
                        <div class="pending-rewards fcs-container">
                          <div class="pending-rewards-info">
                            <span class="item-label font-medium weight-semi spacing-small fcs-container"
                              >Staking - Pending Rewards
                            </span>
                            <h4 class="weight-bold spacing-medium fssb-container">
                              CRP
                              {{
                                this.flushing
                                  ? 0
                                  : (Math.round(pendingReward * 100) / 100)
                                      .toString()
                                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                              }}
                            </h4>
                          </div>
                        </div>

                        <div class="btn-container">
                          <Button
                            @click="harvestRewardStaking"
                            class="btn-transparent font-medium weight-semi spacing-small"
                            >Harvest</Button
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>

                <Col :span="windowWidth >= 768 ? 12 : 24">
                  <div v-if="windowWidth > 768" class="analytics-box analytics-small analytics-apr fcsb-container">
                    <div class="apr-info fcs-container">
                      <pie-chart
                        v-if="!flushing && liqstakposition"
                        :class="`pie-chart fcs-container no-left ${flushing ? 'chart-hidden' : 'chart-shown'}`"
                        :data="APRData"
                        :options="APROption"
                      />

                      <pie-chart
                        :class="`pie-chart fcs-container no-left ${flushing ? 'chart-shown' : 'chart-hidden'}`"
                        id="empty"
                        :data="defaultData"
                        :options="APROption"
                      />

                      <div class="net-apr">
                        <span class="apr-label item-label font-medium weight-semi spacing-small fcs-container"
                          >Net APR

                          <Tooltip placement="bottomLeft">
                            <template slot="title">
                              <div>
                                <div class="tooltip-line">
                                  Fees <span> {{ Math.round(((FEES * 100) / userTVL) * 100) / 100 }}%</span>
                                </div>
                                <hr />
                                <div class="tooltip-line">
                                  Rewards <span> {{ Math.round(((APR * 100) / userTVL) * 100) / 100 }}% </span>
                                </div>
                                <hr />
                                <div class="tooltip-line">
                                  Staking
                                  <span>
                                    {{ Math.round(((stakingAPR * boostAPY * 100) / userTVL) * 100) / 100 }}%
                                  </span>
                                </div>
                              </div>
                            </template>
                            <img class="info-icon icon-cursor" src="@/assets/icons/info.svg" /> </Tooltip
                        ></span>
                        <h4 class="weight-bold spacing-medium fcs-container">
                          {{
                            this.flushing
                              ? 0
                              : Math.round((((APR + FEES + stakingAPR * boostAPY) * 100) / userTVL) * 100) / 100
                          }}%
                        </h4>
                      </div>
                    </div>
                    <div class="apr-info fcs-container">
                      <div>
                        <span class="apr-label item-label font-medium weight-semi spacing-small"
                          >Estimated Revenue
                        </span>
                        <h4 class="weight-bold spacing-medium">
                          ${{
                            this.flushing
                              ? 0
                              : (
                                  Math.round(
                                    (userTVL * 100 * (((APR + FEES + stakingAPR * boostAPY) * 100) / userTVL)) /
                                      100 /
                                      (revenueType === 'day' ? 365 : revenueType === 'month' ? 12 : 1)
                                  ) / 100
                                )
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          }}
                        </h4>
                      </div>
                      <div class="revenue-btn-group">
                        <Button
                          class="btn-small font-xsmall weight-bold fcc-container"
                          :ghost="!(revenueType === 'day')"
                          @click="
                            () => {
                              this.revenueType = 'day'
                            }
                          "
                          >24H</Button
                        >
                        <Button
                          class="btn-small font-xsmall weight-bold fcc-container"
                          :ghost="!(revenueType === 'month')"
                          @click="
                            () => {
                              this.revenueType = 'month'
                            }
                          "
                          >1M</Button
                        >
                        <Button
                          class="btn-small font-xsmall weight-bold fcc-container"
                          :ghost="!(revenueType === 'year')"
                          @click="
                            () => {
                              this.revenueType = 'year'
                            }
                          "
                          >1Y</Button
                        >
                      </div>
                    </div>
                  </div>

                  <div v-else class="analytics-box analytics-small analytics-apr md-tablet fcs-container">
                    <div class="apr-info fcs-container">
                      <pie-chart
                        v-if="liqstakposition"
                        :class="`pie-chart fcs-container no-left ${flushing ? 'chart-hidden' : 'chart-shown'}`"
                        :data="APRData"
                        :options="APROption"
                      />

                      <pie-chart
                        :class="`pie-chart fcs-container no-left ${flushing ? 'chart-shown' : 'chart-hidden'}`"
                        id="empty"
                        :data="defaultData"
                        :options="APROption"
                      />
                    </div>
                    <div class="apr-info">
                      <div class="fcs-container mb-8">
                        <div>
                          <span class="apr-label item-label font-medium weight-semi spacing-small"
                            >Estimated Revenue
                          </span>
                          <h4 class="weight-bold spacing-medium">
                            ${{
                              this.flushing
                                ? 0
                                : (
                                    Math.round(
                                      (userTVL * 100 * (((APR + FEES + stakingAPR) * 100) / userTVL)) /
                                        100 /
                                        (revenueType === 'day' ? 365 : revenueType === 'month' ? 12 : 1)
                                    ) / 100
                                  )
                                    .toString()
                                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            }}
                          </h4>
                        </div>
                        <div class="revenue-btn-group">
                          <Button
                            class="btn-small font-xsmall weight-bold fcc-container"
                            :ghost="!(revenueType === 'day')"
                            @click="
                              () => {
                                this.revenueType = 'day'
                              }
                            "
                            >24H</Button
                          >
                          <Button
                            class="btn-small font-xsmall weight-bold fcc-container"
                            :ghost="!(revenueType === 'month')"
                            @click="
                              () => {
                                this.revenueType = 'month'
                              }
                            "
                            >1M</Button
                          >
                          <Button
                            class="btn-small font-xsmall weight-bold fcc-container"
                            :ghost="!(revenueType === 'year')"
                            @click="
                              () => {
                                this.revenueType = 'year'
                              }
                            "
                            >1Y</Button
                          >
                        </div>
                      </div>

                      <div>
                        <span class="apr-label item-label font-medium weight-semi spacing-small"
                          >Net APR<Tooltip placement="bottomLeft">
                            <template slot="title">
                              <div>
                                <div class="tooltip-line">
                                  Fees <span> {{ Math.round(((FEES * 100) / userTVL) * 100) / 100 }}%</span>
                                </div>
                                <hr />
                                <div class="tooltip-line">
                                  Rewards <span> {{ Math.round(((APR * 100) / userTVL) * 100) / 100 }}% </span>
                                </div>
                                <hr />
                                <div class="tooltip-line">
                                  Staking
                                  <span>
                                    {{ Math.round(((stakingAPR * boostAPY * 100) / userTVL) * 100) / 100 }}%
                                  </span>
                                </div>
                              </div>
                            </template>
                            <img class="info-icon icon-cursor" src="@/assets/icons/info.svg" /> </Tooltip
                        ></span>
                        <h4 class="weight-bold spacing-medium fcs-container">
                          {{
                            this.flushing ? 0 : Math.round((((APR + FEES + stakingAPR) * 100) / userTVL) * 100) / 100
                          }}%
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div class="analytics-box analytics-small analytics-rewards fcsb-container">
                    <div class="farm-pending-rewards-info">
                      <span class="farm-label item-label font-medium weight-semi spacing-small fcs-container"
                        >Farms - Pending Rewards
                      </span>
                      <h4 class="weight-bold spacing-medium">
                        ${{
                          this.flushing
                            ? 0
                            : (Math.round(globpositionsRewardsFarms * 100) / 100)
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        }}
                      </h4>
                    </div>

                    <div class="all-btn-group fcs-container">
                      <div class="btn-container">
                        <Button :disabled="globpositionsRewardsFarms <= 0" class="btn-primary soon"
                          ><span class="font-medium weight-semi spacing-small w-100">Compound All</span></Button
                        >
                      </div>
                    </div>
                  </div>
                </Col>

                <Col :span="windowWidth >= 768 ? 12 : 24">
                  <div class="analytics-box analytics-big analytics-positions">
                    <div class="analytics-option-bar fcsb-container">
                      <TabMenu
                        :tabList="[
                          { key: 'farm', name: 'Farms Positions', short_name: 'Farms' },
                          { key: 'liquidity', name: 'Liquidity Positions', short_name: 'Liquidity' },
                          { key: 'staking', name: 'Staking Positions', short_name: 'Staking' }
                        ]"
                        fontSize="font-medium"
                        @onChange="changePositions"
                      ></TabMenu>

                      <div class="switch-btn-group d-flex">
                        <Button
                          v-if="!flushing"
                          :ghost="!(this.ModePositions == '$')"
                          class="btn-small font-xsmall weight-bold fcc-container"
                          @click="switchModePositions()"
                        >
                          $
                        </Button>
                        <Button
                          v-if="!flushing"
                          :ghost="!(this.ModePositions == '%')"
                          class="btn-small font-xsmall weight-bold fcc-container"
                          @click="switchModePositions()"
                        >
                          %
                        </Button>
                      </div>
                    </div>

                    <Row :gutter="24" class="analytics-details">
                      <Col :md="24" :lg="12">
                        <doughnut-chart
                          v-if="liqstakposition2"
                          :class="`doughnut-chart fcs-container m-auto ${flushing ? 'chart-hidden' : 'chart-shown'}`"
                          :data="positionTab == 'liquidity' ? LiquidityPositionsData : positionTab == 'farm' ? FarmPositionsData : StakingProjectPositionsData"
                          :options="LiquidityPositionsOption"
                        />

                        <doughnut-chart
                          :class="`doughnut-chart fcs-container m-auto ${
                            flushing ||
                            (positionTab == 'farm' && farmsPositions.length == 0) ||
                            (positionTab == 'liquidity' && liquidityPositions.length == 0) ||
                            (positionTab == 'staking' && stakingProjectPositions.length == 0)
                              ? 'chart-shown'
                              : 'chart-hidden'
                          }`"
                          :data="defaultData"
                          :options="LiquidityPositionsOption"
                        />
                      </Col>
                      <Col :md="24" :lg="12" class="h-100">
                        <div
                          v-if="
                            flushing ||
                            (positionTab == 'farm' && farmsPositions.length == 0) ||
                            (positionTab == 'liquidity' && liquidityPositions.length == 0) ||
                            (positionTab == 'staking' && stakingProjectPositions.length == 0)
                          "
                          class="analytics-value-container nothing fcc-container"
                        >
                          <i class="font-medium fcc-container text-center" v-if="positionTab == 'farm'"
                            >You don't have any farming position</i
                          >
                          <i class="font-medium fcc-container text-center" v-if="positionTab == 'liquidity'"
                            >You don't have any liquidity position</i
                          >
                          <i class="font-medium fcc-container text-center" v-if="positionTab == 'staking'"
                            >You don't have any staking position</i
                          >
                        </div>

                        <div
                          v-else-if="
                            !flushing && (
                              (positionTab == 'farm' && farmsPositions.length > 0) ||
                              (positionTab == 'liquidity' && liquidityPositions.length > 0) ||
                              (positionTab == 'staking' && stakingProjectPositions.length > 0)
                              )
                          "
                          class="analytics-value-container"
                        >
                          <Row :gutter="[16, 16]">
                            <Col
                              :span="12"
                              v-for="position in positionTab == 'liquidity' ? liquidityPositions : positionTab == 'farm' ? farmsPositions : stakingProjectPositions"
                              :key="position.token"
                            >
                              <span class="analytics-value font-medium weight-semi spacing-small"
                                ><span class="color-label" :style="`background: ${position.color} `"></span
                                >{{ position.token }}
                                <label class="position-label weight-regular">{{
                                  ModePositions == '%'
                                    ? `${Math.round(position.ratio * 100) / 100}%`
                                    : `&#36;${Math.round(position.usdcVal * 1000) / 1000}`
                                }}</label></span
                              >
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Col>

                <Col :span="windowWidth >= 768 ? 12 : 24">
                  <div class="analytics-box analytics-big analytics-composition">
                    <div class="analytics-option-bar fcsb-container">
                      <span class="label font-medium weight-semi spacing-small">Pending Rewards Composition</span>
                      <div class="switch-btn-group d-flex">
                        <Button
                          v-if="!flushing"
                          :ghost="!(this.ModePositions == '$')"
                          class="btn-small font-xsmall weight-bold fcc-container"
                          @click="switchModePositions()"
                        >
                          $
                        </Button>
                        <Button
                          v-if="!flushing"
                          :ghost="!(this.ModePositions == '%')"
                          class="btn-small font-xsmall weight-bold fcc-container"
                          @click="switchModePositions()"
                        >
                          %
                        </Button>
                      </div>
                    </div>

                    <Row :gutter="[24, 24]" class="analytics-details">
                      <Col :md="24" :lg="12">
                        <doughnut-chart
                          v-if="liqstakposition"
                          :class="`doughnut-chart fcs-container m-auto ${flushing ? 'chart-hidden' : 'chart-shown'}`"
                          :data="LiquidityPositionsRewardData"
                          :options="LiquidityPositionsOption"
                        />

                        <doughnut-chart
                          :class="`doughnut-chart fcs-container m-auto ${
                            flushing || farmsPositionsRewards.length === 0 ? 'chart-shown' : 'chart-hidden'
                          }`"
                          id="empty"
                          :data="defaultData"
                          :options="LiquidityPositionsOption"
                        />
                      </Col>
                      <Col :md="24" :lg="12" class="h-100">
                        <div
                          v-if="flushing || farmsPositionsRewards.length == 0"
                          class="analytics-value-container nothing fcc-container"
                        >
                          <i class="font-medium fcc-container text-center">You don't have any rewards</i>
                        </div>

                        <div
                          v-else-if="!flushing && farmsPositionsRewards.length > 0"
                          class="analytics-value-container"
                        >
                          <Row :gutter="[16, 16]">
                            <Col :span="12" v-for="position in farmsPositionsRewards" :key="position.token">
                              <span class="analytics-value font-medium weight-semi spacing-small"
                                ><span class="color-label" :style="`background: ${position.color} `"></span
                                >{{ position.token }}
                                <label class="composition-label weight-regular">{{
                                  ModePositions == '%'
                                    ? `${Math.round(position.ratio * 100) / 100}%`
                                    : `&#36;${Math.round(position.usdcVal * 1000) / 1000}`
                                }}</label></span
                              >
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>
            </div>

            <div class="dashboard-option-bar fcsb-container">
              <TabMenu
                :tabList="[
                  { key: 'farm', name: 'My Farms', short_name: 'My Farms' },
                  { key: 'pool', name: 'My Pools', short_name: 'My Pools' },
                  { key: 'staking', name: 'My Stakings', short_name: 'My Stakings' }
                ]"
                fontSize="font-large"
                @onChange="changeTab"
              ></TabMenu>

              <NuxtLink
                :to="filterTable === 'farm' ? '/farms/' : filterTable === 'staking' ? '/staking/' : '/pools/'"
                class="option-goto-container fcs-container icon-cursor"
              >
                <span class="goto-label font-medium weight-semi spacing-small"
                  >Go to {{ filterTable === 'farm' ? 'farm' : filterTable === 'staking' ? 'Stakings' : 'Pools' }}</span
                >
                <img class="goto-icon" src="@/assets/icons/goto.svg" />
              </NuxtLink>
            </div>

            <MyFarm v-if="filterTable === 'farm'" :loading="flushing" />
            <MyPool v-else-if="filterTable === 'pool'" :loading="flushing" />
            <MyStakingProject v-else :loading="flushing" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { get, set, cloneDeep, forIn, indexOf } from 'lodash-es'
import { getBigNumber, toBigNumber } from '@/utils/layouts'
import { TokenAmount } from '@/utils/safe-math'
import { Row, Col, Button, Tooltip } from 'ant-design-vue'
import LineChart from '../components/ChartLine.vue'
import PieChart from '../components/ChartPie.vue'
import DoughnutChart from '../components/ChartDoughnut.vue'
import { getTokenByMintAddress, TOKENS } from '@/utils/tokens'


import BigNumber from 'bignumber.js'
import { getPoolByLpMintAddress, getAllCropperPools } from '@/utils/pools'
import moment from 'moment'
import { harvestAll_v2 } from '@/utils/stake'
import {
  DEVNET_MODE,
  FARM_PROGRAM_ID,
  FARM_INITIAL_SUPER_OWNER,
  FARM_VERSION,
  REMOVE_REWARDS_FARM_ADDRESS
} from '@/utils/ids'

import {
  getAllPools as getAllPoolsProject,
  getUserState as getUserStateProject,
  estimateRewards as estimateRewardsProject,
  harvest as harvestProject,
  stake as stakeProject,
  unstake as unstakeProject
} from '@/utils/crp-staking-project'


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

import * as anchor from '@project-serum/anchor'
const { BN } = anchor

import { getUnixTs } from '@/utils'
Vue.prototype.moment = moment

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

declare const window: any

export default Vue.extend({
  components: { PieChart, DoughnutChart, Row, Col, Button, Tooltip },
  data() {
    return {
      lockData: [
        {
          tier: 1,
          time: 1,
          minutesLock: 43200,
          min: 0,
          days: 30,
          boost: 1,
          apy: 11.1,
          text: 'Boost for 1 month locked'
        },
        {
          tier: 2,
          time: 3,
          minutesLock: 129600,
          min: 0,
          days: 90,
          boost: 1.1,
          apy: 12.21,
          text: 'Boost for 3 months locked'
        },
        {
          tier: 3,
          time: 6,
          minutesLock: 259200,
          min: 0,
          days: 180,
          boost: 1.3,
          apy: 14.43,
          text: 'Boost for 6 months locked'
        },
        {
          tier: 4,
          time: 12,
          minutesLock: 525600,
          min: 0,
          days: 365,
          boost: 2,
          apy: 22.19,
          text: 'Boost for 1 year locked'
        }
      ],
      liqstakposition: false as boolean,
      liqstakposition2: false as boolean,
      TVL: 0,
      activeSpinning: false as boolean,
      timer: null as any,
      loading: false as boolean,
      autoRefreshTime: 60 as number,
      countdown: 0,
      filterTable: 'farm' as string,
      showTabMenu: false as boolean,
      positionTab: 'farm' as string,
      rewardsStructure: [] as any[],
      defaultData: {
        labels: ['loading'],
        datasets: [
          {
            label: '',
            borderColor: '#5D5E62',
            borderWidth: 1,
            data: [100],
            backgroundColor: ['#5D5E62']
          }
        ]
      },
      tvlData: {
        labels: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30
        ],
        datasets: [
          {
            label: '',
            borderColor: '#23ADB4',
            borderWidth: 0.67,
            backgroundColor: '#1B326A',
            data: [
              40, 30, 60, 80, 70, 90, 20, 50, 10, 100, 40, 30, 60, 80, 70, 90, 20, 50, 10, 100, 40, 30, 60, 80, 70, 90,
              20, 50, 10, 100
            ]
          }
        ]
      },
      tvlOption: {
        responsive: true,
        maintainAspectRatio: false,
        bezierCurve: false,
        legend: {
          display: false
        },
        elements: {
          point: {
            radius: 0
          }
        },
        scales: {
          xAxes: [
            {
              display: false
            }
          ],
          yAxes: [
            {
              display: false
            }
          ]
        }
      },
      APRData: {
        labels: ['1'],
        datasets: [
          {
            label: '',
            borderColor: '#5D5E62',
            borderWidth: 1,
            data: [100],
            backgroundColor: ['#5D5E62']
          }
        ]
      },
      tempAPRData: {
        labels: ['1'],
        datasets: [
          {
            label: '',
            borderColor: '#5D5E62',
            borderWidth: 1,
            data: [100],
            backgroundColor: ['#5D5E62']
          }
        ]
      },
      APROption: {
        responsive: true,
        maintainAspectRatio: true,
        legend: {
          display: false
        }
      },
      boostAPY: 1,
      LiquidityPositionsData: {
        labels: ['1'],
        datasets: [
          {
            label: '',
            borderColor: '#5D5E62',
            borderWidth: 1,
            data: [100],
            backgroundColor: ['#5D5E62']
          }
        ]
      },
      FarmPositionsData: {
        labels: ['1'],
        datasets: [
          {
            label: '',
            borderColor: '#5D5E62',
            borderWidth: 1,
            data: [100],
            backgroundColor: ['#5D5E62']
          }
        ]
      },
      StakingProjectPositionsData: {
        labels: ['1'],
        datasets: [
          {
            label: '',
            borderColor: '#5D5E62',
            borderWidth: 1,
            data: [100],
            backgroundColor: ['#5D5E62']
          }
        ]
      },
      LiquidityPositionsRewardData: {
        labels: ['1'],
        datasets: [
          {
            label: '',
            borderColor: '#5D5E62',
            borderWidth: 1,
            data: [100],
            backgroundColor: ['#5D5E62']
          }
        ]
      },

      tempLiquidityPositionsData: {
        labels: ['1'],
        datasets: [
          {
            label: '',
            borderColor: '#5D5E62',
            borderWidth: 1,
            data: [100],
            backgroundColor: ['#5D5E62']
          }
        ]
      },
      tempFarmPositionsData: {
        labels: ['1'],
        datasets: [
          {
            label: '',
            borderColor: '#5D5E62',
            borderWidth: 1,
            data: [100],
            backgroundColor: ['#5D5E62']
          }
        ]
      },

      tempStakingProjectPositionsData: {
        labels: ['1'],
        datasets: [
          {
            label: '',
            borderColor: '#5D5E62',
            borderWidth: 1,
            data: [100],
            backgroundColor: ['#5D5E62']
          }
        ]
      },

      tempLiquidityPositionsRewardData: {
        labels: ['1'],
        datasets: [
          {
            label: '',
            borderColor: '#5D5E62',
            borderWidth: 1,
            data: [100],
            backgroundColor: ['#5D5E62']
          }
        ]
      },
      LiquidityPositionsOption: {
        responsive: true,
        maintainAspectRatio: true,
        legend: {
          display: false
        },
        cutoutPercentage: 80
      },
      ModePositions: '%' as string,
      revenueType: 'day',
      randomTVL: 314197663.01,
      farmLoaded: false as boolean,
      updating: false as boolean,
      flushing: true as boolean,
      loadingDatas: true as boolean,
      farms: [] as any[],
      liquidityPositions: {} as any,
      farmsPositions: {} as any,
      farmsPositionsRewards: {} as any,
      templiquidityPositions: {} as any,
      tempfarmsPositions: {} as any,
      tempfarmsPositionsRewards: {} as any,

      temppositionRewardsGraph: {} as any,
      positionRewardsGraph: {} as any,
      globalpositionRewardsGraph: 0 as any,
      tempglobalpositionRewardsGraph: 0 as any,

      stakingProjectPositions : {} as any,
      stakingProjectPositionsRewards: {} as any,
      tempStakingProjectPositions : {} as any,
      tempStakingProjectPositionsRewards: {} as any,

      APR: 0,
      FEES: 0,
      stakingAPR: 0,
      stakingProjectAPR:0,

      posStaking: 0,
      posFarming: 0,
      posLiquidity: 0,
      posStakingProject: 0,

      tempAPR: 0,
      tempFEES: 0,
      tempstakingAPR: 0,

      tempposStaking: 0,
      tempposFarming: 0,
      tempposLiquidity: 0,

      harvestAlling: false,


      harvesting: [] as boolean[],

      userTVL: 0,
      tempuserTVL: 0,
      searchName: '',
      randomAPR: 1.4,
      currentTiers: 0 as any,
      pendingReward: 0 as any,
      temppendingReward: 0 as any,
      userStaked: 0 as any,
      tempuserStaked: 0 as any,
      globpositionsRewardsFarms: 0,
      tempglobpositionsRewardsFarms: 0,

      currentTimestamp: 0,
      poolsDatas: {} as any,
      searchCertifiedFarm: 'labelized' as string,
      searchLifeFarm: false as boolean,

      windowWidth: window.innerWidth as any
    }
  },
  head: {
    title: 'CropperFinance Dashboard'
  },
  computed: {
    ...mapState(['app', 'wallet', 'farm', 'url', 'price', 'liquidity'])
  },
  watch: {
    'wallet.connected': {
      handler(connected: any) {
        if (!connected) {
          this.$router.push({ path: `/swap` })
        }
        this.flush(true)
      },
      deep: true
    }
  },
  async asyncData({ $api }) {
    window.poolsDatas = {} as any

    try {
      window.poolsDatas = await fetch('https://api.cropper.finance/cmc/').then((res) => res.json())
    } catch {
      window.poolsDatas = []
    } finally {
    }

    const pools = getAllCropperPools()
    return { pools }
  },

  async mounted() {
    if (!this.wallet.connected) {
      this.$router.push({ path: `/swap` })
    }
    await this.getTvl()
    this.timer = setInterval(async () => {
      clearInterval(this.timer)
      this.setTimer()
    }, 1000)
    await this.delay(1000)
    await this.flush(true)
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize)
    })
  },
  methods: {
    async flush(force: boolean = false) {
      if (!this.loadingDatas || force) {
        this.tempuserTVL = 0
        this.tempAPR = 0
        this.tempFEES = 0
        this.tempstakingAPR = 0
        this.temppositionRewardsGraph = {}

        await this.getUserStateStaking()
        await this.getTabValues()

        clearInterval(this.timer)
        this.countdown = 0
        this.setTimer()

        await this.getUserProjectStaking()

        await this.positionRewardDisplay()

        this.userTVL = this.tempuserTVL
        this.APR = this.tempAPR
        this.FEES = this.tempFEES
        this.stakingAPR = this.tempstakingAPR
        this.posStaking = this.tempposStaking
        this.posFarming = this.tempposFarming
        this.posLiquidity = this.tempposLiquidity
        this.LiquidityPositionsData = this.tempLiquidityPositionsData
        this.FarmPositionsData = this.tempFarmPositionsData
        this.LiquidityPositionsRewardData = this.tempLiquidityPositionsRewardData
        this.APRData = this.tempAPRData
        this.liquidityPositions = this.templiquidityPositions
        this.farmsPositions = this.tempfarmsPositions
        this.farmsPositionsRewards = this.tempfarmsPositionsRewards
        this.stakingProjectPositions = this.tempStakingProjectPositions
        this.stakingProjectPositionsRewards = this.tempStakingProjectPositionsRewards


        this.pendingReward = this.temppendingReward
        this.userStaked = this.tempuserStaked
        this.globpositionsRewardsFarms = this.tempglobpositionsRewardsFarms

        this.liqstakposition = true
        this.liqstakposition2 = true

        this.flushing = false
        this.loadingDatas = false
      }
    },

    switchModePositions() {
      if (this.ModePositions == '%') {
        this.ModePositions = '$'
      } else {
        this.ModePositions = '%'
      }
    },

    async getUserProjectStaking(){

      if (!this.$accessor.token.initialized) return
      const pools = await getAllPoolsProject(this.$web3, this.$wallet)

      let tempProjectInfos = [];
      let tempProjectInfosEnded = [];

      let positions = {} as any
      let positionsRewards = {} as any

      let globalStakingPos = 0;

      for (let i = 0; i < pools.length; i++) {

        const pool = pools[i].account
        const key = pools[i].publicKey.toString()
        const mint = pool.mint.toString()

        let amount = 0
        let reward = 0
        let lastTimeLocked = 0

        const user = await getUserStateProject(this.$web3, this.$wallet, mint)
        if (user) {
          const token = await getTokenByMintAddress(mint)
          lastTimeLocked = user.lastStakeTime.toNumber()
          amount = parseFloat(new TokenAmount(user.amount, token?.decimals).fixed())
          reward = parseFloat(new TokenAmount(estimateRewardsProject(pool, user), token?.decimals).fixed())
        
          const price = token ? this.price.prices[token.symbol.toUpperCase()] : 0

          if(this.price.prices[token?.symbol as string] > 0){
            globalStakingPos += amount * price

            //@ts-ignore
            positions[token?.symbol] = amount * price
            //@ts-ignore
            positionsRewards[token?.symbol] = reward * price
          }
          //@ts-ignore
          if (!this.temppositionRewardsGraph[token?.symbol]) {
          //@ts-ignore
            this.temppositionRewardsGraph[token?.symbol] = 0
          }
          //@ts-ignore
          this.temppositionRewardsGraph[token?.symbol] += reward * this.price.prices[token?.symbol as string]

          if(this.price.prices[token?.symbol as string] > 0){
            this.tempglobalpositionRewardsGraph += reward * this.price.prices[token?.symbol as string]
          }


          const tokenPerSecond = pool.tokenPerSecond.toNumber()
          const lockDuration = pool.lockDuration.toNumber()

          const apr =
            ((tokenPerSecond) * 365 * 24 * 3600) /
            (pool.amount.toNumber())

          //const apy = Number(((1 + apr / 365) ** 365 - 1) * 100)
          const apy = apr


          this.tempuserTVL += amount * price
          this.tempAPR += (amount * price * apr) / 100

        }
      }


      let bgColors = [
        '#E0F4F6',
        '#A1DFE5',
        '#23ADB4',
        '#15686C',
        '#F2F3FC',
        '#98A2E4',
        '#6574D6',
        '#3548C5',
        '#D9BDDF',
        '#A262AC',
        '#693F73',
        '#F1A6BC',
        '#CC5075',
        '#9D2246'
      ]

      this.tempStakingProjectPositionsData = {
        labels: [],
        datasets: [
          {
            label: '',
            borderColor: '#172058',
            borderWidth: 1,
            data: [],
            backgroundColor: []
          }
        ]
      };
      this.tempStakingProjectPositions = []


      let i = 0
      let others = 0

      Object.keys(positions).forEach((key) => {
        if ((positions[key] * 100) / globalStakingPos > 1) {
          this.tempStakingProjectPositionsData.labels.push(key)
          this.tempStakingProjectPositionsData.datasets[0].data.push(
            Math.round(((positions[key] * 100) / globalStakingPos) * 100) / 100
          )
          this.tempStakingProjectPositionsData.datasets[0].backgroundColor.push(bgColors[i])

          this.tempStakingProjectPositions.push({
            token: key,
            color: bgColors[i],
            usdcVal: positions[key],
            ratio: (positions[key] * 100) / globalStakingPos
          })

          i++
        } else {
          others += positions[key]
        }
      })


      if (others > 0) {
        this.tempStakingProjectPositionsData.labels.push('Others')
        this.tempStakingProjectPositionsData.datasets[0].data.push(Math.round(((others * 100) / globalStakingPos) * 100) / 100)
        this.tempStakingProjectPositionsData.datasets[0].backgroundColor.push(bgColors[i])

        this.tempStakingProjectPositions.push({
          token: 'Others',
          color: bgColors[i],
          usdcVal: others,
          ratio: (others * 100) / globalStakingPos
        })
      }

      this.StakingProjectPositionsData = this.tempStakingProjectPositionsData
      this.stakingProjectPositions = this.tempStakingProjectPositions
      this.posStakingProject = globalStakingPos
      this.tempuserTVL += globalStakingPos
    },


    async positionRewardDisplay(){

        this.positionRewardsGraph = {}

        this.tempLiquidityPositionsRewardData = {
          labels: [],
          datasets: [
            {
              label: '',
              borderColor: '#172058',
              borderWidth: 1,
              data: [],
              backgroundColor: []
            }
          ]
        }

        let bgColors = [
          '#E0F4F6',
          '#A1DFE5',
          '#23ADB4',
          '#15686C',
          '#F2F3FC',
          '#98A2E4',
          '#6574D6',
          '#3548C5',
          '#D9BDDF',
          '#A262AC',
          '#693F73',
          '#F1A6BC',
          '#CC5075',
          '#9D2246'
        ]

      this.tempfarmsPositionsRewards = []
      this.tempglobalpositionRewardsGraph += this.temppendingReward * this.price.prices['CRP']

      let others = 0

      let i = 0

      if (this.temppositionRewardsGraph['CRP'] > 0 || this.temppendingReward > 0) {
        let rewardKey = this.temppositionRewardsGraph['CRP']

        if (this.temppositionRewardsGraph['CRP'] <= 0 || this.temppositionRewardsGraph['CRP'] == undefined) {
          rewardKey = 0
        }

        rewardKey += this.temppendingReward * this.price.prices['CRP']

        this.tempLiquidityPositionsRewardData.labels.push('CRP')
        this.tempLiquidityPositionsRewardData.datasets[0].data.push(
          Math.round(((rewardKey * 100) / this.tempglobalpositionRewardsGraph) * 100) / 100
        )
        this.tempLiquidityPositionsRewardData.datasets[0].backgroundColor.push(bgColors[i])
        this.tempfarmsPositionsRewards.push({
          token: 'CRP',
          color: bgColors[i],
          usdcVal: rewardKey,
          ratio: (rewardKey * 100) / this.tempglobalpositionRewardsGraph
        })
        i++
      }

      Object.keys(this.temppositionRewardsGraph).forEach((key) => {
        if (key != 'CRP') {
          let rewardKey = this.temppositionRewardsGraph[key]
          if ((rewardKey * 100) / this.tempglobalpositionRewardsGraph > 1) {
            this.tempLiquidityPositionsRewardData.labels.push(key)
            this.tempLiquidityPositionsRewardData.datasets[0].data.push(
              Math.round(((rewardKey * 100) / this.tempglobalpositionRewardsGraph) * 100) / 100
            )
            this.tempLiquidityPositionsRewardData.datasets[0].backgroundColor.push(bgColors[i])
            this.tempfarmsPositionsRewards.push({
              token: key,
              color: bgColors[i],
              usdcVal: rewardKey,
              ratio: (rewardKey * 100) / this.tempglobalpositionRewardsGraph
            })
            i++
          } else {
            if(this.temppositionRewardsGraph[key] > 0){
              others += this.temppositionRewardsGraph[key]
            }
          }
        }
      })

      if (others > 0) {
        this.tempLiquidityPositionsRewardData.labels.push('Others')
        this.tempLiquidityPositionsRewardData.datasets[0].data.push(
          Math.round(((others * 100) / this.tempglobalpositionRewardsGraph) * 100) / 100
        )
        this.tempLiquidityPositionsRewardData.datasets[0].backgroundColor.push(bgColors[i])

        this.tempfarmsPositionsRewards.push({
          token: 'Others',
          color: bgColors[i],
          usdcVal: others,
          ratio: (others * 100) / this.tempglobalpositionRewardsGraph
        })
      }

      if (this.temppendingReward > 0 && this.temppendingReward != undefined) {
        this.tempglobalpositionRewardsGraph -= this.temppendingReward * this.price.prices['CRP']
      }

      this.tempfarmsPositionsRewards = this.tempfarmsPositionsRewards.sort((a: any, b: any) => b.usdcVal - a.usdcVal)
      this.positionRewardsGraph = this.temppositionRewardsGraph 



    },

    async getUserStateStaking() {
      if (!this.$accessor.token.initialized || !this.$wallet?.connected) {
        return
      }

      const farm_state = await getFarmState()
      const extraRewardConfigs = await getExtraRewardConfigs()
      const pools = await getAllPools()
      const current_pool = pools[0]
      const userAccount = await getPoolUserAccount(this.$wallet, current_pool.publicKey)

      const endDateOfLock = userAccount.lastStakeTime.toNumber() + userAccount.lockDuration.toNumber()
      const unlockDateString = moment(new Date(endDateOfLock * 1000)).format('MM/DD/YYYY HH:mm:SS')

      await getExtraRewardConfigs().then((res: any) => {
        res.configs.forEach((item: any, index: number) => {
          if (userAccount.lockDuration.toNumber() != item.duration.toNumber()) {
            return
          }

          this.lockData[index].minutesLock = item.duration / 60
          this.lockData[index].boost = item.extraPercentage / (100 * 1000 * 1000 * 1000) + 1

          var currentDate = moment()
          this.lockData[index].min = moment(currentDate).add('days', this.lockData[index].days).unix()

          this.boostAPY = item.extraPercentage / (100 * 1000 * 1000 * 1000) + 1
        })

        if (this.boostAPY < 1) {
          this.boostAPY = 1
        }
      })

      //@ts-ignore
      this.tempuserStaked =
        Math.ceil(parseFloat(new TokenAmount(userAccount.amount, TOKENS['CRP'].decimals).fixed()) * 1000) / 1000

      this.tempuserTVL += this.tempuserStaked * this.price.prices['CRP']

      let gs = await this.getGlobalState()

      //@ts-ignore
      this.tempstakingAPR = (this.tempuserStaked * this.price.prices['CRP'] * gs) / 100

      this.tempposStaking = this.tempuserStaked * this.price.prices['CRP']

      const rewardAmount = estimateRewards(farm_state, extraRewardConfigs, current_pool.account, userAccount)
      const rewardsPerSec = estimateRewardsPerSec(farm_state, extraRewardConfigs, current_pool.account, userAccount)
      const tiers_info = calculateTiers(this.tempuserStaked, userAccount.lockDuration.toNumber(), this.$accessor.wallet)
      this.$accessor.wallet.setStakingTiers(tiers_info)
      this.temppendingReward = new TokenAmount(rewardAmount, TOKENS['CRP'].decimals).fixed()
      this.currentTiers = tiers_info.tiers
    },

    async getGlobalState() {
      if (!this.$accessor.token.initialized) {
        return
      }

      const pools = await getAllPools()
      const current_pool = pools[0].account

      const farm_state = await getFarmState()
      const stakedAmount = new TokenAmount(current_pool.amount, TOKENS['CRP'].decimals)

      let totalStakedPrice

      if (this.price.prices['CRP']) {
        totalStakedPrice =
          '$' +
          (Math.round(parseFloat(stakedAmount.fixed()) * this.price.prices['CRP'] * 1000) / 1000)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      } else {
        totalStakedPrice = '$' + parseFloat(stakedAmount.fixed())
      }

      let totalStaked =
        'CRP ' +
        (Math.round(parseFloat(stakedAmount.fixed()) * 1000) / 1000).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

      const apr =
        (Number(new TokenAmount(farm_state.tokenPerSecond, TOKENS['CRP'].decimals).fixed()) * 365 * 24 * 3600) /
        Number(new TokenAmount(current_pool.amount, TOKENS['CRP'].decimals).fixed())

      let estimatedAPY = Number(((1 + apr / 365) ** 365 - 1) * 100)

      return apr * 100
    },

    async harvestRewardStaking() {
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
          this.temppendingReward = 0
          this.$accessor.wallet.getTokenAccounts()
          this.flush()
        })
    },

    async getTabValues(forced: any = false) {
      if (!forced) {
        this.liqstakposition = false
      }
      this.liqstakposition2 = false
      await this.updateFarms(forced)
      await this.poolsFormated(forced)

      this.tempAPRData = {
        labels: ['APR', 'Fees', 'Staking'],
        datasets: [
          {
            label: '',
            borderColor: '#172058',
            borderWidth: 1,
            data: [
              Math.round(((this.tempAPR * 100) / this.tempuserTVL) * 100) / 100,
              Math.round(((this.tempFEES * 100) / this.tempuserTVL) * 100) / 100,
              Math.round(((this.tempstakingAPR * this.boostAPY * 100) / this.tempuserTVL) * 100) / 100
            ],
            backgroundColor: ['#23ADB4', '#3548C5', '#1F2A75']
          }
        ]
      }

      if (forced) {
        this.liqstakposition = true
        this.liqstakposition2 = true
      }
    },

    harvestAll_v2Farms() {

      if(this.harvestAlling){
        return
      }

      this.harvestAlling = true

      let harvestableFarms = this.farms.filter(
        (farm: any) => farm.userInfo.depositBalance.wei.toNumber() > 0 && !farm.userInfo.pendingReward.isNullOrZero()
      );

      harvestableFarms.forEach((farm, idx) => {
        this.harvesting[idx] = true;
      })
      harvestableFarms = harvestableFarms.map(farm => farm.farmInfo);

      const conn = this.$web3
      const wallet = (this as any).$wallet
      
      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })
      
      harvestAll_v2(conn, wallet, harvestableFarms, this.wallet.tokenAccounts).then((arrTx) => {
          this.$notify.info({
            key,
            message: 'Transaction has been sent',
            description: (h: any) =>
              h('div', [
                'Confirmation is in progress.  Check your transaction on ',
                h(
                  'a',
                  {
                    attrs: { href: `${this.url.explorer}/tx/${arrTx[0]}`, target: '_blank' }
                  },
                  'here'
                )
              ])
          })
          // FIXME: detailed description
          //const description = `Harvest ${farmInfo.reward.symbol} from ${farmInfo.lp.name}`
          const description = "Harvest ALL";
          arrTx.forEach(txid => {
            this.$accessor.transaction.sub({ txid, description })
          })
        })
        .catch((error) => {
          console.error("phoon error =", error);
          this.$notify.error({
            key,
            message: 'Harvest ALL failed',
            description: error.message
          })
          this.$accessor.farm.requestInfos()
          this.$accessor.wallet.getTokenAccounts()
          this.harvestAlling = false
          this.flush()
        })
        .finally(() => {
          this.$accessor.farm.requestInfos()

          harvestableFarms.forEach((farm, idx) => {
            this.harvesting[idx] = false;
          })

          this.$accessor.farm.requestInfos()
          this.$accessor.wallet.getTokenAccounts()
          this.harvestAlling = false
          this.flush()
      });
    },

    async poolsFormated(forced: any = false) {
      if (!this.wallet.connected) {
        return
      }
      const conn = this.$web3
      const wallet = (this as any).$accessor.wallet
      const liquidity = (this as any).$accessor.liquidity

      const polo: any = []

      let positions = {} as any
      let globpositions = 0

      let allPools = getAllCropperPools()

      for (let i in allPools) {
        let value = allPools[i]
        const liquidityItem = get(liquidity.infos, value.lp_mint)

        if (!liquidityItem) {
          return
        }

        let liquidityTotalValue = 0
        let liquidityItemValue = 0

        if (window.poolsDatas[value.ammId]) {
          liquidityTotalValue = window.poolsDatas[value.ammId].tvl
          liquidityItemValue = window.poolsDatas[value.ammId].last_price
        }
        value.liquidity = liquidityTotalValue

        if (!window.poolsDatas) {
          window.poolsDatas = {}
        }

        if (window.poolsDatas[value.ammId]) {
          value.apy = window.poolsDatas[value.ammId].apy
        } else {
          value.apy = 0
        }

        value.nameSymbol = value.coin1.symbol + ' - ' + value.coin2.symbol

        value.currentUnformated = null

        if (wallet) {
          value.current = get(wallet.tokenAccounts, `${value.lp_mint}.balance`)
          value.currentUnformated = value.current
          if (value.current) {
            value.current = value.current.wei.toNumber() / Math.pow(10, value.current.decimals)

            if (value.current > 0) {
              globpositions += value.current * window.poolsDatas[value.ammId]['last_price']

              if (!positions[value.coin1.symbol]) {
                positions[value.coin1.symbol] = 0
              }

              if (!positions[value.coin2.symbol]) {
                positions[value.coin2.symbol] = 0
              }

              positions[value.coin1.symbol] += (value.current * window.poolsDatas[value.ammId]['last_price']) / 2
              positions[value.coin2.symbol] += (value.current * window.poolsDatas[value.ammId]['last_price']) / 2

              if (!forced) {
                this.tempuserTVL += value.current * window.poolsDatas[value.ammId]['last_price']
                this.tempFEES +=
                  (value.current * window.poolsDatas[value.ammId]['last_price'] * window.poolsDatas[value.ammId].apy) /
                  100
              }
            }
          }
        }
      }

      this.tempLiquidityPositionsData = {
        labels: [],
        datasets: [
          {
            label: '',
            borderColor: '#172058',
            borderWidth: 1,
            data: [],
            backgroundColor: []
          }
        ]
      }

      this.templiquidityPositions = []

      let bgColors = [
        '#E0F4F6',
        '#A1DFE5',
        '#23ADB4',
        '#15686C',
        '#F2F3FC',
        '#98A2E4',
        '#6574D6',
        '#3548C5',
        '#D9BDDF',
        '#A262AC',
        '#693F73',
        '#F1A6BC',
        '#CC5075',
        '#9D2246'
      ]

      let i = 0
      let others = 0

      Object.keys(positions).forEach((key) => {
        if ((positions[key] * 100) / globpositions > 1) {
          this.tempLiquidityPositionsData.labels.push(key)
          this.tempLiquidityPositionsData.datasets[0].data.push(
            Math.round(((positions[key] * 100) / globpositions) * 100) / 100
          )
          this.tempLiquidityPositionsData.datasets[0].backgroundColor.push(bgColors[i])

          this.templiquidityPositions.push({
            token: key,
            color: bgColors[i],
            usdcVal: positions[key],
            ratio: (positions[key] * 100) / globpositions
          })

          i++
        } else {
          others += positions[key]
        }
      })

      if (others > 0) {
        this.tempLiquidityPositionsData.labels.push('Others')
        this.tempLiquidityPositionsData.datasets[0].data.push(Math.round(((others * 100) / globpositions) * 100) / 100)
        this.tempLiquidityPositionsData.datasets[0].backgroundColor.push(bgColors[i])

        this.templiquidityPositions.push({
          token: 'Others',
          color: bgColors[i],
          usdcVal: others,
          ratio: (others * 100) / globpositions
        })
      }

      this.tempposLiquidity = globpositions

      this.templiquidityPositions = this.templiquidityPositions.sort((a: any, b: any) => b.usdcVal - a.usdcVal)
    },

    async delay(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },

    async updateFarms(forced: any = false) {
      if (!this.wallet.connected) {
        return
      }
      if (this.updating) {
        return
      }

      let positions = {} as any
      let globpositionsFarms = 0

      let positionsRewards = {} as any
      let globpositionsRewardsFarms = 0
      this.updating = true

      this.$accessor.token.loadTokens()
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

        if (!get(this.farm.stakeAccounts, poolId)) {
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
            apr: ((apr as any) * 100) / 100,
            apy: 0
          } as any

          if (window.poolsDatas[liquidityItem.ammId] && window.poolsDatas[liquidityItem.ammId]['apy']) {
            let apy = window.poolsDatas[liquidityItem.ammId]['apy']
            newFarmInfo.apr = (((apr as any) * 1 - (apy as any) * -1) * 100) / 100
            newFarmInfo.apr_details.apy = (apy * 100) / 100
          }

          // @ts-ignore
          newFarmInfo.liquidityUsdValue = liquidityUsdValue
        }

        let userInfo = get(this.farm.stakeAccounts, poolId)


        if (userInfo && lp && FARM_VERSION === 1) {
          userInfo = cloneDeep(userInfo)

          const { rewardDebt, depositBalance } = userInfo
          let currentTimestamp = this.currentTimestamp

          if (depositBalance.wei.toNumber() <= 0) {
            continue
          }

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

          if (pendingReward.toNumber() > newFarmInfo.reward.balance.wei.toNumber()) {
            pendingReward = newFarmInfo.reward.balance.wei
          }

          userInfo.depositCoin = (
            Math.round((partCoin as any) * userInfo.depositBalance.format() * 10000) / 10000
          ).toFixed(2)

          userInfo.depositPc = (Math.round((partPc as any) * userInfo.depositBalance.format() * 10000) / 10000).toFixed(
            2
          )

          if (!positions[liquidityItem?.coin.symbol]) {
            positions[liquidityItem?.coin.symbol] = 0
          }

          if (!positions[liquidityItem?.pc.symbol]) {
            positions[liquidityItem?.pc.symbol] = 0
          }

          positions[liquidityItem?.coin.symbol] +=
            userInfo.depositCoin * this.price.prices[liquidityItem?.coin.symbol as string]
          positions[liquidityItem?.pc.symbol] +=
            userInfo.depositPc * this.price.prices[liquidityItem?.pc.symbol as string]

          globpositionsFarms += userInfo.depositCoin * this.price.prices[liquidityItem?.coin.symbol as string]
          globpositionsFarms += userInfo.depositPc * this.price.prices[liquidityItem?.pc.symbol as string]

          if (newFarmInfo.lpUSDvalue) {
            userInfo.depositBalanceUSD = (
              Math.round(newFarmInfo.lpUSDvalue * userInfo.depositBalance.format() * 100) / 100
            )
              .toFixed(2)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }

          userInfo.pendingReward = new TokenAmount(pendingReward, newFarmInfo.reward.decimals)


          if (!this.temppositionRewardsGraph[newFarmInfo.reward.symbol]) {
            this.temppositionRewardsGraph[newFarmInfo.reward.symbol] = 0
          }
          this.temppositionRewardsGraph[newFarmInfo.reward.symbol] +=
            userInfo.pendingReward.toEther().toNumber() * this.price.prices[newFarmInfo.reward.symbol as string]
          this.tempglobalpositionRewardsGraph += userInfo.pendingReward.toEther().toNumber() * this.price.prices[newFarmInfo.reward.symbol as string]
          this.tempglobpositionsRewardsFarms += userInfo.pendingReward.toEther().toNumber() * this.price.prices[newFarmInfo.reward.symbol as string]


          if (!forced) {
            this.tempuserTVL += newFarmInfo.lpUSDvalue * userInfo.depositBalance.format()
            this.tempAPR +=
              (newFarmInfo.lpUSDvalue * userInfo.depositBalance.format() * newFarmInfo.apr_details.apr) / 100
            this.tempFEES +=
              (newFarmInfo.lpUSDvalue * userInfo.depositBalance.format() * newFarmInfo.apr_details.apy) / 100
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

          if(end_timestamp.toNumber() * 1000 > getUnixTs()){
            farms.push({
                userInfo,
                farmInfo: newFarmInfo
              });
          }


        } else if (userInfo && lp && FARM_VERSION > 1) {
          userInfo = cloneDeep(userInfo)

          const { rewardDebt, depositBalance } = userInfo
          let currentTimestamp = this.currentTimestamp

          const liquidityItem = get(this.liquidity.infos, lp.mintAddress)
          if (depositBalance.wei.toNumber() <= 0) {
            continue
          }

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

          if (pendingReward.toNumber() > newFarmInfo.reward.balance.wei.toNumber()) {
            pendingReward = newFarmInfo.reward.balance.wei
          }

          userInfo.depositCoin = (
            Math.round((partCoin as any) * userInfo.depositBalance.format().replace(/,/g, '') * 10000) / 10000
          ).toFixed(2)

          userInfo.depositPc = (
            Math.round((partPc as any) * userInfo.depositBalance.format().replace(/,/g, '') * 10000) / 10000
          ).toFixed(2)

          if (!positions[liquidityItem?.coin.symbol]) {
            positions[liquidityItem?.coin.symbol] = 0
          }

          if (!positions[liquidityItem?.pc.symbol]) {
            positions[liquidityItem?.pc.symbol] = 0
          }

          positions[liquidityItem?.coin.symbol] +=
            userInfo.depositCoin * this.price.prices[liquidityItem?.coin.symbol as string]
          positions[liquidityItem?.pc.symbol] +=
            userInfo.depositPc * this.price.prices[liquidityItem?.pc.symbol as string]
          globpositionsFarms += userInfo.depositCoin * this.price.prices[liquidityItem?.coin.symbol as string]
          globpositionsFarms += userInfo.depositPc * this.price.prices[liquidityItem?.pc.symbol as string]

          if (newFarmInfo.lpUSDvalue) {
            userInfo.depositBalanceUSD = (
              Math.round(newFarmInfo.lpUSDvalue * userInfo.depositBalance.format().replace(/,/g, '') * 100) / 100
            )
              .toFixed(2)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }

          userInfo.pendingReward = new TokenAmount(pendingReward, newFarmInfo.reward.decimals)

          if (!this.temppositionRewardsGraph[newFarmInfo.reward.symbol]) {
            this.temppositionRewardsGraph[newFarmInfo.reward.symbol] = 0
          }
          this.temppositionRewardsGraph[newFarmInfo.reward.symbol] +=
            userInfo.pendingReward.toEther().toNumber() * this.price.prices[newFarmInfo.reward.symbol as string]
          this.tempglobalpositionRewardsGraph += userInfo.pendingReward.toEther().toNumber() * this.price.prices[newFarmInfo.reward.symbol as string]
          this.tempglobpositionsRewardsFarms += userInfo.pendingReward.toEther().toNumber() * this.price.prices[newFarmInfo.reward.symbol as string]

          if (!forced && newFarmInfo.lpUSDvalue * userInfo.depositBalance.format() > 0) {
            this.tempuserTVL += newFarmInfo.lpUSDvalue * userInfo.depositBalance.format() * 1
            this.tempAPR +=
              (newFarmInfo.lpUSDvalue * userInfo.depositBalance.format() * newFarmInfo.apr_details.apr) / 100
            this.tempFEES +=
              (newFarmInfo.lpUSDvalue * userInfo.depositBalance.format() * newFarmInfo.apr_details.apy) / 100
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

          if(end_timestamp.toNumber() * 1000 > getUnixTs()){
            farms.push({
                userInfo,
                farmInfo: newFarmInfo
              });
          }


        } else {
          continue
        }
      }

      this.tempFarmPositionsData = {
        labels: [],
        datasets: [
          {
            label: '',
            borderColor: '#172058',
            borderWidth: 1,
            data: [],
            backgroundColor: []
          }
        ]
      }

      this.tempLiquidityPositionsRewardData = {
        labels: [],
        datasets: [
          {
            label: '',
            borderColor: '#172058',
            borderWidth: 1,
            data: [],
            backgroundColor: []
          }
        ]
      }

      this.tempfarmsPositions = []

      let bgColors = [
        '#E0F4F6',
        '#A1DFE5',
        '#23ADB4',
        '#15686C',
        '#F2F3FC',
        '#98A2E4',
        '#6574D6',
        '#3548C5',
        '#D9BDDF',
        '#A262AC',
        '#693F73',
        '#F1A6BC',
        '#CC5075',
        '#9D2246'
      ]

      let i = 0

      let others = 0

      Object.keys(positions).forEach((key) => {
        if ((positions[key] * 100) / globpositionsFarms > 1) {
          this.tempFarmPositionsData.labels.push(key)
          this.tempFarmPositionsData.datasets[0].data.push(
            Math.round(((positions[key] * 100) / globpositionsFarms) * 100) / 100
          )
          this.tempFarmPositionsData.datasets[0].backgroundColor.push(bgColors[i])

          this.tempfarmsPositions.push({
            token: key,
            color: bgColors[i],
            usdcVal: positions[key],
            ratio: (positions[key] * 100) / globpositionsFarms
          })
          i++
        } else {
          others += positions[key]
        }
      })

      if (others > 0) {
        this.tempFarmPositionsData.labels.push('Others')
        this.tempFarmPositionsData.datasets[0].data.push(Math.round(((others * 100) / globpositionsFarms) * 100) / 100)
        this.tempFarmPositionsData.datasets[0].backgroundColor.push(bgColors[i])

        this.tempfarmsPositions.push({
          token: 'Others',
          color: bgColors[i],
          usdcVal: others,
          ratio: (others * 100) / globpositionsFarms
        })
      }

      this.tempposFarming = globpositionsFarms

      this.tempfarmsPositions = this.tempfarmsPositions.sort((a: any, b: any) => b.usdcVal - a.usdcVal)
      this.farms = farms
      this.updating = false
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
    setTimer() {
      this.timer = setInterval(async () => {
        if (!this.loading) {
          if (this.countdown < this.autoRefreshTime) {
            this.countdown += 1
            if (this.countdown === this.autoRefreshTime) {
              await this.flush()
            }
          }
        }
      }, 1000)
    },
    reloadTimer() {
      this.flush()
      this.$accessor.wallet.getTokenAccounts()
      this.activeSpinning = true
      setTimeout(() => {
        this.activeSpinning = false
      }, 1000)
    },
    convertBalance(balance: any) {
      return balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    onResize() {
      this.windowWidth = window.innerWidth
    },
    changeTab(name: string) {
      this.filterTable = name
    },
    changePositions(name: string) {
      this.positionTab = name
      this.getTabValues(true)
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  }
})
</script>

<style lang="less" scoped>
// global stylesheet
.dashboard {
  .chart-hidden {
    opacity: 0;
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);

    &.no-left {
      left: unset;
      transform: unset;
    }
  }

  .color-label {
    width: 10px;
    height: 10px;
    display: inline-block;
    margin-right: 5px;
    position: relative;
    top: -1px;
  }

  .chart-shown {
    opacity: 1;
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);

    &.no-left {
      left: unset;
      transform: unset;
    }
  }

  .btn-container {
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 48px;
    padding: 3px;
    height: 45px;
    width: 142px;

    .soon {
      &::before,
      &::after {
        content: 'Soon';
        font-size: 16px;
        line-height: 24px;
        font-weight: 600;
        letter-spacing: 0.15px;
        opacity: 0;
      }

      &:hover {
        span {
          display: none;
        }

        &::before,
        &::after {
          opacity: 1;
        }
      }
    }
  }

  .btn-transparent {
    background: transparent;
    border-radius: 48px;
    border: none;
    height: 100%;
    width: 100%;
  }

  .btn-primary {
    background: @color-blue700;
    border-radius: 48px;
    border: none;
    height: 100%;
    width: 100%;
  }

  .btn-transparent,
  .btn-primary {
    color: #fff;

    &:disabled {
      color: #fff;
    }
  }

  .btn-small {
    width: 32px;
    height: 24px;
    border: 1px solid @color-blue300;
    border-radius: 4px;
    margin-bottom: 4px;
    background: rgba(204, 209, 241, 0.14);
    color: @color-blue100;

    &.active {
      background: rgba(204, 209, 241, 0.4);
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .info-icon {
    width: 12px;
    height: 12px;
    margin-left: 4px;
  }

  .arrow-icon {
    transition: all 0.3s;

    &.arrow-up {
      transform: rotate(180deg);
    }
  }

  .goto-icon {
    width: 12px;
    height: 12px;
    margin-left: 8px;
  }

  .item-label {
    color: #ffffff50;
  }

  .option-filter-collapse {
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

    .collapse-item {
      padding: 18px 0;
      border-bottom: 1px solid #c4c4c420;

      &:last-child {
        border-bottom: 0;
      }

      &.active-item {
        color: @color-petrol500;
      }

      a {
        color: #fff;
      }
    }
  }
}

// class stylesheet
.dashboard.container {
  margin-top: 38px;

  @media @max-sl-mobile {
    margin-top: 28px;
  }

  .card {
    .card-body {
      padding: 0;

      .dashboard-head {
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
          @media @max-sl-mobile {
            width: 100%;
          }

          .action-btn-group {
            .reload-btn {
              background: @color-blue600;
              border-radius: 8px;
              padding: 6px;

              @media @max-lg-tablet {
                margin-left: 5px;
              }

              img {
                width: 18px;
                height: 18px;
              }

              &.active img {
                transform: rotate(360deg);
                transition: all 1s ease-in-out;
              }
            }
          }
        }
      }

      .dashboard-content {
        .dashboard-analytics {
          .tier-container {
            position: relative;
            width: calc(50% - 9px);
            max-width: 220px;
            margin-right: 9px;
            border: 4px solid @color-petrol500;
            border-radius: 18px;
            overflow: hidden;
            mask-image: -webkit-radial-gradient(white, black);
            -webkit-mask-image: -webkit-radial-gradient(white, black);

            &.empty {
              background: #000;
            }

            .staking-label {
              &.absolute {
                position: absolute;
                bottom: 10px;
              }
            }

            .tier-img {
              object-fit: cover;
            }
          }

          .analytics-container {
            width: calc(100% - 220px - 9px);
            min-width: calc(50% - 9px);
            margin-left: 9px;
          }

          .analytics-box {
            background: @color-blue700;
            border: 3px solid @color-blue500;
            border-radius: 18px;
            padding: 16px;
            height: 270px;
            overflow: hidden;
            mask-image: -webkit-radial-gradient(white, black);
            -webkit-mask-image: -webkit-radial-gradient(white, black);

            &.analytics-small {
              height: 125px;
              margin-bottom: 20px;

              &:last-child {
                margin-bottom: 0;
              }
            }

            &.analytics-big {
              height: 316px;

              @media @max-md-tablet {
                height: 526px;
              }
            }

            &.analytics-tvl {
              padding: 0;

              .tvl-info {
                padding: 16px;

                .tvl-label {
                  display: block;
                  margin-bottom: 4px;
                }
              }

              @media @max-lg-tablet {
                height: 125px;
              }
            }

            &.analytics-apr {
              width: 100%;

              .apr-info {
                .pie-chart {
                  width: 87px;
                  margin-right: 24px;

                  #pie-chart {
                    width: 100%;
                  }
                }

                .revenue-btn-group {
                  margin-left: 24px;
                }

                .apr-label {
                  display: block;
                  margin-bottom: 4px;
                }

                @media @max-lg-tablet {
                  margin-bottom: 8px;

                  &:last-child {
                    margin-bottom: 0;
                  }
                }
              }

              .net-apr {
                margin-left: 111px;
              }

              &.md-tablet {
                .apr-info {
                  width: 50%;
                  margin-right: 9px;

                  .pie-chart {
                    width: 130px;

                    #pie-chart {
                      width: 100%;
                    }
                  }

                  &:last-child {
                    margin-right: 0;
                    margin-left: 9px;
                  }
                }
              }

              @media @max-md-tablet {
                height: 180px;
              }
            }

            &.analytics-staking {
              .pending-rewards {
                .pending-rewards-info {
                  margin-right: 18px;

                  @media @max-lg-tablet {
                    margin-right: 0;
                  }
                }
              }

              .btn-container {
                @media @max-lg-tablet {
                  margin: 4px auto auto auto;
                  height: 40px;
                }
              }

              @media @max-lg-tablet {
                display: block !important;
                padding: 10px;
              }

              @media @max-md-tablet {
                height: 180px;
                padding-top: 24px;
              }
            }

            &.analytics-rewards {
              .farm-pending-rewards-info {
                .farm-label {
                  margin-bottom: 4px;
                }
              }

              .all-btn-group {
                .btn-container {
                  margin-right: 20px;

                  &:last-child {
                    margin-right: 0;
                  }

                  @media @max-lg-tablet {
                    margin-bottom: 8px;
                    margin-right: 0;

                    &:last-child {
                      margin-bottom: 0;
                    }
                  }
                }

                @media @max-lg-tablet {
                  display: block !important;
                }
              }
            }

            &.analytics-positions {
              .doughnut-chart {
                margin-top: 33px;

                @media @max-md-tablet {
                  margin-top: 14px;
                }
              }

              .analytics-value-container {
                width: 100%;
                margin-top: 33px;

                @media @max-md-tablet {
                  margin-top: 240px;
                }

                .position-label {
                  color: @color-blue200;
                }
              }
            }

            &.analytics-composition {
              .doughnut-chart {
                margin-top: 39px;

                @media @max-md-tablet {
                  margin-top: 46px;
                }
              }

              .analytics-value-container {
                width: 100%;
                margin-top: 39px;

                @media @max-md-tablet {
                  margin-top: 228px;
                }

                .composition-label {
                  color: @color-blue200;
                }
              }
            }

            &.analytics-positions,
            &.analytics-composition {
              .analytics-option-bar {
                .switch-btn-group {
                  .btn-small {
                    margin-right: 4px;

                    &:last-child {
                      margin-right: 0;
                    }
                  }
                }
              }

              .analytics-details {
                height: calc(100% - 36px);

                .doughnut-chart {
                  width: 208px;

                  #doughnut-chart {
                    width: 100%;
                  }
                }

                .analytics-value-container {
                  width: 100%;

                  &.nothing {
                    height: 100%;
                    margin-top: 0;

                    @media @max-sl-mobile {
                      margin-top: 50px;
                    }
                  }
                }
              }
            }
          }
        }

        .dashboard-option-bar {
          margin-top: 38px;

          @media @max-sl-mobile {
            margin-top: 28px;
          }

          .option-goto-container {
            .goto-label {
              color: @color-blue100;
            }
          }
        }
      }
    }
  }
}
</style>