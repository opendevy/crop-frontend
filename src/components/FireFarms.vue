<template>
  <div class="fire-farms">
    <h3 class="weight-bold fcs-container">
      Farms on fire
      <img class="section-symbol ml-8" src="@/assets/icons/fire.svg" alt="fire icon" />
    </h3>

    <div class="fire-farms-table noMobile">
      <div v-for="(item, idx) in fireFarms" :key="idx" class="fire-farms-item fcsb-container">
        <div class="lp-icons">
          <div class="lp-icons-group">
            <div class="icons fcs-container h-100">
              <CoinIcon :mint-address="item.mint1" />
              <span class="font-medium weight-semi">{{ item.symbol1 }} - </span>
              <CoinIcon :mint-address="item.mint2" />
              <span class="font-medium weight-semi">{{ item.symbol2 }}</span>
            </div>
          </div>
        </div>

        <div class="item-col">
          <span class="item-col-title font-small weight-semi spacing-large fcs-container"
            >Total APR
            <Tooltip placement="bottomLeft">
              <template slot="title">
                <div>
                  <div class="tooltip-line">
                    Fees <span>{{ item.apy }} %</span>
                  </div>
                  <hr />
                  <div class="tooltip-line">
                    Rewards <span>{{ item.apr }} %</span>
                  </div>
                </div>
              </template>
              <img class="info-icon" src="@/assets/icons/info.svg" />
            </Tooltip>
          </span>
          <div class="fcs-container">
            <img class="mr-4" src="@/assets/icons/fire.svg" />
            <span class="font-medium weight-semi spacing-small">{{ Math.round(item.total_apr * 100) / 100 }}%</span>
          </div>
        </div>

        <div class="btn-container">
          <NuxtLink :to="item.link"
            ><Button class="btn-transparent font-small weight-bold">Start Farm</Button></NuxtLink
          >
        </div>
      </div>
    </div>

    <div class="fire-farms-slider isMobile">
      <vueper-slides class="no-shadow" :arrows="false" bullets-outside fixed-height="186px">
        <vueper-slide v-for="(item, idx) in fireFarms" :key="idx">
          <template #content>
            <div class="fire-farms-slider-body">
              <div class="fire-farms-slider-item">
                <div class="item-col fcc-container mb-8">
                  <div class="lp-icons">
                    <div class="lp-icons-group">
                      <div class="icons fcs-container h-100">
                        <CoinIcon :mint-address="item.mint1" />
                        <span class="font-medium weight-semi">{{ item.symbol1 }} - </span>
                        <CoinIcon :mint-address="item.mint2" />
                        <span class="font-medium weight-semi">{{ item.symbol2 }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="item-col">
                  <span class="item-col-title font-small weight-semi spacing-large fcc-container"
                    >Total APR
                    <Tooltip placement="bottomLeft">
                      <template slot="title">
                        <div>
                          <div class="tooltip-line">
                            Fees <span>{{ item.apy }} %</span>
                          </div>
                          <hr />
                          <div class="tooltip-line">
                            Rewards <span>{{ item.apr }} %</span>
                          </div>
                        </div>
                      </template>
                      <img class="info-icon" src="@/assets/icons/info.svg" />
                    </Tooltip>
                  </span>
                  <div class="fcc-container">
                    <img class="mr-4" src="@/assets/icons/fire.svg" />
                    <span class="font-medium weight-semi spacing-small"
                      >{{ Math.round(item.total_apr * 100) / 100 }}%</span
                    >
                  </div>
                </div>

                <div class="btn-container m-auto mt-8">
                  <NuxtLink :to="item.link"
                    ><Button class="btn-transparent font-small weight-bold">Start Farm</Button></NuxtLink
                  >
                </div>
              </div>
            </div>
          </template>
        </vueper-slide>
      </vueper-slides>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Tooltip, Collapse, Spin, Icon, Row, Col, Button, Switch as Toggle, Pagination } from 'ant-design-vue'
import { get, set, cloneDeep, forIn, indexOf } from 'lodash-es'
import { TokenAmount } from '@/utils/safe-math'
import { FarmInfo } from '@/utils/farms'

import { deposit, withdraw, harvestAll_v2 } from '@/utils/stake'
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
const { VueperSlides, VueperSlide } = require('vueperslides')
import 'vueperslides/dist/vueperslides.css'

export default Vue.extend({
  components: { Button, Tooltip, VueperSlides, VueperSlide },
  props: {},
  data() {
    return {
      farmProgramCreated: true,
      superOwnerAddress: FARM_INITIAL_SUPER_OWNER,
      removeRewardsFarmAddress: REMOVE_REWARDS_FARM_ADDRESS,
      farmLoaded: false as boolean,
      farms: [] as any[],
      showFarms: [] as any[],
      searchName: '',
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
      searchCertifiedFarm: 'labelized' as string,
      searchLifeFarm: false as boolean,
      checkedFP: false as boolean,
      updating: false as boolean,
      totalCount: 110,
      pageSize: 4,
      displaynoticeupdate: false,
      currentPage: 1,
      labelizedPermission: false as any,
      sortMethod: 'apr' as string,
      sortAsc: true as boolean,
      showOptionMenu: false as boolean,
      showMoreMenu: [] as boolean[],
      showSearchMenu: false as boolean,
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
      unstakePoolInfo: {} as any,
      fireFarms: [] as any
    }
  },

  watch: {

    'farm.infos': {
      handler() {
        this.updateFarms()
      },
      deep: true
    },
  },

  computed: {
    ...mapState(['app', 'wallet', 'farm', 'url', 'price', 'liquidity'])
  },

  mounted() {
    this.updateFarms()
  },

  methods: {
    TokenAmount,
    async updateFarms() {
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
      this.filterFarms(this.searchName, this.searchCertifiedFarm, this.searchLifeFarm, this.currentPage)
    },
    filterFarms(searchName: string, searchCertifiedFarm: string, searchLifeFarm: boolean, pageNum: number = 1) {
      this.currentPage = pageNum
      this.showFarms = this.farms

      // filter for not allowed farms
      this.showFarms = this.showFarms.filter(
        (farm: any) =>
          farm.farmInfo.poolInfo.is_allowed > 0 ||
          (farm.farmInfo.poolInfo.owner.toBase58() === this.wallet.address && farm.farmInfo.poolInfo.is_allowed === 0)
      )

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
            this.showFarms = this.showFarms.filter(
              (farm: any) =>
                (farm.farmInfo.lp.coin.symbol as string).toLowerCase() === firstToken &&
                (farm.farmInfo.lp.pc.symbol as string).toLowerCase() === secondToken
            )
          } else {
            this.showFarms = this.showFarms.filter(
              (farm: any) => (farm.farmInfo.lp.coin.symbol as string).toLowerCase() === firstToken
            )
          }
        } else {

          if (
            this.farms.filter(
              (farm: any) => (farm.farmInfo.poolId as string).toLowerCase() == (searchName as string).toLowerCase()
            ).length > 0
          ) {
            this.showFarms = this.farms.filter(
              (farm: any) => (farm.farmInfo.poolId as string).toLowerCase() == (searchName as string).toLowerCase()
            )
          } else if (
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
          } else {
            this.showFarms = this.farms.filter((farm: any) =>
              (farm.farmInfo.lp.symbol as string).toLowerCase().includes((searchName as string).toLowerCase())
            )
          }
        }
      }

      if (searchCertifiedFarm === 'labelized') {
        //labelized
        this.showFarms = this.showFarms.filter((farm: any) => farm.labelized)
      } else if (searchCertifiedFarm === 'permissionless') {
        //permissionless
        this.showFarms = this.showFarms.filter((farm: any) => !farm.labelized)
      } else if (searchCertifiedFarm === 'deposit') {
        //deposit
        this.showFarms = this.showFarms.filter((farm: any) => farm.userInfo.depositBalance.wei.toNumber() > 0)
      }

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

      this.totalCount = this.showFarms.length

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

      let fireFarms = []

      for (let i in this.showFarms) {
        fireFarms.push({
          mint1: this.showFarms[i].farmInfo.lp.coin.mintAddress,
          mint2: this.showFarms[i].farmInfo.lp.pc.mintAddress,
          symbol1: this.showFarms[i].farmInfo.lp.coin.symbol,
          symbol2: this.showFarms[i].farmInfo.lp.pc.symbol,
          total_apr: this.showFarms[i].farmInfo.apr,
          apr: this.showFarms[i].farmInfo.apr_details.apr,
          apy: this.showFarms[i].farmInfo.apr_details.apy,
          link: '/farms/?s=' + this.showFarms[i].farmInfo.poolId
        })
      }

      this.fireFarms = fireFarms
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

      if (this.initBasedSearch == 1 && this.searchName.length > 10) {
        if (!this.labelizedAmms[this.searchName]) {
          this.searchCertifiedFarm = 'permissionless'
        }
      }

      this.initBasedSearch == 0

      try {
        this.poolsDatas = await fetch('https://api.cropper.finance/cmc/').then((res) => res.json())
      } catch {
        this.poolsDatas = []
      } finally {
        // nothing to do ..
      }
    }
  }
})
</script>

<style lang="less" scoped>
.fire-farms {
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

  .lp-icons {
    .lp-icons-group {
      background: @gradient-color-outline;
      background-origin: border-box;
      border-radius: 8px;
      padding: 2px;
      width: fit-content;

      .icons {
        background-color: @color-blue800;
        border-radius: 8px;
        padding: 4px 6px;

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

  .btn-container {
    border-radius: 48px;
    padding: 3px;
    height: auto;
    width: fit-content;
  }

  .btn-transparent {
    background: transparent;
    border: none;
    height: auto;
    width: auto;
    padding: 4.5px 15.5px;
    border-radius: 48px;
  }

  .noMobile {
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

  // class stylesheet
  .fire-farms-table {
    margin-top: 20px;

    .fire-farms-item {
      background: rgba(23, 32, 88, 0.9);
      border-radius: 8px;
      padding: 18px;
      margin-bottom: 10px;

      &:last-child {
        margin-bottom: 0;
      }

      .item-col {
        .item-col-title {
          color: #ffffff60;
        }
      }
    }
  }

  .fire-farms-slider {
    .fire-farms-slider-body {
      margin-top: 20px;

      .fire-farms-slider-item {
        background: rgba(23, 32, 88, 0.9);
        border-radius: 8px;
        padding: 18px;
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }

        .item-col {
          .item-col-title {
            color: #ffffff60;
          }
        }
      }
    }
  }
}
</style>