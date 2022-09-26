<template>
  <div class="fertilizer-project container">
    <div class="card">
      <div class="card-body">
        <div class="project-body">
          <div class="project-content">
            <div class="project-detail-static">
              <div class="project-detail-card d-flex">
                <div class="project-detail-desc">
                  <div class="project-title fcs-container">
                    <CoinIcon class="project-logo" :mint-address="tokenInfos.mint" />

                    <h4 class="weight-bold spacing-medium">({{ tokenInfos.symbol }}) {{ tokenInfos.name }}</h4>

                    <a
                      v-if="tokenInfos.twitter"
                      :href="`https://twitter.com/${tokenInfos.twitter}`"
                      target="_blank"
                      aria-label="social twitter icon"
                    >
                      <img src="@/assets/icons/twitter-blue.svg" alt="social twitter blue icon" class="social-icon" />
                    </a>

                    <a
                      v-if="tokenInfos.telegram"
                      :href="`https://t.me/${tokenInfos.telegram}`"
                      target="_blank"
                      aria-label="social telegram icon"
                    >
                      <img src="@/assets/icons/telegram-blue.svg" alt="social telegram blue icon" class="social-icon" />
                    </a>
                  </div>

                  <span class="font-medium">{{ tokenInfos.description }}</span>
                </div>

                <div class="project-detail-info-group">
                  <Row :gutter="16">
                    <Col :md="8" :sm="12" :xs="12" class="project-detail-info-item">
                      <span class="title font-small weight-semi spacing-large">Token Price</span>

                      <div class="value fcs-container">
                        <CoinIcon class="coin-icon" :mint-address="fertilizer.mint" />

                        <span class="font-medium"
                          ><b>{{
                            Math.round(
                              (price.prices[tokenInfos.symbol]
                                ? price.prices[tokenInfos.symbol]
                                : this.lastknownPrice) * 100000000
                            ) / 100000000
                          }}</b></span
                        >
                      </div>
                    </Col>

                    <Col :md="8" :sm="12" :xs="12" class="project-detail-info-item">
                      <span class="title font-small weight-semi spacing-large">Total Supply</span>

                      <div class="value fcs-container">
                        <CoinIcon class="coin-icon" :mint-address="tokenInfos.mint" />

                        <span class="font-medium"
                          ><b>{{
                            tokenInfos.total_supply > 0
                              ? tokenInfos.total_supply.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                              : 'N/A'
                          }}</b></span
                        >
                      </div>
                    </Col>

                    <Col :md="8" :sm="12" :xs="12" class="project-detail-info-item">
                      <span class="title font-small weight-semi spacing-large">Decimals</span>

                      <div class="value fcs-container">
                        <span class="font-medium"
                          ><b>{{ tokenInfos.decimals > 0 ? tokenInfos.decimals : 'N/A' }}</b></span
                        >
                      </div>
                    </Col>

                    <Col :md="8" :sm="12" :xs="12" class="project-detail-info-item">
                      <span class="title font-small weight-semi spacing-large">Circulating supply</span>

                      <div class="value fcs-container">
                        <CoinIcon class="coin-icon" :mint-address="tokenInfos.mint" />

                        <span class="font-medium"
                          ><b>{{
                            tokenInfos.circulating_supply > 0
                              ? tokenInfos.circulating_supply.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                              : 'N/A'
                          }}</b></span
                        >
                      </div>
                    </Col>

                    <Col :md="8" :sm="12" :xs="12" class="project-detail-info-item">
                      <span class="title font-small weight-semi spacing-large">Holders</span>

                      <div class="value">
                        <span class="font-medium weight-semi">{{
                          tokenInfos.holders > 0
                            ? tokenInfos.holders.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            : 'N/A'
                        }}</span>
                      </div>
                    </Col>

                    <Col :md="8" :sm="12" :xs="12" class="project-detail-info-item">
                      <span class="title font-small weight-semi spacing-large">Website</span>

                      <div class="value">
                        <a class="website font-medium weight-semi" :href="tokenInfos.site_url" target="_blank">{{
                          tokenInfos.site_url
                        }}</a>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>

            <div
              v-if="price.prices[tokenInfos.symbol] > 0 || this.lastknownPrice > 0"
              class="swap-graph-container d-flex"
            >
              <div class="swap-container">
                <Swap :fromForced="defaultToken" :toForced="tokenInfos.symbol" />
              </div>

              <div class="graph-container">
                <div class="change-info">
                  <div class="var">
                    <span :class="`price-var fcc-container ${tokenInfos.price_variation1day < 0 ? 'red' : 'green'}`">
                      <img
                        :class="`arrow-triangle-icon ${tokenInfos.price_variation1day < 0 ? 'down' : 'up'}`"
                        src="@/assets/icons/arrow-down-triangle.svg"
                        alt="arrow down triangle icon"
                      />
                      <span class="font-small weight-semil spacing-large"
                        >{{ Math.round(Math.abs(tokenInfos.price_variation1day) * 1000) / 1000 }} %
                      </span>
                    </span>
                  </div>

                  <div class="graph-title">
                    <span class="graph-label font-small">
                      <b>{{ tokenInfos.symbol }} / USDC</b>
                      {{ price.prices[tokenInfos.symbol] }}
                    </span>
                  </div>
                </div>

                <div class="graph-place">
                  <div>
                    <line-chart
                      v-if="chartloaded"
                      class="tvl-chart"
                      :data="days === 1 ? chartData : days === 7 ? chartData7 : chartData30"
                      :options="chartOption"
                    />
                  </div>
                </div>

                <div class="sub-graph">
                  <div class="period-select">
                    <span
                      :class="`period-btn font-small weight-bold icon-cursor ${days === 1 ? 'selected' : ''}`"
                      @click="generateGraph(1)"
                      >24H</span
                    >
                    <span
                      :class="`period-btn font-small weight-bold icon-cursor ${days === 7 ? 'selected' : ''}`"
                      @click="generateGraph(7)"
                      >7D</span
                    >
                    <span
                      :class="`period-btn font-small weight-bold icon-cursor ${days === 30 ? 'selected' : ''}`"
                      @click="generateGraph(30)"
                      >1M</span
                    >
                  </div>

                  <div class="sub-container fst-container">
                    <div class="sub-item">
                      <span class="font-xsmall weight-bold">All time high</span>
                      <div v-if="tokenInfos.ath > 0">
                        <div class="fcs-container">
                          <CoinIcon class="coin-icon" :mint-address="fertilizer.mint" />
                          <span class="font-medium"
                            ><b>{{ Math.round(tokenInfos.ath * 1000000) / 1000000 }}</b> USDC</span
                          >
                        </div>
                        <span class="date font-xsmall weight-semi">{{ tokenInfos.ath_date }}</span>
                      </div>
                      <div v-else>
                        <div class="fcs-container font-medium">
                          <CoinIcon class="coin-icon" :mint-address="fertilizer.mint" /> N/A
                        </div>
                      </div>
                    </div>

                    <div class="sub-item">
                      <span class="font-xsmall weight-bold">All time low</span>
                      <div v-if="tokenInfos.atl > 0">
                        <div class="fcs-container">
                          <CoinIcon class="coin-icon" :mint-address="fertilizer.mint" />
                          <span class="font-medium"
                            ><b>{{ Math.round(tokenInfos.atl * 1000000) / 1000000 }}</b> USDC</span
                          >
                        </div>
                        <span class="date font-xsmall weight-semi">{{ tokenInfos.atl_date }}</span>
                      </div>
                      <div v-else>
                        <div class="fcs-container font-medium">
                          <CoinIcon class="coin-icon" :mint-address="fertilizer.mint" /> N/A
                        </div>
                      </div>
                    </div>

                    <div v-if="tokenInfos.circulating_supply > 0" class="sub-item">
                      <span class="font-xsmall weight-bold">Market cap</span>
                      <div class="fcs-container font-medium">
                        <CoinIcon class="coin-icon" :mint-address="fertilizer.mint" />
                        <span class="font-medium"
                          ><b>{{
                            tokenInfos.total_supply > 0
                              ? (Math.round(price.prices[tokenInfos.symbol] * tokenInfos.circulating_supply * 100) / 100)
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                              : 'N/A'
                          }}</b>
                          USDC</span
                        >
                      </div>
                      <span class="date font-xsmall weight-semi">{{ tokenInfos.atl_date }}</span>
                    </div>

                    <div v-else class="sub-item">
                      <span class="font-xsmall weight-bold">Fully diluted value</span>
                      <div class="fcs-container font-medium">
                        <CoinIcon class="coin-icon" :mint-address="fertilizer.mint" />
                        <span class="font-medium"
                          ><b>{{
                            tokenInfos.total_supply > 0
                              ? (Math.round(price.prices[tokenInfos.symbol] * tokenInfos.total_supply * 100) / 100)
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                              : 'N/A'
                          }}</b>
                          USDC</span
                        >
                      </div>
                      <span class="date font-xsmall weight-semi">{{ tokenInfos.atl_date }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="project-farms-pools">
              <div class="project-option-bar">
                <TabMenu
                  :tabList="[
                    { key: 'farm', name: 'Token Farms', short_name: 'Farms' },
                    { key: 'pool', name: 'Token Pools', short_name: 'Pools' }
                  ]"
                  fontSize="font-large"
                  @onChange="changeTab"
                ></TabMenu>
              </div>

              <TokenFarm v-if="filterTab === 'farm' && price.prices[tokenInfos.symbol] > 0" :farmID="token_project" />
              <TokenPool v-if="filterTab === 'pool' && price.prices[tokenInfos.symbol] > 0" :poolID="token_project" />
            </div>

            <div v-if="tokenInfos.long_desc" class="project-detail-container w-100" v-html="tokenInfos.long_desc"></div>

            <div v-else class="project-detail-container">
              <h4 class="weight-bold spacing-medium">About</h4>
              <div class="project-no-container text-center">
                <span class="font-medium weight-semi spacing-small"
                  >The project owner has not yet provided the information for this project.</span
                >
                <!--<br />
                <span class="font-small weight-semi spacing-large"
                  >You are the project owner ? bla bla bla <a href="#">Contact</a></span
                >-->
              </div>
            </div>

            <div class="fcsb-container project-move-container">
              <div v-if="tokenInfos.last != '' && loaded" class="fcs-container">
                <img class="arrow-direction-icon left" src="@/assets/icons/arrow-left-tail.svg" />
                <NuxtLink :to="`/token/${tokenInfos.last}/`" class="font-medium weight-semi spacing-small"
                  >Discover {{ tokenInfos.last }}</NuxtLink
                >
              </div>

              <div v-if="tokenInfos.last2 != '' && loaded" class="fcs-container">
                <NuxtLink :to="`/token/${tokenInfos.last2}/`" class="font-medium weight-semi spacing-small"
                  >Discover {{ tokenInfos.last2 }}</NuxtLink
                >
                <img class="arrow-direction-icon right" src="@/assets/icons/arrow-left-tail.svg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Row, Col, Statistic } from 'ant-design-vue'
import moment from 'moment'
import { getTokenBySymbol, TokenInfo, NATIVE_SOL, TOKENS } from '@/utils/tokens'
const Countdown = Statistic.Countdown
declare const window: any
import { getUnixTs } from '@/utils'
import LineChart from '../../components/ChartLine.vue'
import { mapState } from 'vuex'
const TEST_TIME = 1643500800000
// 1643500800000
const Vco = require('v-click-outside')
Vue.use(Vco)

export default Vue.extend({
  components: {
    Row,
    Col,
    LineChart
  },

  data() {
    return {
      loaded: false,
      tokenInfos: {} as any,
      chartloaded: false as any,
      chartData: {} as any,
      chartData7: {} as any,
      chartData30: {} as any,
      chartOption: {
        responsive: true,
        maintainAspectRatio: false,
        bezierCurve: false,
        legend: {
          display: false
        },
        elements: {
          point: {
            radius: 1
          }
        },
        scales: {
          xAxes: [
            {
              display: false
            }
          ],
          yAxes: []
        }
      },
      lastknownPrice: 0,
      TVL: 0 as any,
      fertilizer: {
        picture: '/fertilizer/banner/unq.png',
        logo: '/fertilizer/logo/zebec.png',
        title: '',
        short_desc: 'Social platform for NFT asset management',
        long_desc:
          'Whether a professional collector or aspiring enthusiast - UNQ is a place where you can take your game to the next level.',
        hard_cap: '3000K',
        pool_size: 5000,
        subscribers: 100418,
        website: 'zebec.io',
        website_url: 'https://zebec.io',
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        ido_info: {
          hard_cap: '?',
          sale_rate: '?',
          sale_type: '?',
          open_time: '?',
          close_time: '?'
        },
        token_info: {
          symbol: '?',
          category: 'DeFi',
          token_distribution: '?',
          blockchain: 'Solana'
        },
        img: {
          about: '/fertilizer/project/zebec/about.png',
          features: '',
          roadmap: '/fertilizer/project/zebec/roadmap.png',
          team: '/fertilizer/project/zebec/team.png',
          tokenomics: '/fertilizer/project/zebec/tokenomics.jpg',
          distribution: ''
        },
        whitelist_start_date: TEST_TIME + 60000 * 5,
        whitelist_end_date: TEST_TIME + 60000 * 10,
        sales_start_date: TEST_TIME + 60000 * 15,
        sales_end_date: TEST_TIME + 60000 * 20,
        distribution_start_date: TEST_TIME + 60000 * 25
      },
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
        win: true as boolean,
        subscribe: false as boolean
      },
      socialTicket: {
        telegram: 1 as number,
        twitter: 1 as number
      },
      currentTimestamp: 0 as any,
      currentStep: 1 as number,
      currentTier: 0 as number,
      affiliatedLink: 'http://cropper.finance/unq?r=250' as string,
      subscribeShow: false as boolean,
      taskModalShow: false as boolean,
      taskModalType: 0 as number,
      KYCStatus: {
        step: 1 as number,
        verification: 1 as number,
        userVerified: false as boolean
      },
      KYCModalShow: false as boolean,
      copyNotification: false as boolean,
      timer: null as any,
      token_project: '' as string,
      filterTab: 'farm' as string,
      days: 1,
      defaultToken: 'USDC' as string
    }
  },

  head: {
    title: 'Project Details',

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
        content: ''
      },
      {
        itemprop: 'name',
        content: ''
      },
      {
        name: 'title',
        content: ''
      },
      {
        hid: 'og:description',
        name: 'og:description',
        content: ''
      },
      {
        hid: 'description',
        itemprop: 'description',
        name: 'description',
        content: ''
      },
      {
        hid: 'twitter:card',
        name: 'twitter:card',
        content: 'summary'
      },
      {
        hid: 'twitter:card',
        name: 'twitter:card',
        content: ''
      },
      {
        hid: 'twitter:title',
        name: 'twitter:title',
        content: ''
      },
      {
        hid: 'twitter:description',
        name: 'twitter:description',
        content: ''
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
        href: ''
      }
    ]
  },

  computed: {
    ...mapState(['app', 'wallet', 'farm', 'url', 'price', 'liquidity'])
  },

  async mounted() {
    this.$accessor.token.loadTokens()

    let tok = TOKENS
    this.getTvl()
    this.token_project = this.$route.params.token
    let mint

    try {
      let short = await fetch('https://api.cropper.finance/tokens/info/short/').then((res) => res.json())

      for (let i in short) {
        if (i == this.$route.params.token) {
          mint = short[i]
        }
      }
    } catch {}

    try {
      //@ts-ignore
      this.tokenInfos = (
        await fetch('https://api.cropper.finance/tokens/info/' + mint + '/').then((res) => res.json())
      ).message
    } catch {
      //@ts-ignore
      let base = (
        await fetch(
          'https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json'
        ).then((res) => res.json())
      ).tokens

      for (let i in base) {
        if (base[i].symbol == this.$route.params.token) {
          mint = base[i]

          //@ts-ignore
          this.tokenInfos = (
            await fetch('https://api.cropper.finance/tokens/info/' + mint + '/').then((res) => res.json())
          ).message
        }
      }

      this.loaded = true

      const titleEl = document.querySelector('head title')
      //@ts-ignore
      titleEl?.textContent = this.tokenInfos.meta_title
        ? this.tokenInfos.meta_title
        : this.tokenInfos.symbol + ' - ' + this.tokenInfos.name + ' on Solana - Cropper'
      const descEl = document.querySelector('head meta[name="description"]')
      descEl?.setAttribute(
        'content',
        this.tokenInfos.meta_desc
          ? this.tokenInfos.meta_desc
          : this.tokenInfos.description
          ? this.tokenInfos.description.substring(0, 255)
          : 'Check all infos about ' +
            this.tokenInfos.symbol +
            ' token on Cropper and invest, trade, earn yield in the hottest Solana projects.'
      )

      const descEl4 = document.querySelector('head link[rel="canonical"]')
      descEl4?.setAttribute('href', 'https://cropper.finance/token/' + this.tokenInfos.symbol + '/')

      const descEl41 = document.querySelector('head meta[name="twitter:card"]')
      descEl41?.setAttribute('content', 'https://cropper.finance/token/' + this.tokenInfos.symbol + '/')

      const descEl2 = document.querySelector('head meta[name="og:description"]')
      descEl2?.setAttribute(
        'content',
        this.tokenInfos.meta_desc
          ? this.tokenInfos.meta_desc
          : this.tokenInfos.description
          ? this.tokenInfos.description.substring(0, 255)
          : 'Check all infos about ' +
            this.tokenInfos.symbol +
            ' token on Cropper and invest, trade, earn yield in the hottest Solana projects.'
      )
      const descEl3 = document.querySelector('head meta[name="og:title"]')
      descEl3?.setAttribute(
        'content',
        this.tokenInfos.meta_title
          ? this.tokenInfos.meta_title
          : this.tokenInfos.symbol + ' - ' + this.tokenInfos.name + ' on Solana - Cropper'
      )
    } finally {
      const titleEl = document.querySelector('head title')
      //@ts-ignore
      titleEl?.textContent = this.tokenInfos.meta_title
        ? this.tokenInfos.meta_title + ' - Cropper'
        : this.tokenInfos.symbol + ' - ' + this.tokenInfos.name + ' on Solana - Cropper'
      const descEl = document.querySelector('head meta[name="description"]')
      descEl?.setAttribute(
        'content',
        this.tokenInfos.meta_desc
          ? this.tokenInfos.meta_desc
          : this.tokenInfos.description
          ? this.tokenInfos.description.substring(0, 255)
          : 'Check all infos about ' +
            this.tokenInfos.symbol +
            ' token on Cropper and invest, trade, earn yield in the hottest Solana projects.'
      )
      const descEl2 = document.querySelector('head meta[name="og:description"]')
      descEl2?.setAttribute(
        'content',
        this.tokenInfos.meta_desc
          ? this.tokenInfos.meta_desc
          : this.tokenInfos.description
          ? this.tokenInfos.description.substring(0, 255)
          : 'Check all infos about ' +
            this.tokenInfos.symbol +
            ' token on Cropper and invest, trade, earn yield in the hottest Solana projects.'
      )
      const descEl3 = document.querySelector('head meta[name="og:title"]')
      descEl3?.setAttribute(
        'content',
        this.tokenInfos.meta_title
          ? this.tokenInfos.meta_title + ' - Cropper'
          : this.tokenInfos.symbol + ' - ' + this.tokenInfos.name + ' on Solana - Cropper'
      )

      const descEl41 = document.querySelector('head meta[name="twitter:card"]')
      descEl41?.setAttribute('content', 'https://cropper.finance/token/' + this.tokenInfos.symbol + '/')
      const descEl4 = document.querySelector('head link[rel="canonical"]')
      descEl4?.setAttribute('href', 'https://cropper.finance/token/' + this.tokenInfos.symbol + '/')

      this.tokenInfos.price_adayago = '-'
      this.tokenInfos.price_now = '-'
      this.tokenInfos.price_variation1day = '-'

      var d = new Date((this.tokenInfos.ath_date as unknown as number) * 1000)
      this.tokenInfos.ath_date =
        [d.getMonth() + 1, d.getDate(), d.getFullYear()].join('/') +
        ' ' +
        [d.getHours(), d.getMinutes(), d.getSeconds()].join(':') +
        ' (GMT)'

      d = new Date((this.tokenInfos.atl_date as unknown as number) * 1000)
      this.tokenInfos.atl_date =
        [d.getMonth() + 1, d.getDate(), d.getFullYear()].join('/') +
        ' ' +
        [d.getHours(), d.getMinutes(), d.getSeconds()].join(':') +
        ' (GMT)'

      this.loaded = true
      this.generateGraph(1)
    }

    if (this.tokenInfos == {}) {
      this.$router.push({ path: `/swap/` })
    }

    this.currentTimestamp = moment().valueOf()

    this.setTimer()

    // const query = new URLSearchParams(window.location.search)

    // if (query.get('tt')) this.TEST_TIME = (query.get('tt') as any) * 1
  },

  methods: {
    moment() {
      return moment()
    },

    setTimer() {
      this.timer = setInterval(async () => {
        this.currentTimestamp = moment().valueOf()
      }, 1000)
    },

    generateGraph(days: number) {
      this.days = days

      if (this.chartloaded == false) {
        //@ts-ignore
        let now = getUnixTs().toString() / 1000

        this.chartData = {
          labels: [] as string[],
          datasets: [
            {
              backgroundColor: function (context: any) {
                const chart = context.chart
                const { ctx } = chart
                let gradient
                gradient = ctx.createLinearGradient(0, 0, 0, 450)
                gradient.addColorStop(0, 'rgba(35, 173, 180, 0.4)')
                gradient.addColorStop(1, 'rgba(35, 173, 180, 0)')
                return gradient
              },
              label: this.token_project + '/USDC',
              borderColor: '#23ADB4',
              borderWidth: 2,
              data: [] as any[],
              yAxesID: this.token_project + '/USDC'
            }
          ]
        }

        this.chartData7 = {
          labels: [] as string[],
          datasets: [
            {
              backgroundColor: function (context: any) {
                const chart = context.chart
                const { ctx } = chart
                let gradient
                gradient = ctx.createLinearGradient(0, 0, 0, 450)
                gradient.addColorStop(0, 'rgba(35, 173, 180, 0.4)')
                gradient.addColorStop(1, 'rgba(35, 173, 180, 0)')
                return gradient
              },
              label: this.token_project + '/USDC',
              borderColor: '#23ADB4',
              borderWidth: 2,
              data: [] as any[],
              yAxesID: this.token_project + '/USDC'
            }
          ]
        }

        this.chartData30 = {
          labels: [] as string[],
          datasets: [
            {
              backgroundColor: function (context: any) {
                const chart = context.chart
                const { ctx } = chart
                let gradient
                gradient = ctx.createLinearGradient(0, 0, 0, 450)
                gradient.addColorStop(0, 'rgba(35, 173, 180, 0.4)')
                gradient.addColorStop(1, 'rgba(35, 173, 180, 0)')
                return gradient
              },
              label: this.token_project + '/USDC',
              borderColor: '#23ADB4',
              borderWidth: 2,
              data: [] as any[],
              yAxesID: this.token_project + '/USDC'
            }
          ]
        }

        let u = 0
        for (let i in this.tokenInfos.prices) {
          let date = new Date((i as unknown as number) * 1000)
          let formatDate = date.toLocaleDateString('en-US') + ' ' + date.toISOString().substring(11, 16) + ' UTC'

          //@ts-ignore
          if (i > now - 1 * 86400) {
            console.log('u', u);
            if (this.tokenInfos.price_adayago == '-') {
              this.tokenInfos.price_adayago = this.tokenInfos.prices[i]
              if (this.price.prices[this.token_project]) {
                this.tokenInfos.price_now = this.price.prices[this.token_project]
                this.tokenInfos.price_variation1day =
                  ((this.tokenInfos.price_now - this.tokenInfos.price_adayago) * 100) / this.tokenInfos.price_adayago
              }
            }
            this.chartData.labels.push(formatDate)
            this.chartData.datasets[0].data.push(this.tokenInfos.prices[i])

            if (!this.price.prices[this.token_project]) {
              this.tokenInfos.price_now = this.tokenInfos.prices[i]
              this.tokenInfos.price_variation1day =
                ((this.tokenInfos.price_now - this.tokenInfos.price_adayago) * 100) / this.tokenInfos.price_adayago

              console.log(this.tokenInfos.price_now, this.tokenInfos.price_adayago)
            }
          }

          //@ts-ignore
          if (i > now - 7 * 86400) {
            if (u % 2 == 1) {
              this.chartData7.labels.push(formatDate)
              this.chartData7.datasets[0].data.push(this.tokenInfos.prices[i])
            }
          }

          //@ts-ignore
          if (i > now - 30 * 86400) {
            if (u % 5 == 1) {
              this.chartData30.labels.push(formatDate)
              this.chartData30.datasets[0].data.push(this.tokenInfos.prices[i])
            }
          }

          this.lastknownPrice = this.tokenInfos.prices[i]
          u++
        }

        this.chartloaded = true
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

    KYCConfirm() {
      if (this.KYCStatus.step === 1 || (this.KYCStatus.step === 2 && this.KYCStatus.verification === 0))
        this.KYCModalShow = true
      else if (this.KYCStatus.step === 2 && this.KYCStatus.verification === 2) {
        this.KYCStatus.step = 3

        this.KYCStatus.userVerified = true
      }
    },

    changeTab(name: string) {
      this.filterTab = name
    }
  }
})
</script>



<style lang="less" scoped>
// global stylesheet

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

.social-icon {
  margin-left: 4px;
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

.hidden {
  opacity: 0;
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

      .project-body {
        @media @max-md-tablet {
          display: block;
        }

        .project-preview-container {
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

            .project-ido {
              background: linear-gradient(215.52deg, #273592 0.03%, #23adb4 99.97%);
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

              .project-ido-process {
                height: 100%;
                width: 100%;
                background: @color-blue800;
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

        .project-content {
          width: 100%;

          .project-detail-static {
            margin-bottom: 20px;
          }

          .swap-graph-container {
            @media @max-md-tablet {
              display: block;
            }

            .swap-container {
              width: 35%;

              @media @max-md-tablet {
                width: 100%;
                margin-bottom: 20px;
              }
            }

            .graph-container {
              width: calc(65% - 18px);
              margin-left: 18px;
              padding: 24px;
              background: @color-blue900;
              border-radius: 8px;

              @media @max-md-tablet {
                width: 100%;
                max-width: 100%;
                margin-left: 0;
              }

              .change-info {
                position: relative;
                padding-bottom: 5px;

                .var {
                  position: absolute;
                  top: 50%;
                  transform: translate(0, -50%);
                  right: 10px;

                  .arrow-triangle-icon {
                    margin-right: 8px;

                    &.up {
                      transform: rotate(180deg);
                    }
                  }

                  .price-var {
                    padding: 10px;
                    border-radius: 8px;

                    &.red {
                      background: @color-red600;
                    }

                    &.green {
                      background: @color-green600;
                    }
                  }
                }

                .graph-title {
                  .graph-label {
                    color: @color-neutral100;

                    b {
                      display: block;
                    }
                  }
                }
              }

              .graph-place {
                position: relative;
                height: 400px;

                & > div {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                }
              }

              .sub-graph {
                .period-select {
                  padding: 20px 0;
                  text-align: right;

                  .period-btn {
                    display: inline-block;
                    vertical-align: top;
                    color: @color-petrol500;
                    margin-left: 20px;
                    padding-bottom: 4px;

                    &.selected {
                      border-bottom: 3px solid @color-petrol500;
                    }
                  }
                }

                .sub-container {
                  @media @max-sl-mobile {
                    display: block !important;
                  }

                  .sub-item {
                    width: calc((100% - 36px) / 3);
                    background: @color-blue700;
                    border: 3px solid @color-blue500;
                    box-shadow: 0 40px 70px rgb(0 0 0 / 30%) !important;
                    border-radius: 18px;
                    padding: 13px;
                    display: inline-block;
                    margin-right: 14px !important;

                    &:last-child {
                      margin-right: 0 !important;
                    }

                    @media @max-sl-mobile {
                      width: 100%;
                      margin-right: 0;
                      margin-bottom: 28px;

                      &:last-child {
                        margin-bottom: 0;
                      }
                    }

                    .date {
                      color: #ffffff50;
                    }
                  }
                }
              }
            }
          }

          .project-farms-pools {
            margin-bottom: 20px;

            .project-option-bar {
              margin-top: 20px;
            }
          }

          .project-detail-container {
            .project-no-container {
              border: 1px solid @color-blue200;
              border-radius: 8px;
              padding: 117px 0;
              margin-top: 16px;
            }
          }

          .project-move-container {
            margin-top: 20px;

            .arrow-direction-icon {
              &.left {
                margin-right: 8px;
              }

              &.right {
                transform: rotate(180deg);
                margin-left: 8px;
              }
            }

            a {
              color: @color-petrol200;
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