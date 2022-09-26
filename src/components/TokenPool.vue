<template>
  <div class="pool container">
    <CoinModalMulti
      v-if="stakeModalOpening"
      title="Add Liquidity"
      :loading="staking"
      :farmInfo="poolInf"
      @onOk="stake"
      @onCancel="cancelPoolAdd"
    />

    <CoinModal
      v-if="unstakeModalOpening"
      title="Remove Liquidity"
      :coin="lp"
      :loading="unstaking"
      text="You will have to validate 2 operations, Unstake LP & Unstake Liquidity.<br /><br />
      If the pop up for the second operations does not appear, it may have popped up behind your browser. You an check this by minimizing your browser."
      @onOk="unstake"
      :lpbreakdown="this.unstakePoolInfo"
      @onCancel="cancelUnstake"
    />

    <CreatePool v-if="createPoolModalOpening" @onCancel="cancelCreatePool" />

    <div class="card">
      <div class="card-body">
        <div class="pools-content">
          <div class="pools-option-bar fce-container">
            <div class="option-filter-group">
              <div
                class="option-filter option-sort fcc-container icon-cursor"
                @click="
                  () => {
                    this.showFilterMenu = !this.showFilterMenu
                  }
                "
              >
                <span class="font-body-medium weight-semi option-filter-sort fcc-container">
                  <label>Sort by:</label>
                  <span class="sort-detail">
                    Liquidity {{ sortLiquidityAsc ? '(High > Low)' : '(Low > High)' }}
                    <img
                      class="arrow-icon"
                      :class="showFilterMenu ? 'arrow-up' : 'arrow-down'"
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
                      this.showFilterMenu = !this.showFilterMenu
                    }
                  "
                />
              </div>

              <div
                v-if="showFilterMenu"
                class="option-sort-collapse collapse-right"
                v-click-outside="
                  () => {
                    this.showFilterMenu = false
                  }
                "
              >
                <div
                  class="collapse-item text-center font-medium weight-semi icon-cursor"
                  :class="sortLiquidityAsc ? 'active-item' : ''"
                  @click="
                    () => {
                      this.showFilterMenu = false
                      this.sortLiquidityAsc = false // true -> false becuase sortbColumn function
                      sortbyColumn('liquidity')
                    }
                  "
                >
                  Liquidity (High > Low)
                </div>
                <div
                  class="collapse-item text-center font-medium weight-semi icon-cursor"
                  :class="!sortLiquidityAsc ? 'active-item' : ''"
                  @click="
                    () => {
                      this.showFilterMenu = false
                      this.sortLiquidityAsc = true // false -> true becuase sortbColumn function
                      sortbyColumn('liquidity')
                    }
                  "
                >
                  Liquidity (Low > High)
                </div>
              </div>

              <NuxtLink to="/pools" class="option-filter fcc-container icon-cursor">
                <span class="font-body-medium weight-semi option-filter-sort fcc-container">
                  <label class="icon-cursor">Go to Pools</label>
                  <img class="move-icon" src="@/assets/icons/goto.svg" />
                </span>
              </NuxtLink>
            </div>
          </div>

          <div v-if="poolLoaded">
            <!-- desktop version -->
            <div class="pools-table isDesktop">
              <Row class="pools-table-header" :class="{ scrollFixed: scrollPosition > 200 }">
                <Col class="header-column font-small weight-bold text-left" span="5"> Name </Col>
                <Col class="header-column font-small weight-bold" span="3">
                  <div class="header-column-title" @click="sortbyColumn('liquidity')">
                    Liquidity
                    <img
                      v-if="sortMethod === 'liquidity'"
                      src="@/assets/icons/arrow-down-green.svg"
                      class="arrow-icon"
                      :class="sortLiquidityAsc ? 'arrow-down' : 'arrow-up'"
                    />
                    <img
                      v-else
                      src="@/assets/icons/arrow-down-white.svg"
                      class="arrow-icon"
                      :class="sortLiquidityAsc ? 'arrow-down' : 'arrow-up'"
                    />
                  </div>
                </Col>
                <Col class="header-column font-small weight-bold" span="3">
                  <div class="header-column-title" @click="sortbyColumn('volh')">
                    Volume (24hrs)
                    <img
                      v-if="sortMethod === 'volh'"
                      src="@/assets/icons/arrow-down-green.svg"
                      class="arrow-icon"
                      :class="sortVolHAsc ? 'arrow-down' : 'arrow-up'"
                    />
                    <img
                      v-else
                      src="@/assets/icons/arrow-down-white.svg"
                      class="arrow-icon"
                      :class="sortVolHAsc ? 'arrow-down' : 'arrow-up'"
                    />
                  </div>
                </Col>
                <Col class="header-column font-small weight-bold" span="3">
                  <div class="header-column-title" @click="sortbyColumn('vold')">
                    Volume (7d)
                    <img
                      v-if="sortMethod === 'vold'"
                      src="@/assets/icons/arrow-down-green.svg"
                      class="arrow-icon"
                      :class="sortVolDAsc ? 'arrow-down' : 'arrow-up'"
                    />
                    <img
                      v-else
                      src="@/assets/icons/arrow-down-white.svg"
                      class="arrow-icon"
                      :class="sortVolDAsc ? 'arrow-down' : 'arrow-up'"
                    />
                  </div>
                </Col>
                <Col class="header-column font-small weight-bold" span="2">
                  <div class="header-column-title" @click="sortbyColumn('feesh')">
                    Fees (24 hrs)
                    <img
                      v-if="sortMethod === 'feesh'"
                      src="@/assets/icons/arrow-down-green.svg"
                      class="arrow-icon"
                      :class="sortFeesAsc ? 'arrow-down' : 'arrow-up'"
                    />
                    <img
                      v-else
                      src="@/assets/icons/arrow-down-white.svg"
                      class="arrow-icon"
                      :class="sortFeesAsc ? 'arrow-down' : 'arrow-up'"
                    />
                  </div>
                </Col>
                <Col class="header-column font-small weight-bold" span="2">
                  <div class="header-column-title" @click="sortbyColumn('apy')">
                    APY
                    <img
                      v-if="sortMethod === 'apy'"
                      src="@/assets/icons/arrow-down-green.svg"
                      class="arrow-icon"
                      :class="sortAPYAsc ? 'arrow-down' : 'arrow-up'"
                    />
                    <img
                      v-else
                      src="@/assets/icons/arrow-down-white.svg"
                      class="arrow-icon"
                      :class="sortAPYAsc ? 'arrow-down' : 'arrow-up'"
                    />
                  </div>
                </Col>
                <Col class="header-column font-small weight-bold" span="3">
                  <div class="header-column-title" @click="sortbyColumn('yliquidity')">
                    Your Liquidity
                    <img
                      v-if="sortMethod === 'yliquidity'"
                      src="@/assets/icons/arrow-down-green.svg"
                      class="arrow-icon"
                      :class="sortCurrentAsc ? 'arrow-down' : 'arrow-up'"
                    />
                    <img
                      v-else
                      src="@/assets/icons/arrow-down-white.svg"
                      class="arrow-icon"
                      :class="sortCurrentAsc ? 'arrow-down' : 'arrow-up'"
                    />
                  </div>
                </Col>
              </Row>

              <div class="pools-table-body">
                <Row class="pools-table-item" v-for="data in poolsShow" :key="data.lp_mint">
                  <Col class="state" span="5">
                    <div class="lp-iconscontainer">
                      <div class="icons font-medium weight-semi">
                        <CoinIcon :mint-address="data ? data.lp.coin.mintAddress : ''" />
                        {{ data.lp.coin.symbol }}
                        <span>-</span>
                        <CoinIcon :mint-address="data ? data.lp.pc.mintAddress : ''" />
                        {{ data.lp.pc.symbol }}
                      </div>

                      <div v-if="displayPoolID">
                        AMMID : {{ data.ammId }}<br />
                        SerumMarket : {{ data.serumMarket }}
                      </div>
                    </div>
                  </Col>

                  <Col class="state font-medium weight-semi" span="3">
                    ${{ new TokenAmount(data.liquidity, 2, false).format() }}
                  </Col>

                  <Col class="state font-medium weight-semi" span="3">
                    ${{ new TokenAmount(data.volume_24h, 2, false).format() }}
                  </Col>
                  <Col class="state font-medium weight-semi" span="3">
                    ${{ new TokenAmount(data.volume_7d, 2, false).format() }}
                  </Col>
                  <Col class="state font-medium weight-semi" span="2">
                    ${{ new TokenAmount(data.fee_24h, 2, false).format() }}
                  </Col>
                  <Col class="state font-medium weight-semi" span="2">
                    {{ new TokenAmount(data.apy, 2, false).format() }}%
                  </Col>
                  <Col class="state font-medium weight-semi" span="3">
                    ${{ new TokenAmount(data.current, 2, false).format() }}
                  </Col>
                  <Col class="state font-medium weight-semi" span="3">
                    <div class="btn-container">
                      <Button class="btn-transparent font-small weight-bold" id="addp" @click="openPoolAddModal(data)"
                        >Add</Button
                      >
                    </div>
                    <div class="btn-container">
                      <Button
                        class="btn-primary font-small weight-bold"
                        :disabled="!wallet.connected || !data.current"
                        @click="openUnstakeModal(data, data.lp, data.currentUnformated)"
                      >
                        Remove
                      </Button>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>

            <!-- tablet version -->
            <div class="pools-table isTablet">
              <Row class="pools-table-header">
                <Col class="header-column font-small weight-bold text-left" span="6"> Name </Col>
                <Col class="header-column font-small weight-bold" span="6">
                  <div class="header-column-title" @click="sortbyColumn('liquidity')">
                    Liquidity
                    <img
                      v-if="sortMethod === 'liquidity'"
                      src="@/assets/icons/arrow-down-green.svg"
                      class="arrow-icon"
                      :class="sortLiquidityAsc ? 'arrow-down' : 'arrow-up'"
                    />
                    <img
                      v-else
                      src="@/assets/icons/arrow-down-white.svg"
                      class="arrow-icon"
                      :class="sortLiquidityAsc ? 'arrow-down' : 'arrow-up'"
                    />
                  </div>
                </Col>
                <Col class="header-column font-small weight-bold" span="6">
                  <div class="header-column-title" @click="sortbyColumn('volh')">
                    Volume (24hrs)
                    <img
                      v-if="sortMethod === 'volh'"
                      src="@/assets/icons/arrow-down-green.svg"
                      class="arrow-icon"
                      :class="sortVolHAsc ? 'arrow-down' : 'arrow-up'"
                    />
                    <img
                      v-else
                      src="@/assets/icons/arrow-down-white.svg"
                      class="arrow-icon"
                      :class="sortVolHAsc ? 'arrow-down' : 'arrow-up'"
                    />
                  </div>
                </Col>
                <Col class="header-column font-small weight-bold" span="5">
                  <div class="header-column-title" @click="sortbyColumn('vold')">
                    Volume (7d)
                    <img
                      v-if="sortMethod === 'vold'"
                      src="@/assets/icons/arrow-down-green.svg"
                      class="arrow-icon"
                      :class="sortVolDAsc ? 'arrow-down' : 'arrow-up'"
                    />
                    <img
                      v-else
                      src="@/assets/icons/arrow-down-white.svg"
                      class="arrow-icon"
                      :class="sortVolDAsc ? 'arrow-down' : 'arrow-up'"
                    />
                  </div>
                </Col>
              </Row>

              <Collapse v-model="showCollapse" accordion>
                <CollapsePanel v-for="data in poolsShow" :key="data.lp_mint" v-show="true" :show-arrow="true">
                  <Row slot="header" class="pool-head">
                    <Col class="state" span="6">
                      <div class="lp-iconscontainer">
                        <div class="icons font-medium weight-semi">
                          <CoinIcon :mint-address="data ? data.lp.coin.mintAddress : ''" />
                          {{ data.lp.coin.symbol }}
                          <span>-</span>
                          <CoinIcon :mint-address="data ? data.lp.pc.mintAddress : ''" />
                          {{ data.lp.pc.symbol }}
                        </div>
                      </div>
                    </Col>

                    <Col class="state font-medium weight-semi text-center" span="6">
                      ${{ new TokenAmount(data.liquidity, 2, false).format() }}
                    </Col>

                    <Col class="state font-medium weight-semi text-center" span="6">
                      ${{ new TokenAmount(data.volume_24h, 2, false).format() }}
                    </Col>
                    <Col class="state font-medium weight-semi text-center" span="5">
                      ${{ new TokenAmount(data.volume_7d, 2, false).format() }}
                    </Col>

                    <Button class="detail-btn font-small weight-semi">
                      <img
                        class="arrow-icon"
                        :class="data.lp_mint != showCollapse ? 'arrow-up' : 'arrow-down'"
                        src="@/assets/icons/arrow-down-white.svg"
                      />
                    </Button>
                  </Row>

                  <Row class="collapse-row" :gutter="18">
                    <Col span="12">
                      <div class="state">
                        <span class="title font-small weight-semi spacing-large">Fees (24h)</span>
                        <span class="value font-medium weight-semi spacing-small">
                          ${{ new TokenAmount(data.fee_24h, 2, false).format() }}
                        </span>
                      </div>
                      <div class="state">
                        <span class="title font-small weight-semi spacing-large">APY</span>
                        <span class="value font-medium weight-semi spacing-small">
                          {{ new TokenAmount(data.apy, 2, false).format() }}%
                        </span>
                      </div>
                    </Col>
                    <Col span="12">
                      <div class="state current-liquidity text-center">
                        <span class="title font-small weight-semi spacing-large">Your liquidity</span>
                        <span class="value font-medium weight-semi spacing-small">
                          ${{ new TokenAmount(data.current, 2, false).format() }}
                        </span>

                        <div class="btn-group">
                          <div class="btn-container">
                            <Button
                              class="btn-transparent font-small weight-bold"
                              id="addp"
                              @click="openPoolAddModal(data)"
                              >Add</Button
                            >
                          </div>
                          <div class="btn-container">
                            <Button
                              class="btn-primary font-small weight-bold"
                              :disabled="!wallet.connected || !data.current"
                              @click="openUnstakeModal(data, data.lp, data.currentUnformated)"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </CollapsePanel>
              </Collapse>
            </div>

            <!-- mobile version -->
            <div class="pools-table isMobile">
              <Collapse v-model="showCollapse" accordion>
                <CollapsePanel v-for="data in poolsShow" :key="data.lp_mint" v-show="true" :show-arrow="true">
                  <Row slot="header" class="pool-head">
                    <Col class="state" :span="24">
                      <div class="lp-iconscontainer">
                        <div class="icons font-medium weight-semi">
                          <CoinIcon :mint-address="data ? data.lp.coin.mintAddress : ''" />
                          {{ data.lp.coin.symbol }}
                          <span>-</span>
                          <CoinIcon :mint-address="data ? data.lp.pc.mintAddress : ''" />
                          {{ data.lp.pc.symbol }}
                        </div>
                      </div>
                    </Col>

                    <Button class="detail-btn font-small weight-semi">
                      <span class="label font-small weight-semi">Details</span>
                      <img
                        class="arrow-icon"
                        :class="data.lp_mint != showCollapse ? 'arrow-up' : 'arrow-down'"
                        src="@/assets/icons/arrow-down-white.svg"
                      />
                    </Button>
                  </Row>

                  <Row class="collapse-row">
                    <Col class="state current-liquidity text-center" span="24">
                      <span class="title font-small weight-semi spacing-large">Your liquidity</span>
                      <span class="value font-medium weight-semi spacing-small">
                        ${{ new TokenAmount(data.current, 2, false).format() }}
                      </span>

                      <div class="btn-group">
                        <div class="btn-container">
                          <Button
                            class="btn-transparent font-small weight-bold"
                            id="addp"
                            @click="openPoolAddModal(data)"
                            >Add</Button
                          >
                        </div>
                        <div class="btn-container">
                          <Button
                            class="btn-primary font-small weight-bold"
                            :disabled="!wallet.connected || !data.current"
                            @click="openUnstakeModal(data, data.lp, data.currentUnformated)"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </Col>
                    <Col class="state" span="24">
                      <span class="title font-small weight-semi spacing-large">Liquidity</span>
                      <span class="value font-medium weight-semi spacing-small">
                        ${{ new TokenAmount(data.liquidity, 2, false).format() }}
                      </span>
                    </Col>
                    <Col class="state" span="24">
                      <span class="title font-small weight-semi spacing-large">Volume (24h)</span>
                      <span class="value font-medium weight-semi spacing-small">
                        ${{ new TokenAmount(data.volume_24h, 2, false).format() }}
                      </span>
                    </Col>
                    <Col class="state" span="24">
                      <span class="title font-small weight-semi spacing-large">Volume (7d)</span>
                      <span class="value font-medium weight-semi spacing-small">
                        ${{ new TokenAmount(data.volume_7d, 2, false).format() }}
                      </span>
                    </Col>
                    <Col class="state" span="24">
                      <span class="title font-small weight-semi spacing-large">Fees (24h)</span>
                      <span class="value font-medium weight-semi spacing-small">
                        ${{ new TokenAmount(data.fee_24h, 2, false).format() }}
                      </span>
                    </Col>
                    <Col class="state" span="24">
                      <span class="title font-small weight-semi spacing-large">APY</span>
                      <span class="value font-medium weight-semi spacing-small">
                        {{ new TokenAmount(data.apy, 2, false).format() }}%
                      </span>
                    </Col>
                  </Row>
                </CollapsePanel>
              </Collapse>
            </div>

            <div v-if="totalCount > pageSize" class="pagination-container">
              <div class="pagination-body">
                <Pagination
                  :total="totalCount"
                  :pageSize="pageSize"
                  :defaultCurrent="1"
                  v-model="currentPage"
                >
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
import { get, set, cloneDeep } from 'lodash-es'
import { Vue, Component, Watch, Prop } from 'nuxt-property-decorator'
import { mapState } from 'vuex'
import {
  Table,
  Radio,
  Tooltip,
  Collapse,
  Row,
  Col,
  Spin,
  Select,
  Button,
  Input,
  Icon,
  Pagination,
} from 'ant-design-vue'

import { getCoinBalance, getPcBalance, getTotalSupply } from '@/utils/farm'

import { getPoolByLpMintAddress, getAllCropperPools } from '@/utils/pools'
import { TokenAmount } from '@/utils/safe-math'
import { getBigNumber } from '@/utils/layouts'
import { addLiquidity, removeLiquidity } from '@/utils/liquidity'
import { LiquidityPoolInfo } from '@/utils/pools'
import { getUnixTs } from '@/utils'
import { DEVNET_MODE } from '../utils/ids'
const CollapsePanel = Collapse.Panel
const RadioGroup = Radio.Group
const poolAdd = false
const RadioButton = Radio.Button
declare const window: any
const Vco = require('v-click-outside')
Vue.use(Vco)

@Component({
  
  computed: {
    ...mapState([
      // 'wallet',
      'swap',
      'liquidity',
      'price',
      'url',
      'setting'
    ])
  },

  data() {
    return {
      isMobile: false,
      farms: [] as any,
      fromCoin: false,
      lpMintAddress: false,
      toCoin: false,
      poolAdd: false,
      totalCount: 110,
      pageSize: 50,
      TVL: 0,
      currentPage: 1
    }
  },

  components: {
    Table,
    Collapse,
    CollapsePanel,
    Row,
    Col,
    RadioGroup,
    RadioButton,
    Tooltip,
    Button,
    Select,
    Input,
    Icon,
    Spin,
    Pagination
  },

  props: {
    poolID: {
      type: String,
      default: ''
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

    try {
      window.labelised = await fetch('https://api.cropper.finance/pool/').then((res) => res.json())
    } catch {
    } finally {
    }

    const pools = getAllCropperPools()
    return { pools }
  }
})

export default class Pools extends Vue {
  true: any = true
  showCollapse: any = []
  pools: any = []
  poolsDatas: any = {}
  displayPoolID: any = 0
  poolsShow: any = []
  poolType: string = 'RaydiumPools'
  fromCoin: any = false
  staking: any = false
  unstakePoolInfo: any = {}
  showpoolloading: boolean = false
  lp: any = false
  TVL: any = 0
  unstaking: any = false
  wallet: any = this.$accessor.wallet
  lpMintAddress: any = false
  stakeModalOpening: any = false
  unstakeModalOpening: any = false
  createPoolModalOpening: boolean = false
  toCoin: any = false
  displayfilters: any = false
  poolAdd: any = false
  poolInf: any = false
  lptoken: any = false
  poolLoaded: any = false
  autoRefreshTime: number = 60
  countdown: number = 0
  timer: any = null
  timer_init: any = null
  loading: boolean = false
  searchName = ''
  totalCount = 110
  pageSize = 50
  currentPage = 1
  sortMethod: string = 'liquidity'
  sortLiquidityAsc: boolean = true
  sortVolHAsc: boolean = true
  sortVolDAsc: boolean = true
  sortFeesAsc: boolean = true
  sortAPYAsc: boolean = true
  sortCurrentAsc: boolean = true
  activeSpinning: boolean = false
  showFilterMenu: boolean = false
  showSearchMenu: boolean = false
  showTabMenu: boolean = false
  mostUsed: any = [
    {
      mintAddress: 'DubwWZNWiNGMMeeQHPnMATNj77YZPZSAz2WVR5WjLJqz',
      symbol: 'CRP'
    },
    {
      mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      symbol: 'USDC'
    }
  ]
  scrollPosition: any = null
  
  get liquidity() {
    this.$accessor.wallet.getTokenAccounts()
    return this.$accessor.liquidity
  }
  
  @Watch('$accessor.liquidity.initialized', { immediate: true, deep: true })
  refreshThePage() {
    this.showPool(this.searchName, this.currentPage)
  }
  @Watch('showCollapse', { immediate: true, deep: true }) handler() {
    if (!this.poolType && this.showCollapse.length > 0) {
      this.showCollapse.splice(0, this.showCollapse.length)
    }
  }
  @Watch('$accessor.liquidity.info', { immediate: true, deep: true })
  async onLiquidityChanged() {
    this.pools = this.poolsFormated()
    this.showPool(this.searchName, this.currentPage)
  }

  @Watch('currentPage', { immediate: true, deep: true })
  async onpageChange(newPage: number) {
    this.showPool(this.searchName, newPage)
  }

  @Watch('searchName', { immediate: true, deep: true })
  async onSearchChange(newSearchName: string) {
    this.showPool(newSearchName)
  }

  sortbyColumn(col: string) {
    this.sortMethod = col
    if (this.sortMethod == 'liquidity') this.sortLiquidityAsc = !this.sortLiquidityAsc
    else if (this.sortMethod == 'volh') this.sortVolHAsc = !this.sortVolHAsc
    else if (this.sortMethod == 'vold') this.sortVolDAsc = !this.sortVolDAsc
    else if (this.sortMethod == 'feesh') this.sortFeesAsc = !this.sortFeesAsc
    else if (this.sortMethod == 'apy') this.sortAPYAsc = !this.sortAPYAsc
    else if (this.sortMethod == 'yliquidity') this.sortCurrentAsc = !this.sortCurrentAsc

    this.showPool(this.searchName, this.currentPage)
  }

  async showPool(searchName: any = '', pageNum: any = 1) {
    this.showpoolloading = true;

    const pool = []

    this.pools = await this.poolsFormated()

    // sort by column
    if (this.sortMethod == 'liquidity') {
      if (this.sortLiquidityAsc) {
        this.pools.sort(function (a: any, b: any) {
          return b.liquidity - a.liquidity
        })
      } else {
        this.pools.sort(function (a: any, b: any) {
          return a.liquidity - b.liquidity
        })
      }
    } else if (this.sortMethod == 'volh') {
      if (this.sortVolHAsc) {
        this.pools.sort(function (a: any, b: any) {
          return b.volume_24h - a.volume_24h
        })
      } else {
        this.pools.sort(function (a: any, b: any) {
          return a.volume_24h - b.volume_24h
        })
      }
    } else if (this.sortMethod == 'vold') {
      if (this.sortVolDAsc) {
        this.pools.sort(function (a: any, b: any) {
          return b.volume_7d - a.volume_7d
        })
      } else {
        this.pools.sort(function (a: any, b: any) {
          return a.volume_7d - b.volume_7d
        })
      }
    } else if (this.sortMethod == 'feesh') {
      if (this.sortFeesAsc) {
        this.pools.sort(function (a: any, b: any) {
          return b.fee_24h - a.fee_24h
        })
      } else {
        this.pools.sort(function (a: any, b: any) {
          return a.fee_24h - b.fee_24h
        })
      }
    } else if (this.sortMethod == 'apy') {
      if (this.sortAPYAsc) {
        this.pools.sort(function (a: any, b: any) {
          return b.apy - a.apy
        })
      } else {
        this.pools.sort(function (a: any, b: any) {
          return a.apy - b.apy
        })
      }
    } else if (this.sortMethod == 'yliquidity') {
      if (this.sortCurrentAsc) {
        this.pools.sort(function (a: any, b: any) {
          return b.current - a.current
        })
      } else {
        this.pools.sort(function (a: any, b: any) {
          return a.current - b.current
        })
      }
    }

    for (const item of this.pools) {
      pool.push(item)
    }
    this.poolsShow = pool

    if (searchName != '') {
      if (searchName.includes('-') || searchName.includes(' ')) {
        let firstToken = '',
          secondToken = ''

        if (searchName.includes('-')) {
          firstToken = searchName.substr(0, searchName.indexOf('-')).toLowerCase()
          secondToken = searchName.substr(searchName.indexOf('-') + 1, searchName.length - 1).toLowerCase()
        } else if (searchName.includes(' ')) {
          firstToken = searchName.substr(0, searchName.indexOf(' ')).toLowerCase()
          secondToken = searchName.substr(searchName.indexOf(' ') + 1, searchName.length - 1).toLowerCase()
        }

        if (secondToken != '') {
          this.poolsShow = this.poolsShow.filter(
            (pool: any) =>
              (pool.lp.coin.symbol as string).toLowerCase() === firstToken &&
              (pool.lp.pc.symbol as string).toLowerCase() === secondToken
          )
        } else {
          this.poolsShow = this.poolsShow.filter(
            (pool: any) => (pool.lp.coin.symbol as string).toLowerCase() === firstToken
          )
        }
      } else {
        if (
          this.poolsShow.filter(
            (pool: any) => (pool.ammId as string).toLowerCase() == (searchName as string).toLowerCase()
          ).length > 0
        ) {
          this.poolsShow = this.poolsShow.filter(
            (pool: any) => (pool.ammId as string).toLowerCase() == (searchName as string).toLowerCase()
          )
        } else {
          this.poolsShow = this.poolsShow.filter((pool: any) =>
            (pool.nameSymbol as string).toLowerCase().includes((searchName as string).toLowerCase()+' ')
          )
        }
      }
    }

    this.currentPage = pageNum

    this.totalCount = this.poolsShow.length

    let max = this.poolsShow.length
    let start = (this.currentPage - 1) * this.pageSize
    let end = this.currentPage * this.pageSize < max ? this.currentPage * this.pageSize : max
    this.poolsShow = this.poolsShow.slice(start, end)
  
    this.showpoolloading = false

  }

  async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  openUnstakeModal(poolInfo: any, lp: any, lpBalance: any) {
    const coin = cloneDeep(lp)
    coin.balance = get(this.wallet.tokenAccounts, `${coin.mintAddress}.balance`)
    this.lp = coin

    this.poolInf = cloneDeep(poolInfo)

    this.lp = coin
    // @ts-ignore
    this.farmInfo = cloneDeep(poolInfo)

    // @ts-ignore
    const currentPoolInfo = Object.values(this.$accessor.liquidity.infos).find((p: any) => p.ammId === this.farmInfo.ammId)
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
  }

  cancelUnstake() {
    this.unstakeModalOpening = false
  }

  cancelCreatePool() {
    this.createPoolModalOpening = false
  }

  unstake(amount: string) {
    this.unstaking = true

    const conn = this.$web3
    const wallet = (this as any).$wallet
    const coin = this.poolInf.lp.coin
    const pc = this.poolInf.lp.pc
    const lp = this.poolInf.lp

    const lpAccount = get(this.wallet.tokenAccounts, `${this.poolInf.lp.mintAddress}.tokenAccountAddress`)
    const fromCoinAccount = get(this.wallet.tokenAccounts, `${coin.mintAddress}.tokenAccountAddress`)
    const toCoinAccount = get(this.wallet.tokenAccounts, `${pc.mintAddress}.tokenAccountAddress`)

    const key = getUnixTs().toString()
    this.$notify.info({
      key,
      message: 'Making transaction...',
      description: '',
      duration: 0
    })

    const poolInfo = get(this.liquidity.infos, lp.mintAddress)
    //remove whole lp amount
    removeLiquidity(conn, wallet, poolInfo, lpAccount, fromCoinAccount, toCoinAccount, amount)
      .then((txid) => {
        this.$notify.info({
          key,
          message: 'Transaction has been sent',
          description: (h: any) => h('div', ['Confirmation is in progress.'])
        })

        const description = `Remove liquidity for ${amount} LP Token`

        this.$accessor.transaction.sub({ txid, description })
      })
      .catch((error) => {
        this.$notify.error({
          key,
          message: 'Remove liquidity failed',
          description: error.message
        })
      })
      .finally(() => {
        this.flush()
        this.$accessor.wallet.getTokenAccounts()
        this.unstaking = false
        this.unstakeModalOpening = false
      })
  }

  stake(fromCoinAmount: string, toCoinAmount: string, fixedCoin: string) {
    this.staking = true

    const conn = this.$web3
    const wallet = (this as any).$wallet

    const poolInfo = get(this.liquidity.infos, this.poolInf.lp.mintAddress)

    const lpAccount = get(this.wallet.tokenAccounts, `${this.poolInf.lp.mintAddress}.tokenAccountAddress`)
    // @ts-ignore
    const fromCoinAccount = get(this.wallet.tokenAccounts, `${this.poolInf.lp.coin.mintAddress}.tokenAccountAddress`)
    // @ts-ignore
    const toCoinAccount = get(this.wallet.tokenAccounts, `${this.poolInf.lp.pc.mintAddress}.tokenAccountAddress`)

    const key = getUnixTs().toString()
    this.$notify.info({
      key,
      message: 'Making transaction...',
      description: '',
      duration: 0
    })
    addLiquidity(
      conn,
      wallet,
      poolInfo,
      fromCoinAccount,
      toCoinAccount,
      lpAccount,
      this.poolInf.lp.coin,
      this.poolInf.lp.pc,
      fromCoinAmount,
      toCoinAmount,
      fixedCoin
    )
      .then(async (txid) => {
        this.$notify.info({
          key,
          message: 'Transaction has been sent',
          description: (h: any) => h('div', ['Confirmation is in progress.'])
        })

        const description = `Add liquidity for ${fromCoinAmount} ${this.poolInf.lp.coin?.symbol} and ${toCoinAmount} ${this.poolInf.lp.pc?.symbol}`
        this.$accessor.transaction.sub({ txid, description })

        let txStatus = this.$accessor.transaction.history[txid].status
        while (txStatus === 'Pending') {
          await this.delay(500)
          txStatus = this.$accessor.transaction.history[txid].status
          await this.delay(500)
        }
        if (txStatus === 'Fail') {
          console.log('add lp failed')
          return
        }
        let amount = get(this.wallet.tokenAccounts, `${this.poolInf.lp.mintAddress}.balance`)
        //stake whole lp amount
        amount = amount.wei.toNumber() / Math.pow(10, amount.decimals)
        let delayTime = 0
        while (amount <= 0 && delayTime < 10000) {
          //after 4 seconds ,it's failed
          await this.delay(200)
          delayTime += 200
          amount = get(this.wallet.tokenAccounts, `${this.poolInf.lp.mintAddress}.balance`)
          amount = amount.wei.toNumber() / Math.pow(10, amount.decimals)
        }
        if (amount <= 0) {
          console.log('added lp amount is 0')
          return
        }
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
        this.staking = false
        this.stakeModalOpening = false
      })
  }

  async poolsFormated() {
    const conn = this.$web3
    const wallet = (this as any).$accessor.wallet
    const liquidity = (this as any).$accessor.liquidity


    try {
      this.poolsDatas = await fetch('https://api.cropper.finance/cmc/').then((res) => res.json())
    } catch {
      this.poolsDatas = []
    } finally {
    }

    const polo: any = []

    let allppoools = getAllCropperPools();

    for(let i in allppoools){
      let value = allppoools[i]
      const liquidityItem = get(liquidity.infos, value.lp_mint)

      if (!liquidityItem) {
        return
      }

      let liquidityTotalValue = 0
      let liquidityItemValue = 0

      if (this.poolsDatas[value.ammId]) {
        liquidityTotalValue = this.poolsDatas[value.ammId].tvl
        liquidityItemValue = this.poolsDatas[value.ammId].last_price
      }
      value.liquidity = liquidityTotalValue

      if (this.poolsDatas[value.ammId]) {
        value.volume_24h = this.poolsDatas[value.ammId].volume_24h
      } else {
        value.volume_24h = 0
      }

      if (this.poolsDatas[value.ammId]) {
        value.volume_7d = this.poolsDatas[value.ammId].volume_7d
      } else {
        value.volume_7d = 0
      }

      if (this.poolsDatas[value.ammId]) {
        value.fee_24h = this.poolsDatas[value.ammId].fee_24h
      } else {
        value.fee_24h = 0
      }

      if (this.poolsDatas[value.ammId]) {
        value.apy = this.poolsDatas[value.ammId].apy
      } else {
        value.apy = 0
      }

      value.nameSymbol = value.coin1.symbol + ' - ' + value.coin2.symbol


      value.currentUnformated = null

      if (wallet) {
        value.current = get(wallet.tokenAccounts, `${value.lp_mint}.balance`)
        value.currentUnformated = value.current
        if (value.current) {
          value.current = (value.current.wei.toNumber() / Math.pow(10, value.current.decimals)) * liquidityItemValue
        } else {
          value.current = 0
        }
      } else {
        value.current = 0
      }
      polo.push(value)
    }
    return polo
  }

  openPoolAddModal(poolInfo: any) {
    if (!this.wallet.connected) {
      this.$accessor.wallet.openModal()
    } else {
      this.poolInf = cloneDeep(poolInfo)
      const coinBalance = get(this.wallet.tokenAccounts, `${this.poolInf.coin1.mintAddress}.balance`)
      const pcBalance = get(this.wallet.tokenAccounts, `${this.poolInf.coin2.mintAddress}.balance`)
      this.poolInf.lp.coin.balance = coinBalance
      this.poolInf.lp.pc.balance = pcBalance
      this.stakeModalOpening = true
    }
  }

  cancelPoolAdd() {
    this.fromCoin = null
    this.toCoin = null
    this.lptoken = null
    this.lpMintAddress = null
    this.stakeModalOpening = false
  }

  updateScroll() {
    this.scrollPosition = window.scrollY
  }

  mounted() {
    if (this.$props.poolID) {
      this.searchName = this.$props.poolID
    }

    this.getTvl()
    this.$accessor.token.loadTokens()

    this.timer_init = setInterval(async () => {
      if (!this.poolLoaded) {
        await this.flush()
        if (this.pools.length > 0 || DEVNET_MODE) {
          var hash = window.location.hash
          if (hash) {
            hash = hash.substring(1)

            if (hash == 'createpool') {
              if (this.wallet.connected) {
                this.createPoolModalOpening = true
              }
            } else {
              this.searchName = hash
            }
          } else {
            const query = new URLSearchParams(window.location.search)
            if (query.get('s')) this.searchName = query.get('s') as string

            if (query.get('d')) this.displayPoolID = query.get('d') as string
          }

          this.poolLoaded = true
        }
      }
    }, 1000)
    this.setTimer()
    window.addEventListener('scroll', this.updateScroll)
  }

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
  }

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
  }

  async flush() {
    this.loading = true
    this.pools = await this.poolsFormated()
    this.showPool(this.searchName, this.currentPage)
    this.loading = false
    this.countdown = 0
  }

  getPoolByLpMintAddress = getPoolByLpMintAddress
  TokenAmount = TokenAmount

  reloadTimer() {
    this.activeSpinning = true
    setTimeout(() => {
      this.activeSpinning = false
    }, 1000)
    this.flush()
    this.$accessor.wallet.getTokenAccounts()
  }
}
</script>

<style lang="less" scoped>
// global stylesheet
.pool {
  .btn-container {
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 48px;
    padding: 3px;
    width: 95px;
    height: auto;
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

    &:disabled {
      background: rgba(23, 32, 88, 0.9);
    }
  }

  .lp-iconscontainer {
    background: @gradient-color-outline;
    background-origin: border-box;
    padding: 2px;
    border-radius: 8px;
    width: fit-content;

    .icons {
      position: relative;
      display: block !important;
      border-radius: 8px;
      padding: 7px 10px;
      white-space: nowrap;
      background: @color-blue800;
      text-align: center;
      height: 100%;
      width: fit-content;

      img {
        border-radius: 50%;
        width: 18px;
        height: 18px;
      }
    }
  }

  .arrow-icon {
    transition: all 0.3s;

    &.arrow-up {
      transform: rotate(180deg);
    }
  }

  .detail-btn {
    position: absolute;
    right: 0;
    background: none;
    border: none;
    display: flex;
    align-items: center;

    .label {
      margin-right: 8px;
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
}

// class stylesheet
.pool.container {
  margin-top: 20px;
  padding: 0 !important;
  
  .card {
    .card-body {
      position: relative;
      padding: 0;

      .pools-content {
        .pools-head {
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

            .tvl-info {
              margin-right: 18px;
            }

            .action-btn-group {
              display: flex;
              align-items: center;

              .reload-btn {
                background: @color-blue600;
                border-radius: 8px;
                padding: 6px;
                margin-right: 18px;
                display: flex;
                align-items: center;
                justify-content: center;

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

              .create-btn {
                top: 20px;
                right: -90px;

                .create-plus-btn {
                  background: @color-blue600;
                  border-radius: 8px;
                  padding: 6px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                }
              }
            }
          }
        }

        .pools-table {
          width: 100%;

          .pools-table-header {
            &.scrollFixed {
              position: sticky;
              background: @color-blue800;
              top: 70px;
              z-index: 998;
              width: 100%;
              transition: 0.3s all ease-in-out;
            }

            .header-column {
              text-align: center;
              padding: 16px 0;
              color: @color-neutral400;

              .header-column-title {
                cursor: pointer;
                display: flex;
                justify-content: center;

                .arrow-icon {
                  margin-left: 4px;
                }

                .sort-icon-active {
                  color: #13ecab;
                }
              }
            }
          }

          .pools-table-body {
            .pools-table-item {
              display: flex;
              align-items: center;
              background: rgba(23, 32, 88, 0.9);
              border-radius: 8px;
              padding: 18px;
              margin-bottom: 8px;
              border: 3px solid transparent;

              &:hover {
                border-color: @color-blue500;
              }

              &:last-child {
                margin-bottom: 0;
              }

              .state {
                text-align: center;

                .btn-container {
                  margin: auto auto 8px auto;

                  &:last-child {
                    margin-bottom: 0;
                  }
                }
              }
            }
          }
        }

        .pools-option-bar {
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
              margin-left: 18px;
              height: 40px;

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
          }

          .option-sort-collapse {
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
              padding: 16px 0;
              border-bottom: 1px solid #c4c4c420;

              &:last-child {
                border-bottom: 0;
              }

              &.active-item {
                color: @color-petrol500;
              }
            }
          }
        }
      }
    }
  }

  .pagination-container {
    margin-top: 30px;
    text-align: center;
    width: 100%;

    .pagination-body {
      width: 80%;
      display: inline-block;
    }
  }
}

@media @max-lg-tablet {
  .pool.container {
    .pool-head {
      display: flex;
      align-items: center;
    }

    .collapse-row {
      .state {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid @color-blue600;

        .title {
          color: #ffffff50;
        }

        &:last-child {
          border-bottom: 0;
        }

        &.current-liquidity {
          display: block;
          width: 100%;
          flex-direction: unset;
          float: unset;
          flex: unset;
          background: @color-blue800;
          border-radius: 8px;
          padding: 8px 18px 18px 18px;
          border-bottom: 0;

          .title {
            display: block;
          }

          .btn-group {
            display: flex;
            justify-content: center;
            margin-top: 18px;

            .btn-container {
              margin-right: 8px;

              &:last-child {
                margin-right: 0;
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
.pool {
  // ant collapse
  .ant-collapse {
    background: transparent;
    border: none;

    .ant-collapse-item {
      position: relative;
      background: rgba(23, 32, 88, 0.9);
      border-radius: 8px !important;
      margin-bottom: 8px;
      border-bottom: 0;
      border: 3px solid transparent;

      &:hover {
        border-color: @color-blue500;
      }

      .ant-collapse-header {
        padding: 18px;

        .ant-collapse-arrow {
          display: none;
        }
      }

      .ant-collapse-content {
        border: none;
        background: transparent;

        .ant-collapse-content-box {
          padding: 0 18px 18px 18px;
        }
      }
    }
  }
}
</style>
