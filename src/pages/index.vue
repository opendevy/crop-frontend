<template>
  <main class="landing">
    <section class="landing-body p-relative">
      <video class="landing-video" autoplay muted loop preload="auto" playsinline>
        <source :src="videoLinks.landing" type="video/mp4" />
      </video>
      <div class="section-padding">
        <div class="landing-content p-relative mt-64">
          <div class="cropper-content">
            <label class="display-medium weight-bold"
              >Launchpad 3.0
              <span class="font-body-large d-block weight-regular">
                Invest in early stage projects, trade, earn, and win crypto.
              </span>
            </label>
          </div>
          <div class="btn-container mt-24">
            <NuxtLink to="/launchpad/"><Button class="btn-transparent font-medium weight-semi spacing-small">Go to Launchpad</Button></NuxtLink>
          </div>
          <div class="powered-by mt-24">
            <span class="powered-title font-xmall weight-bold d-block">Powererd by</span>
            <img class="logo-solana" src="@/assets/landing/logo-solana.png" alt="Solana logo" />
          </div>
        </div>

        <div class="landing-news p-relative fcc-container mt-64">
          <div class="landing-news-box">
            <span class="font-medium weight-bold d-block mb-8">Cropper Discord Reopened!</span>
            <span class="font-small weight-semi spacing-large">Somethings going to happen there soon 👀</span>
            <div class="btn-container mt-16">
              <a href="https://discord.com/invite/bWwhbpvjAB" target="_blank"><Button class="btn-gradient font-small weight-semi spacing-large">Learn more</Button></a>
            </div>
          </div>
          <div class="landing-news-box">
            <span class="font-medium weight-bold d-block mb-8">Liquidity Mining 2.0</span>
            <span class="font-small weight-semi spacing-large"
              >Cropper Introduces Liquidity Mining 2.0 with PsyOption.</span
            >
            <div class="btn-container mt-16">
              <a href="https://cropperfinance.medium.com/cropper-introduces-liquidity-mining-2-0-in-partnership-with-psyoption-d001dd5f86e7" target="_blank"><Button class="btn-gradient font-small weight-semi spacing-large">Learn more</Button></a>
            </div>
          </div>
          <div class="landing-news-box">
            <span class="font-medium weight-bold d-block mb-8">New Ecosystem Member</span>
            <span class="font-small weight-semi spacing-large"
              >Companion.to announce their IDO in partnership with Cropper.</span
            >
            <div class="btn-container mt-16">
              <NuxtLink to="/launchpad/"><Button class="btn-gradient font-small weight-semi spacing-large">Learn more</Button></NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="fertilizerItems.length > 0" class="whitelist-open section-padding mt-64">
      <Row>
        <Col :span="windowWidth > 1024 ? 22 : 24" :offset="windowWidth > 1024 ? 1 : 0">
          <h3 class="weight-bold">{{ fertilizerMode }}</h3>
          <vueper-slides
            class="no-shadow mt-16"
            :arrows="false"
            bullets-outside
            :fixed-height="windowWidth > 767 ? '100px' : '216px'"
          >
            <vueper-slide v-for="item in fertilizerItems" :key="item.mint">
              <template #content>
                <div class="whitelist-open-table-body noMobile">
                  <Row class="whitelist-open-table-item fcs-container">
                    <Col class="item-col text-center" :span="windowWidth > 1024 ? 6 : 9">
                      <div class="fcs-container">
                        <img :src="item.token_logo" class="coin-icon large mr-8" alt="coin icon" />
                        <div class="text-left">
                          <span class="font-medium weight-semi d-block">{{ item.title }}</span>
                          <span class="item-col-title font-xsmall weight-semi">{{ item.short_desc }}</span>
                        </div>
                      </div>
                    </Col>

                    <Col class="item-col" :span="windowWidth > 1024 ? 3 : 0">
                      <span class="whitelist-badge text-center font-xsmall weight-bold">{{
                        fertilizerMode == 'Whitelist Open' ? 'Whitelist Open' : 'Preparation'
                      }}</span>
                    </Col>

                    <Col class="item-col" :span="windowWidth > 1024 ? 4 : 5">
                      <span class="item-col-title font-small weight-semi spacing-large d-block mb-4">Total raise</span>
                      <span class="font-medium weight-semi fcs-container">
                        <CoinIcon class="coin-icon mr-4" :mint-address="item.price_token_mint" />{{ item.total_raise }}
                        {{ item.price_token_display }}</span
                      >
                    </Col>

                    <Col class="item-col" :span="windowWidth > 1024 ? 4 : 5">
                      <span class="item-col-title font-small weight-semi spacing-large d-block mb-4">Token price</span>
                      <span class="font-medium weight-semi fcs-container"
                        ><CoinIcon class="coin-icon mr-4" :mint-address="item.price_token_mint" />{{
                          item.token_price
                        }}
                        {{ item.price_token_display }}</span
                      >
                    </Col>

                    <Col class="item-col" :span="windowWidth > 1024 ? 3 : 0">
                      <span class="item-col-title font-small weight-semi spacing-large d-block mb-4">Participants</span>
                      <span class="font-medium weight-semi fcs-container">{{ item.participants }}</span>
                    </Col>

                    <Col class="item-col" :span="windowWidth > 1024 ? 3 : 5">
                      <div class="btn-container">
                        <NuxtLink :to="item.link"
                          ><Button class="btn-transparent font-small weight-bold">{{
                            fertilizerMode == 'Whitelist Open' ? 'Join Whitelist' : 'More details'
                          }}</Button></NuxtLink
                        >
                      </div>
                    </Col>
                  </Row>
                </div>

                <div class="whitelist-open-table-body isMobile">
                  <div class="whitelist-open-table-item">
                    <div class="fcsb-container mb-16">
                      <div class="item-col text-center fcs-container">
                        <img :src="item.token_logo" class="coin-icon large mr-8" alt="coin icon" />
                        <div class="text-left">
                          <span class="font-medium weight-semi d-block">{{ item.title }}</span>
                          <span class="item-col-title font-xsmall weight-semi">{{ item.short_desc }}</span>
                        </div>
                      </div>

                      <div class="item-col">
                        <span class="whitelist-badge d-block text-center font-xsmall weight-bold">{{
                          fertilizerMode == 'Whitelist Open' ? 'Whitelist Open' : 'Preparation'
                        }}</span>
                      </div>
                    </div>

                    <div class="fcsb-container">
                      <div class="item-col">
                        <span class="item-col-title font-small weight-semi spacing-large d-block mb-4"
                          >Total raise</span
                        >
                        <span class="font-medium weight-semi fcs-container"
                          ><CoinIcon class="coin-icon mr-4" :mint-address="item.price_token_mint" />{{
                            item.total_raise
                          }}
                          {{ item.price_token_display }}</span
                        >
                      </div>

                      <div class="item-col">
                        <span class="item-col-title font-small weight-semi spacing-large d-block mb-4"
                          >Token price</span
                        >
                        <span class="font-medium weight-semi fcs-container"
                          ><CoinIcon class="coin-icon mr-4" :mint-address="item.price_token_mint" />{{
                            item.token_price
                          }}
                          {{ item.price_token_display }}</span
                        >
                      </div>
                    </div>

                    <div class="btn-container m-auto mt-16">
                      <NuxtLink :to="item.link"
                        ><Button class="btn-transparent font-small weight-bold">{{
                          fertilizerMode == 'Whitelist Open' ? 'Join Whitelist' : 'More details'
                        }}</Button></NuxtLink
                      >
                    </div>
                  </div>
                </div>
              </template>
            </vueper-slide>
          </vueper-slides>
        </Col>
      </Row>
    </section>

    <section class="farms-ido section-padding mt-64">
      <Row>
        <Col :span="windowWidth > 1024 ? 22 : 24" :offset="windowWidth > 1024 ? 1 : 0">
          <Row :gutter="[20, 20]">
            <Col :span="windowWidth > 768 ? 12 : 24">
              <FireFarms />
            </Col>

            <Col :span="windowWidth > 768 ? 12 : 24" :class="windowWidth < 768 ? 'mt-64' : ''">
              <TopFundedIDO />
            </Col>
          </Row>
        </Col>
      </Row>
    </section>

    <section class="cropper-support section-padding mt-64">
      <Row>
        <Col :span="windowWidth > 1024 ? 22 : 24" :offset="windowWidth > 1024 ? 1 : 0">
          <h2 class="weight-bold text-center">The Cropper Support</h2>
          <p class="font-large text-center eco-content">One-stop solution hub for DeFi projects and users.</p>
          <Row :gutter="[25, 25]" class="feature-box-group p-relative">
            <img class="stars-third-bg" src="@/assets/landing/stars-third-bg.svg" />
            <Col :span="windowWidth > 768 ? 6 : 12">
              <div class="feature-box">
                <img class="feature-img" src="@/assets/landing/feature-fertilizer.svg" />
                <h4 class="weight-bold spacing-medium text-left mt-16">Launchpad</h4>
                <p class="font-body-medium weight-semi spacing-small text-left">
                  We offer an IDO that energizes your community for the long term.
                </p>
                <NuxtLink to="/launchpad" class="now-btn font-medium weight-semi"> Explore Launchpad </NuxtLink>
              </div>
            </Col>
            <Col :span="windowWidth > 768 ? 6 : 12">
              <div class="feature-box">
                <img class="feature-img" src="@/assets/landing/feature-farming.svg" />
                <h4 class="weight-bold spacing-medium text-left mt-16">Farming</h4>
                <p class="font-body-medium weight-semi spacing-small text-left">
                  We propose to the project an attractive farm to allow a free circulation of tokens.
                </p>
                <NuxtLink to="/farms" class="now-btn font-medium weight-semi"> Farm Now </NuxtLink>
              </div>
            </Col>
            <Col :span="windowWidth > 768 ? 6 : 12">
              <div class="feature-box">
                <img class="feature-img" src="@/assets/landing/feature-staking.svg" />
                <h4 class="weight-bold spacing-medium text-left mt-16">Staking</h4>
                <p class="font-body-medium weight-semi spacing-small text-left">
                  We offer the project a dedicated staking to their community to earn rewards.
                </p>
                <NuxtLink to="/staking" class="now-btn font-medium weight-semi"> Stake Now </NuxtLink>
              </div>
            </Col>
            <Col :span="windowWidth > 768 ? 6 : 12">
              <div class="feature-box">
                <img class="feature-img" src="@/assets/landing/feature-swap.svg" />
                <h4 class="weight-bold spacing-medium text-left mt-16">Swap</h4>
                <p class="font-body-medium weight-semi spacing-small text-left">
                  Our smart search delivers the fairest swap instantly for all projects.
                </p>
                <NuxtLink to="/swap" class="now-btn font-medium weight-semi"> Swap Now </NuxtLink>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </section>

    <section class="why-cropper section-padding mt-64" id="why-cropper">
      <Row>
        <Col :span="windowWidth > 1024 ? 22 : 24" :offset="windowWidth > 1024 ? 1 : 0">
          <div class="audit-box-group d-flex w-100">
            <div class="audit-box">
              <h3 class="weight-bold">
                Farm Program <br />
                Security Audit
              </h3>
              <a
                class="read-pdf font-large weight-semi fcs-container color-white"
                href="https://github.com/HalbornSecurity/PublicReports/blob/master/Solana%20Program%20Audit/Cropper_Finance_Farm_Solana_Program_Security_Audit_Report_Halborn_Final.pdf"
                target="_blank"
              >
                <img class="pdf-icon" src="@/assets/icons/pdf.svg" />
                Read the Audit
              </a>
            </div>
            <div class="audit-box">
              <h3 class="weight-semi">
                AMM Program <br />
                Security Audit
              </h3>
              <a
                class="read-pdf font-large weight-semi fcs-container color-white"
                href="https://github.com/HalbornSecurity/PublicReports/blob/master/Solana%20Program%20Audit/Cropper_Finance_AMM_Program_Security_Audit_Report_Halborn_Final.pdf"
                target="_blank"
              >
                <img class="pdf-icon" src="@/assets/icons/pdf.svg" />
                Read the Audit
              </a>
            </div>
          </div>
          <div class="float-right mt-24">
            <span class="font-small">Audited by</span> <br />
            <img src="industry/halborn.svg" alt="halborn" />
          </div>
        </Col>
      </Row>
    </section>

    <section class="our-team mt-64">
      <h2 class="weight-bold text-center">Our team</h2>
      <div class="our-team-container p-relative mt-64">
        <Row :gutter="[40, 40]" class="our-team-members m-auto">
          <Col v-for="member in ourTeam" :key="member.name" :span="windowWidth > 767 ? 6 : 12">
            <div class="our-team-member-container text-center">
              <img class="team-avatar" :src="require(`@/assets/team/${member.avatar}`)" alt="team avatar" />
              <h4 class="weight-bold spacing-medium">{{ member.name }}</h4>
              <label class="team-position font-small weight-semi spacing-large">{{ member.position }}</label>
            </div>
          </Col>
        </Row>
      </div>
    </section>

    <section class="cropper-feed section-padding">
      <h2 class="weight-bold text-center">100,000 Croppers And Counting</h2>
      <div class="feed-container">
        <Row>
          <Col :span="windowWidth > 1024 ? 22 : 24" :offset="windowWidth > 1024 ? 1 : 0">
            <Row :gutter="[20, 20]">
              <Col v-for="twitter in twitterShows" :key="twitter.id" :xs="24" :sm="24" :md="8">
                <div class="feed-twitter">
                  <div class="feed-logo">
                    <img src="@/assets/icons/twitter-white.svg" />
                  </div>
                  <div class="feed-content font-medium">
                    {{ twitter.content }}
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
        <div class="feed-link">
          <a :href="socialLinks.twitter" target="_blank" class="btn-container d-block m-auto">
            <Button class="btn-primary font-medium weight-semi spacing-small">Join the Cropper</Button>
          </a>
        </div>
      </div>
    </section>

    <!-- <section class="surrounded-by mt-64">
      <h2 class="weight-bold text-center">
        Surrounded by the best <br />
        in the Industry
      </h2>
      <div class="category-group text-center">
        <Button
          class="category-btn font-large weight-semi"
          :class="currentCategory === 'backedBy' ? 'active' : ''"
          @click="selectCategory('backedBy')"
        >
          Backed by
        </Button>
        <Button
          class="category-btn font-large weight-semi"
          :class="currentCategory === 'advisors' ? 'active' : ''"
          @click="selectCategory('advisors')"
        >
          Advisors
        </Button>
        <Button
          class="category-btn font-large weight-semi"
          :class="currentCategory === 'partners' ? 'active' : ''"
          @click="selectCategory('partners')"
        >
          Partners
        </Button>
        <Button
          class="category-btn font-large weight-semi"
          :class="currentCategory === 'poweredBy' ? 'active' : ''"
          @click="selectCategory('poweredBy')"
        >
          Powered by
        </Button>
      </div>
      <div class="industry-container">
        <div class="industry-group">
          <Row :gutter="[20, 20]">
            <Col
              v-for="card in currentIndustry"
              :key="card.title"
              :xs="24"
              :sm="24"
              :md="currentIndustry.length >= 4 ? 6 : 24 / currentIndustry.length"
            >
              <div class="industry-card">
                <div class="industry-card-body">
                  <img :src="card.img" :width="card.width" />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </section> -->
  </main>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { Icon, Popover, Button, Row, Col, Tabs, Tooltip } from 'ant-design-vue'
const { VueperSlides, VueperSlide } = require('vueperslides')
import 'vueperslides/dist/vueperslides.css'
const { TabPane } = Tabs

@Component({
  head: {
    title: 'Cropper | Your DEXstination',
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
        hid: 'og:url',
        property: 'og:url',
        content: 'https://cropper.finance/'
      },
      {
        hid: 'og:title',
        property: 'og:title',
        content: 'Cropper | Your DEXstination'
      },
      {
        itemprop: 'name',
        content: 'Cropper | Your DEXstination'
      },
      {
        name: 'title',
        content: 'Cropper | Your DEXstination'
      },
      {
        hid: 'og:description',
        name: 'og:description',
        content:
          'Decentralized Ecosystem that Empowers Projects & Maximizes Yield to move Defi forward on Solana. Swap, Yield Farming, Staking, IDO Launchpad & more.'
      },
      {
        hid: 'description',
        itemprop: 'description',
        name: 'description',
        content:
          'Decentralized Ecosystem that Empowers Projects & Maximizes Yield to move Defi forward on Solana. Swap, Yield Farming, Staking, IDO Launchpad & more.'
      },
      {
        hid: 'twitter:card',
        name: 'twitter:card',
        content: 'summary'
      },
      {
        hid: 'twitter:card',
        name: 'twitter:card',
        content: 'https://cropper.finance/'
      },
      {
        hid: 'twitter:title',
        name: 'twitter:title',
        content: 'CropperFinance'
      },
      {
        hid: 'twitter:description',
        name: 'twitter:description',
        content:
          'Decentralized Ecosystem that Empowers Projects & Maximizes Yield to move Defi forward on Solana. Swap, Yield Farming, Staking, IDO Launchpad & more.'
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
        href: 'https://cropper.finance/'
      }
    ]
  },

  components: {
    Icon,
    Popover,
    Button,
    Row,
    Col,
    Tabs,
    TabPane,
    Tooltip,
    VueperSlides,
    VueperSlide
  },
  layout: 'home',
  async asyncData({ $accessor, $api }) {}
})
export default class Landing extends Vue {
  isPopupOpen = false
  TVL = 0 as any
  totalvolume = 0
  timer: number | undefined = undefined
  isFarmer: boolean = true
  isBacked: boolean = false
  isAdvisors: boolean = true
  isPartners: boolean = false
  isPowered: boolean = false
  isDirect: boolean = false
  twitterFeeds: any[] = []
  twitterShows: any[] = []
  CRPPrice: any = 0
  marketCap: any = 0

  lastSeen = 0
  notificationList = [] as any[]
  notifalert = 0

  telegramID = '' as string

  currentCategory: string = 'backedBy'
  surroundedList = {
    advisors: [
      {
        title: 'Dexlab',
        img: 'industry/dexlab.svg',
        width: 'unset'
      },
      {
        title: 'Solanium',
        img: 'industry/solanium.svg',
        width: 'unset'
      },
      {
        title: 'Halborn',
        img: 'industry/halborn.svg',
        width: 'unset'
      },
      {
        title: 'SKYVision Capital',
        img: 'industry/svc.svg',
        width: 'unset'
      }
    ],
    backedBy: [
      {
        title: 'SKYVision Capital',
        img: 'industry/svc.svg',
        width: 'unset'
      },
      {
        title: 'MEXC Global',
        img: 'industry/mexc.svg',
        width: 'unset'
      },
      {
        title: 'Gate.io',
        img: 'industry/gateio.svg',
        width: 'unset'
      },
      {
        title: 'Negocia Capital',
        img: 'industry/negocia.svg',
        width: 'unset'
      },
      {
        title: 'Solanium Ventures',
        img: 'industry/solaniumV.svg',
        width: 'unset'
      },
      {
        title: 'Newave Capital',
        img: 'industry/newave.svg',
        width: 'unset'
      },
      {
        title: 'DeltaHub Capital',
        img: 'industry/deltahub.svg',
        width: 'unset'
      },
      {
        title: 'AngelONE',
        img: 'industry/angelone.svg',
        width: 'unset'
      },
      {
        title: 'Cropperbros',
        img: 'industry/cropperbros.svg',
        width: '150px'
      },
      {
        title: 'Basics Capital',
        img: 'industry/basics.svg',
        width: 'unset'
      },
      {
        title: 'AVA Capital',
        img: 'industry/ava.svg',
        width: 'unset'
      },
      {
        title: 'M6',
        img: 'industry/m6.svg',
        width: 'unset'
      },
      {
        title: 'OIG',
        img: 'industry/oig.svg',
        width: 'unset'
      },
      {
        title: 'EX Capital',
        img: 'industry/ex.svg',
        width: 'unset'
      },
      {
        title: 'CryptoJ',
        img: 'industry/cryptoj.svg',
        width: 'unset'
      }
    ],
    partners: [
      {
        title: 'GenesysGo',
        img: 'industry/genesysgo.svg',
        width: '150px'
      },
      {
        title: 'Sonar',
        img: 'industry/sonar.svg',
        width: '150px'
      },
      {
        title: 'MEXC Global',
        img: 'industry/mexc.svg',
        width: 'unset'
      },
      {
        title: 'Gate.io',
        img: 'industry/gateio.svg',
        width: 'unset'
      },
      {
        title: 'Dexlab',
        img: 'industry/dexlab.svg',
        width: 'unset'
      }
    ],
    poweredBy: [
      {
        title: 'Solana',
        img: 'industry/solana.svg',
        width: '200px'
      },
      {
        title: 'Serum',
        img: 'industry/serum.svg',
        width: '200px'
      }
    ]
  }
  currentIndustry: any = this.surroundedList.backedBy
  socialLinks = {
    twitter: 'https://twitter.com/CropperFinance',
    discord: 'https://discord.com/invite/bWwhbpvjAB',
    medium: 'https://cropperfinance.medium.com/',
    telegram: 'https://linktr.ee/cropperfinance'
  }
  videoLinks = {
    landing: 'https://cropper.finance/distant/landing/landing-video.mp4',
    swap: 'https://cropper.finance/distant/landing/1-Buy-the-token-you-want.mov',
    stake: 'https://cropper.finance/distant/landing/2-Stake-liquidity.mov',
    harvest: 'https://cropper.finance/distant/landing/3-harvest.mov',
    unstake: 'https://cropper.finance/distant/landing/4-unstake.mov',
    pool: 'https://cropper.finance/distant/industry/poolcreationvideoforGIIF.mp4',
    farm: 'https://cropper.finance/distant/industry/createfarmvideo.mp4'
  }
  ourTeam = [
    {
      name: 'Croppish',
      avatar: 'croppish.png',
      position: 'CEO'
    },
    {
      name: 'El mosquito',
      avatar: 'elmosquito.png',
      position: 'CTO'
    },
    {
      name: 'Turothecat',
      avatar: 'turothecat.png',
      position: 'CMO'
    },
    {
      name: 'Robercry',
      avatar: 'robercry.png',
      position: 'CPO'
    },
    {
      name: 'Lionel',
      avatar: 'lionel.png',
      position: 'Frontend Dev'
    },
    {
      name: 'Phoon',
      avatar: 'phoon.png',
      position: 'Rust Dev'
    },
    {
      name: 'Zhao',
      avatar: 'zhao.png',
      position: 'Rust Dev'
    },
    {
      name: 'Lo',
      avatar: 'lo.png',
      position: 'PO'
    }
  ]
  blogSlider = [] as any
  cropperTokens = [
    {
      mintAddress: '1',
      symbol: 'CRP',
      direction: '+',
      changed: 1.2,
      price: 1.1
    },
    {
      mintAddress: '2',
      symbol: 'CRP',
      direction: '+',
      changed: 1.2,
      price: 1.1
    },
    {
      mintAddress: '3',
      symbol: 'CRP',
      direction: '+',
      changed: 1.2,
      price: 1.1
    },
    {
      mintAddress: '4',
      symbol: 'CRP',
      direction: '+',
      changed: 1.2,
      price: 1.1
    },
    {
      mintAddress: '5',
      symbol: 'CRP',
      direction: '+',
      changed: 1.2,
      price: 1.1
    }
  ]
  fertilizerItems = [] as any
  fertilizerMode = 'Whitelist Open'
  currentPlay: number = 1
  currentVideo: string = this.videoLinks.swap
  isScrolling: boolean = false
  blogSlides: any = [{}]
  windowWidth = window.innerWidth as any
  usdcMintAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' as string

  mounted() {
    this.getTvl()
    this.getTwitterFeeds()
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize)
      window.addEventListener('scroll', this.updateScroll)
    })

    this.loadIDOProjects()

    this.getNotifs()
  }

  async getNotifs() {
    let tmpnotificationList = []
    let alertneeded = 0
    let responseData

    try {
      responseData = await fetch('https://api.cropper.finance/notif/').then((res) => res.json())
    } catch {
    } finally {
      for (let i in responseData.message) {
        responseData.message[i].content = responseData.message[i].description

        responseData.message[i].alert = 0

        if (localStorage.notifSeen1 == undefined || responseData.message[i].ts_start > localStorage.notifSeen1) {
          responseData.message[i].alert = 1
          alertneeded = 1
        }

        tmpnotificationList.push(responseData.message[i])
      }
    }

    tmpnotificationList.sort(function (a, b) {
      return b.ts_start - a.ts_start
    })

    this.notifalert = alertneeded
    this.notificationList = tmpnotificationList

    console.log(this.notificationList)
    for (let i in this.notificationList) {
      this.blogSlider.push({
        title: this.notificationList[i].title,
        content: this.notificationList[i].content,
        link: this.notificationList[i].link
      })
    }
  }

  async loadIDOProjects() {
    let responseData: any = []

    try {
      responseData = await fetch('https://api.cropper.finance/fertilizer/').then((res) => res.json())

      for (let i in responseData.message) {
        if (
          responseData.message[i].ts_date_whitelist_end > new Date().getTime() / 1000 &&
          responseData.message[i].ts_date_whitelist_start < new Date().getTime() / 1000
        ) {
          this.fertilizerItems.push({
            mint: responseData.message[i].mint,
            title: responseData.message[i].title,
            short_desc: responseData.message[i].short_desc,
            total_raise: Math.round(responseData.message[i].pool_size / 10) / 100 + 'K',
            price_token_mint: responseData.message[i].price_token_mint,
            price_token_display:
              responseData.message[i].price_token_mint == 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
                ? 'USDC'
                : 'SOL',
            token_price: responseData.message[i].token_price,
            token_logo: responseData.message[i].token_logo,
            participants: '-',
            link: '/launchpad/' + responseData.message[i].slug + '/'
          })
        }
      }

      if (this.fertilizerItems.length < 1) {
        this.fertilizerMode = 'Whitelist Upcoming'

        for (let i in responseData.message) {
          if (responseData.message[i].ts_date_whitelist_start > new Date().getTime() / 1000) {
            this.fertilizerItems.push({
              mint: responseData.message[i].mint,
              title: responseData.message[i].title,
              short_desc: responseData.message[i].short_desc,
              total_raise: Math.round(responseData.message[i].pool_size / 10) / 100 + 'K',
              price_token_mint: responseData.message[i].price_token_mint,
              price_token_display:
                responseData.message[i].price_token_mint == 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
                  ? 'USDC'
                  : 'SOL',
              token_price: responseData.message[i].token_price,
              participants: '-',
              token_logo: responseData.message[i].token_logo,
              link: '/launchpad/' + responseData.message[i].slug + '/'
            })
          }
        }
      }
    } catch (e) {
      // dummy data
    } finally {
    }
  }

  beforeDestroy() {
    window.clearInterval(this.timer)
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('scroll', this.updateScroll)
  }

  updateScroll() {
    this.isScrolling = true
    if (window.scrollY === 0) this.isScrolling = false
  }

  changeToFarmer() {
    this.isFarmer = !this.isFarmer
  }

  changeToIndustry(num: number) {
    switch (num) {
      case 1:
        this.isBacked = true
        this.isAdvisors = false
        this.isPartners = false
        this.isPowered = false
        break
      case 2:
        this.isBacked = false
        this.isAdvisors = true
        this.isPartners = false
        this.isPowered = false
        break
      case 3:
        this.isBacked = false
        this.isAdvisors = false
        this.isPartners = true
        this.isPowered = false
        break
      case 4:
        this.isBacked = false
        this.isAdvisors = false
        this.isPartners = false
        this.isPowered = true
        break
    }
  }

  changeToDirect() {
    this.isDirect = !this.isDirect
  }

  selectCategory(category: string) {
    this.currentCategory = category
    if (category === 'advisors') this.currentIndustry = this.surroundedList.advisors
    else if (category === 'backedBy') this.currentIndustry = this.surroundedList.backedBy
    else if (category === 'partners') this.currentIndustry = this.surroundedList.partners
    else if (category === 'poweredBy') this.currentIndustry = this.surroundedList.poweredBy
  }

  selectVideo(id: number) {
    this.currentPlay = id
    if (id === 1) this.currentVideo = this.videoLinks.swap
    else if (id === 2) this.currentVideo = this.videoLinks.stake
    else if (id === 3) this.currentVideo = this.videoLinks.harvest
    else if (id === 4) this.currentVideo = this.videoLinks.unstake
    else if (id === 5) this.currentVideo = this.videoLinks.pool
    else if (id === 6) this.currentVideo = this.videoLinks.farm
  }

  async getMarketCap(price: any) {
    let responseData: any = []
    try {
      responseData = await fetch('https://api.cropper.finance/supply/').then((res) => res.json())
    } catch (err) {
      console.log(err)
    } finally {
      this.marketCap = Math.round(responseData * price)
      this.marketCap = this.marketCap.toLocaleString('en-US')
    }
  }

  async getTvl() {
    let cur_date = new Date().getTime()
    if (window.localStorage.TVL_last_updated && false) {
      const last_updated = parseInt(window.localStorage.TVL_last_updated)
      if (cur_date - last_updated <= 600000) {
        this.TVL = window.localStorage.TVL
        this.TVL = this.TVL.toLocaleString('en-US')
        return
      }
    }

    let responseData: any = []
    let tvl = 0

    try {
      responseData = await fetch('https://api.cropper.finance/staking/').then((res) => res.json())
      tvl = (responseData as any).globalTVL * 1
      this.CRPPrice = (responseData as any).price * 1
      this.getMarketCap(this.CRPPrice)
      this.CRPPrice = this.CRPPrice.toLocaleString('en-US')
    } catch {
      // dummy data
    } finally {
    }

    this.TVL = Math.round(tvl)

    window.localStorage.TVL_last_updated = new Date().getTime()
    window.localStorage.TVL = this.TVL

    this.TVL = this.TVL.toLocaleString('en-US')
  }

  async getTwitterFeeds() {
    let responseData: any = []
    try {
      responseData = await fetch('https://api.cropper.finance/tweets/').then((res) => res.json())
    } catch (err) {
      console.log(err)
    } finally {
      this.twitterFeeds = responseData
      this.twitterShows = this.twitterFeeds.slice(0, 3)
    }
  }

  switchTab(activeKey: any) {
    console.log(activeKey)
    if (activeKey === '1') {
      this.currentPlay = 1
      this.currentVideo = this.videoLinks.swap
    } else if (activeKey === '2') {
      this.currentPlay = 5
      this.currentVideo = this.videoLinks.pool
    }
  }

  onResize() {
    this.windowWidth = window.innerWidth
  }
}
</script>

<style lang="less" scoped>
.landing {
  // global stylesheet
  .btn-container {
    border-radius: 48px;
    padding: 3px;
    height: auto;
    width: fit-content;
  }

  .btn-primary {
    background: @color-blue800;
    border: none;
    border-radius: 48px;
    height: auto;
    width: auto;
    padding: 7.5px 18px;
  }

  .btn-transparent {
    background: transparent;
    border: none;
    height: auto;
    width: auto;
    padding: 4.5px 15.5px;
    border-radius: 48px;
  }

  .btn-gradient {
    background: linear-gradient(97.75deg, #280c86 -29.89%, #22b5b6 150.53%);
    border: none;
    height: auto;
    width: auto;
    padding: 9.5px 22px;
    border-radius: 48px;
  }

  .coin-icon {
    width: 16px;
    height: 16px;
    border-radius: 50%;

    &.large {
      width: 40px;
      height: 40px;
    }
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

  .section-padding {
    max-width: 1440px;
    margin: auto;
    padding-left: 64px;
    padding-right: 64px;

    @media @max-lg-tablet {
      padding-left: 32px;
      padding-right: 32px;
    }

    @media @max-sl-mobile {
      padding: 20px;
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
  .landing-body {
    padding-top: 100px;
    padding-bottom: 36px;
    min-height: 840px;

    @media @max-sl-mobile {
      padding-top: 20px;
      padding-bottom: 20px;
    }

    .landing-video {
      position: absolute;
      left: 0;
      top: -0;
      min-width: 100%;
      min-height: 100%;
      width: 100%;
      height: 100%;
      object-fit: cover;
      overflow: hidden;
    }

    .landing-content {
      .cropper-content {
        margin-top: 64px;

        @media @max-sl-mobile {
          margin-top: 28px;
        }
      }

      .powered-by {
        .powered-title {
          color: @color-blue50;
          margin-bottom: 4px;
        }

        .logo-solana {
          width: 150px;
        }
      }
    }

    .landing-news {
      @media @max-sl-mobile {
        display: block !important;
      }

      .landing-news-box {
        background: linear-gradient(136.82deg, rgba(34, 181, 182, 0.5) 10.14%, rgba(40, 12, 134, 0.15) 85.36%);
        border: 4px solid @color-petrol500;
        border-radius: 24px;
        padding: 16px 24px;
        max-width: 320px;
        margin-right: 35px;

        &:last-child {
          margin-right: 0;
        }

        @media @max-sl-mobile {
          margin-right: 0;
          margin-bottom: 16px;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }

  .whitelist-open {
    .whitelist-open-table-body {
      .whitelist-open-table-item {
        background: rgba(23, 32, 88, 0.9);
        border-radius: 8px;
        padding: 18px;
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }

        .item-col {
          .whitelist-badge {
            padding: 4px 8px;
            background: @color-red600;
            border-radius: 6px;
          }

          .item-col-title {
            color: #ffffff60;
          }
        }
      }
    }
  }

  .why-cropper {
    .audit-box-group {
      @media @max-sl-mobile {
        display: inline-block !important;
        width: 100%;
      }

      .audit-box {
        padding: 16px;
        background: linear-gradient(90deg, #273592 0%, rgba(39, 53, 146, 0.33) 100%);
        border-radius: 8px;
        width: calc((100% - 20px) / 2);
        margin-right: 20px;
        border: 4px solid transparent;
        background-origin: border-box;

        &:hover {
          border: 4px solid @color-petrol500;
        }

        @media @max-lg-tablet {
          padding-left: 37px;
        }

        @media @max-sl-mobile {
          width: 100%;
          background-origin: border-box;
          margin-bottom: 20px;

          &:last-child {
            margin-bottom: 0;
          }
        }

        &:last-child {
          margin-right: 0;
        }

        .read-pdf {
          margin-top: 38px;

          .pdf-icon {
            margin-right: 18px;
          }
        }
      }
    }
  }

  .cropper-support {
    .eco-content {
      margin: 20px auto;
      width: 60%;

      @media @max-sl-mobile {
        width: 100%;
      }
    }

    .feature-box-group {
      margin-top: 48px !important;

      .stars-third-bg {
        position: absolute;
        left: calc(50% - 350px);
        top: calc(50% - 350px);

        @media @max-sl-mobile {
          display: none;
        }
      }

      .feature-box {
        position: relative;
        background: linear-gradient(136.82deg, rgba(34, 181, 182, 0.5) 10.14%, rgba(40, 12, 134, 0.15) 85.36%);
        border-radius: 42px;
        padding-left: 36px;
        padding-right: 36px;
        height: 472px;
        padding-top: 30px;
        border: 4px solid transparent;
        background-origin: border-box;
        text-align: center;
        transition: all 0.3s;

        @media @max-lg-tablet {
          padding-left: 18px;
          padding-right: 18px;
        }

        @media @max-md-tablet {
          height: 376px;
        }

        @media @max-sl-mobile {
          padding: 18px 8px;
          border-radius: 22px;
          height: 340px;
        }

        &:last-child {
          margin-right: 0;
        }

        .feature-img {
          width: 100%;
          max-width: 214px;

          @media @max-md-tablet {
            max-width: 154px;
          }
        }

        .content {
          margin-top: 5px;
          margin-bottom: 60px !important;

          @media @max-sl-mobile {
            margin-bottom: 18px !important;
          }
        }

        .now-btn {
          display: block;
          color: #fff;
          position: absolute;
          bottom: 18px;
          background: @color-petrol500;
          border-radius: 48px;
          padding: 8px 0;
          width: calc(100% - 72px);
          text-align: center;
          opacity: 0;
          transition: ease-in-out 0.3s;

          &.soon {
            background: rgba(35, 173, 180, 0.5);
          }

          @media @max-lg-tablet {
            width: calc(100% - 36px);
          }

          @media @max-sl-mobile {
            width: calc(100% - 16px);
          }
        }

        &:hover {
          padding-top: 0;
          border: 4px solid @color-petrol500;

          .now-btn {
            opacity: 1;
          }
        }
      }
    }
  }

  .our-team {
    display: none;

    .our-team-container {
      height: calc(100vw * 1004 / 1600);

      @media @max-sl-mobile {
        height: auto;
      }

      .landing-third-bg {
        position: absolute;
        top: 0;
        width: 100%;

        @media @max-md-tablet {
          bottom: 0;
        }

        @media @max-sl-mobile {
          display: none;
        }
      }

      .our-team-members {
        max-width: 833px;

        .our-team-member-container {
          .team-avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
          }

          .team-position {
            color: #ffffff60;
          }
        }
      }
    }
  }

  .cropper-feed {
    margin-top: 100px;

    .feed-description {
      margin-top: 20px;
      width: 80%;
      margin-left: 10%;

      @media @max-sl-mobile {
        width: 100%;
        margin-left: 0;
      }
    }

    .feed-container {
      margin-top: 50px;

      .feed-twitter {
        background: linear-gradient(115.9deg, #22b5b6 -40.58%, #280c86 95.48%);
        border-radius: 22px;
        padding: 20px;

        .feed-content {
          white-space: pre-line;
        }
      }

      .feed-video {
        background: linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
          linear-gradient(278.99deg, rgba(34, 181, 182, 0.6) 0%, rgba(40, 12, 134, 0.6) 100%);
        border: 3px solid #7a88b6;
        border-radius: 22px;
        height: 380px;

        @media @max-sl-mobile {
          height: 208px;
        }
      }

      .feed-medium {
        background: linear-gradient(115.9deg, #22b5b6 -40.58%, #280c86 95.48%);
        border-radius: 22px;
        padding: 22px;

        @media @max-sl-mobile {
          height: 124px;
        }
      }
    }

    .feed-link {
      margin-top: 20px;
      text-align: center;
    }
  }

  // .surrounded-by {
  //   .category-group {
  //     margin-top: 48px;
  //     padding: 32px 0;
  //     border-top: 2px solid rgba(255, 255, 255, 0.2);
  //     border-bottom: 2px solid rgba(255, 255, 255, 0.2);

  //     @media @max-sl-mobile {
  //       margin-top: 18px;
  //       padding: 12px 0;
  //     }

  //     .category-btn {
  //       padding: 17px 30px;
  //       background: transparent;
  //       border: 2px solid transparent;
  //       height: auto;
  //       color: #fff;
  //       margin-right: 38px;

  //       @media @max-sl-mobile {
  //         padding: 8px 12px;
  //         font-size: 13px !important;
  //         line-height: 19.5px !important;
  //         margin-right: 0;
  //       }

  //       &.active {
  //         background: @gradient-color-icon;
  //         background-origin: border-box;
  //         border: 2px solid rgba(255, 255, 255, 0.14);
  //         box-shadow: 0 4px 5px rgba(0, 0, 0, 0.5);
  //         border-radius: 8px;
  //       }

  //       &:last-child {
  //         margin-right: 0;
  //       }
  //     }
  //   }

  //   .industry-container {
  //     max-width: 952px;
  //     margin: auto;

  //     @media @max-lg-tablet {
  //       padding: 0 32px;
  //     }

  //     @media @max-sl-mobile {
  //       padding: 0 20px;
  //     }

  //     .industry-group {
  //       padding: 90px 0;

  //       @media @max-sl-mobile {
  //         padding: 24px 0;
  //       }

  //       .industry-card {
  //         background: @gradient-color-icon;
  //         height: 130px;
  //         padding: 2px;
  //         border-radius: 8px;

  //         @media @max-sl-mobile {
  //           height: 80px;
  //         }

  //         .industry-card-body {
  //           width: 100%;
  //           height: 100%;
  //           background: @color-blue800;
  //           border-radius: 8px;
  //           display: flex;
  //           align-items: center;
  //           justify-content: center;
  //         }
  //       }
  //     }
  //   }
  // }
}
</style>
<style lang="less">
.landing {
  // ant tabs
  .ant-tabs {
    .ant-tabs-bar {
      border-bottom: 2px solid rgba(255, 255, 255, 0.2);
      padding: 0 calc(64px + 4.166666666666667%);
      margin: 0 0 48px 0;

      @media @max-lg-tablet {
        padding: 0 32px;
        margin: 0 0 32px 0;
      }

      @media @max-md-tablet {
        padding: 0 32px;
        margin: 0 0 16px 0;
      }

      @media @max-sl-mobile {
        padding: 0 20px;
        margin-bottom: 20px;
      }

      .ant-tabs-nav {
        .ant-tabs-tab {
          font-weight: 600;
          font-size: 25px;
          line-height: 37px;
          letter-spacing: 0.25px;
          padding-bottom: 20px;
          margin-right: 65px;

          @media @max-sl-mobile {
            font-size: 20px;
            line-height: 30px;
          }

          &:last-child {
            margin-right: 0;
          }

          &:active,
          &:hover {
            color: @color-petrol500;
          }
        }

        .ant-tabs-tab-active {
          color: @color-petrol500;
        }

        .ant-tabs-ink-bar {
          background: @color-petrol500;
        }
      }
    }

    .ant-tabs-top-content.ant-tabs-content-animated {
      transition: margin-left 0.7s cubic-bezier(0.645, 0.045, 0.355, 1);
    }

    .ant-tabs-top-content > .ant-tabs-tabpane {
      padding: 0 calc(64px + 4.166666666666667%);

      @media @max-lg-tablet {
        padding: 0 32px;
      }

      @media @max-sl-mobile {
        padding: 0 20px;
      }

      .play-list {
        padding-top: 28px;

        .play-list-btn {
          margin-bottom: 18px;
          padding: 15px 0 15px 19px;
          background: @color-blue800;
          border-radius: 8px;
          border: 3px solid @color-blue800;
          color: #fff;
          height: auto;
          width: 100%;
          max-width: 292px;
          text-align: unset;

          @media @max-lg-tablet {
            padding: 15px 10px;
          }

          @media @max-md-tablet {
            padding: 15px 5px;
          }

          &:hover,
          &.active {
            background: @color-blue600;
            border: 3px solid @color-petrol400;
            box-shadow: 0 4px 5px rgba(0, 0, 0, 0.5);
          }

          &:last-child {
            margin-bottom: 0;
          }
        }
      }

      .video-play-col {
        display: flex;
        border: 3px solid #7a88b6;
        border-radius: 42px;
        background: @color-blue800;
        padding: 0 !important;

        @media @max-sl-mobile {
          margin-top: 20px;
        }

        .video-player {
          border-radius: 42px;
          width: 100%;
        }
      }
    }
  }

  @media @max-md-tablet {
    .balance-infos {
      margin-top: 40px;
    }
  }

  .vueperslides__track-inner {
    align-items: center;
  }

  .vueperslides__arrow {
    &.vueperslides__arrow--prev {
      left: -15px;
    }

    &.vueperslides__arrow--next {
      right: -15px;
    }
  }

  .vueperslides--fixed-height.vueperslides--bullets-outside {
    margin-bottom: 0;
  }

  .vueperslides__bullet .default {
    border: none;
    background: @color-petrol300;
    opacity: 0.4;
  }

  .vueperslides__bullet--active .default {
    background: @color-petrol50;
    opacity: 1;
  }
}
</style>