<template>
  <main :class="`nft-landing ${isIPhone ? 'isIPhone' : ''}`">
    <section class="section-banner p-relative">
      <div class="section-header nft-container text-center">
        <span class="text-shadow display-large weight-xbold spacing-xlarge d-block mb-8">Cropper Potions</span>
        <h1 class="weight-bold landing-description color-petrol500">DeFi Utility Through NFTs</h1>
        <div class="nft-videos-group mt-64">
          <vueper-slides
            ref="myVueperSlides"
            class="no-shadow nft-video-slider"
            :visible-slides="
              windowWidth >= 1200
                ? 4
                : windowWidth < 1200 && windowWidth >= 1024
                ? 3
                : windowWidth < 1024 && windowWidth >= 768
                ? 2
                : 3
            "
            :slide-ratio="4 / 5"
            :slide-multiple="windowWidth >= 768"
            :gap="5"
            :dragging-distance="70"
            :bullets="false"
            :arrows="true"
            :disableArrowsOnEdges="true"
            fixedHeight="500px"
            :touchable="windowWidth >= 1200 ? false : true"
          >
            <template #arrow-left>
              <img
                class="icon-cursor"
                src="@/assets/icons/arrow-left-tail-blue.svg"
                width="20"
                height="20"
                alt="arrow left slider"
              />
            </template>

            <template #arrow-right>
              <img
                class="icon-cursor"
                src="@/assets/icons/arrow-right-tail-blue.svg"
                width="20"
                height="20"
                alt="arrow right slider"
              />
            </template>

            <vueper-slide v-for="potion in potionsList" :key="potion.id" class="fcc-container">
              <template #content>
                <div class="nft-video-item rounded-9">
                  <div class="nft-video-container rounded-9 fcc-container">
                    <!-- :poster="require(`@/assets/nft/${potion.id}.png`)" -->
                    <video
                      class="nft-video w-100 h-100"
                      :ref="potion.id"
                      muted
                      loop
                      preload="yes"
                      playsinline
                      :poster="`https://cropper.finance/distant/nft/${potion.id}.png`"
                      @mouseenter="playVideo(potion.id)"
                      @mouseleave="stopVideo()"
                      :src="potion.video"
                    >
                      <source :src="potion.video" type="video/mp4" />
                    </video>
                  </div>
                </div>
              </template>
            </vueper-slide>
          </vueper-slides>
        </div>
      </div>
      <div class="section-countdown my-64 text-center p-relative">
        <div class="countdown-container rounded-4 m-auto text-center p-16">
          <Countdown title="Sale start" :value="saleStartDate" format="DD:HH:mm:ss" />
          <Divider />
          <Row>
            <Col :span="windowWidth > 767 ? 12 : 24">
              <div class="text-center">
                <h4 class="weight-bold spacing-medium">Total Supply</h4>
                <h4 class="sale-details-value weight-bold spacing-xxlarge">2222</h4>
              </div>
              <Divider v-if="windowWidth < 767" class="mt-24" />
            </Col>
            <Col :span="windowWidth > 767 ? 12 : 24">
              <div class="text-center">
                <h4 class="weight-bold spacing-medium">Mint Price</h4>
                <h4 class="sale-details-value weight-bold spacing-xxlarge">2 SOL</h4>
              </div>
            </Col>
          </Row>
          <a href="https://magiceden.io/launchpad/cropper_potions" target="_blank">
            <Button class="btn-container btn-gradient rounded-24 font-medium weight-semi spacing-small mt-8">
              Magic Eden Launchpad
            </Button>
          </a>
        </div>
      </div>
      <div class="logo-magiceden p-absolute">
        <span :class="`font-body-large spacing-medium d-block ${isIPhone ? 'font-medium' : ''}`"
          >in partnership with</span
        >
        <img src="@/assets/icons/logo-magiceden.svg" alt="magic eden" />
      </div>
    </section>
    <section class="section-concept nft-container mt-64 text-center">
      <span
        :class="`text-shadow display-medium weight-bold d-block mb-24 ${isIPhone ? 'font-xxlarge line-height-50' : ''}`"
        >What are Cropper Potion NFTs</span
      >
      <h2 class="weight-semi landing-description color-petrol500 text-center">
        A set of
        <h1
          :class="`weight-bold landing-description color-petrol500 d-inline-block mx-8 ${
            isIPhone ? 'font-xlarge' : ''
          }`"
        >
          2222 NFTs
        </h1>
        with two purposes:
      </h2>
      <div :class="`d-inline-block m-auto ${isIPhone ? 'mt-24' : 'mt-16'}`">
        <h3
          :class="`fcs-container weight-semi d-inline-block mb-8 text-left ${
            isIPhone ? 'font-body-medium line-height-50' : ''
          }`"
        >
          <img src="@/assets/icons/check-circle-gradient.svg" class="mr-16" alt="check circle gradient icon" />
          Make Cropper IDOs accessible through NFTs
        </h3>
        <h3 :class="`fcs-container weight-semi text-left ${isIPhone ? 'font-body-medium line-height-50' : ''}`">
          <img src="@/assets/icons/grow-gradient.svg" class="mr-16" alt="grow gradient icon" />
          Perpetually create value for NFTs Holders
        </h3>
      </div>
      <div class="nft-potions-group">
        <div v-for="potion in potionsList" :key="potion.title" class="nft-potion-item rounded-24 text-center">
          <h3 :class="`nft-potion-title d-block weight-extra spacing-medium ${potion.blurry ? 'blurry' : ''} ${isIPhone ? 'font-medium' : ''}`">
            {{ potion.title }} Potion
          </h3>
          <img :src="require(`@/assets/nft/${potion.id}.png`)" class="nft-potion-img w-50 mb-24" alt="nft image" />
          <div :class="`mb-24  ${potion.blurry ? 'blurry' : ''}`">
            <h4 :class="`nft-potion-label weight-semi spacing-medium ${isIPhone ? 'font-small' : ''}`">Total Supply</h4>
            <h2 :class="`weight-semi ${isIPhone ? 'font-large' : ''}`">{{ potion.total_supply }}</h2>
          </div>
          <div :class="`mb-24  ${potion.blurry ? 'blurry' : ''}`">
            <h4 :class="`nft-potion-label weight-semi spacing-medium ${isIPhone ? 'font-small' : ''}`">sCRP Boost</h4>
            <h2 :class="`weight-semi ${isIPhone ? 'font-large' : ''}`">{{ potion.crp_boost }}%</h2>
          </div>
          <div :class="`${potion.blurry ? 'blurry' : ''}`">
            <h4 :class="`nft-potion-label weight-semi spacing-medium ${isIPhone ? 'font-small' : ''}`">Rarity</h4>
            <h2 :class="`weight-semi ${isIPhone ? 'font-large' : ''}`">{{ potion.rarity }}</h2>
          </div>
        </div>
      </div>
    </section>
    <section class="section-utility">
      <div class="utility-roadmap nft-container text-left mt-64 p-relative">
        <img src="@/assets/icons/utility-q4.svg" class="p-absolute utility-img" alt="utility img" />
        <h1 class="text-shadow weight-xbold spacing-large text-center">Utility</h1>
        <div class="utility-roadmap-container">
          <h1 class="weight-bold text-shadow">
            1
            <h4 class="weight-semi d-inline-block">- Q3</h4>
          </h1>
          <br /><br />
          <h4 class="weight-semi color-petrol500">Boost Your sCRP Stake with Cropper Potions</h4>
          <div class="utility-note rounded-6 fs-container my-24">
            <img class="info-icon mr-16" src="@/assets/icons/info.svg" width="20px" height="20px" />
            <span class="font-body-large weight-semi spacing-medium">
              NFT boosts are combinable! E.g. if you're holding 2 Rare Potions and 1 Legendary Potion, you'll get a 200%
              boost.
            </span>
          </div>
          <div class="mb-64">
            <div class="fcs-container mt-24 mb-16">
              <img src="@/assets/icons/check-circle-gradient.svg" class="mr-16" alt="check circle gradient icon" />
              <h4 class="weight-semi color-neutral50">Stake Your NFT Potion on Cropper</h4>
            </div>
            <img
              :src="require(`@/assets/background/roadmap-q4-1${windowWidth <= 767 ? '-mobile' : ''}.png`)"
              :class="`w-100 utility-guide-img ${windowWidth > 767 ? 'px-64' : ''}`"
              alt="staking nft potion"
            />
            <div class="fcs-container mt-24 mb-16">
              <img src="@/assets/icons/check-circle-gradient.svg" class="mr-16" alt="check circle gradient icon" />
              <h4 class="weight-semi color-neutral50">Enjoy your sCRP boost and Tier up</h4>
            </div>
            <img
              :src="require(`@/assets/background/roadmap-q4-2${windowWidth <= 767 ? '-mobile' : ''}.png`)"
              :class="`w-100 utility-guide-img ${windowWidth > 767 ? 'px-64' : ''}`"
              alt="staking sCRP boost"
            />
          </div>
        </div>
      </div>
      <div class="utility-roadmap nft-container text-left mt-64 p-relative">
        <img src="@/assets/icons/utility-q3.svg" class="p-absolute utility-img" alt="utility img" />
        <div class="utilitiy-roadmap-container">
          <h1 class="weight-bold text-shadow">
            2
            <h4 class="weight-semi d-inline-block">- Q4</h4>
          </h1>
          <br /><br />
          <h4 class="weight-semi color-petrol500">Exclusive Access to Tier 6: the Alchemist</h4>
          <h4 class="weight-semi color-neutral50">Tiers 6 gives you a Massive allocation at each IDO on Cropper</h4>
          <div class="utility-note rounded-6 fs-container my-24">
            <img class="info-icon mr-16" src="@/assets/icons/info.svg" width="20px" height="20px" />
            <span class="font-body-large weight-semi spacing-medium">
              To access tier 6, you need to have at least: <br />
              <ul>
                <li>300,000 sCRP.</li>
                <li>100% boost from NFTs.</li>
              </ul>
            </span>
          </div>
        </div>
      </div>
      <div class="tiers-group mt-24">
        <div
          class="tiers-card-group fce-container pr-16 mobile-hidden p-relative"
          :style="windowWidth >= 1440 ? 'margin-right: calc((100% - 1440px) / 2)' : ''"
        >
          <div
            class="tiers-card-blur p-absolute h-100"
            :style="windowWidth >= 1440 ? 'width: calc(100% - 1440px + 64px)' : ''"
          ></div>
          <img
            v-for="i in (1, 6)"
            :key="i"
            :class="`tier-card tier${i} mr-16`"
            :src="require(`@/assets/tier/Tier${i}-card.png`)"
            alt="tier card"
          />
        </div>
        <vueper-slides
          class="no-shadow tiers-slider mobile-show"
          :visible-slides="1"
          :slide-ratio="4 / 5"
          :bullets="false"
          :disableArrowsOnEdges="true"
          :initSlide="6"
          fixedHeight="500px"
        >
          <template #arrow-left>
            <img class="icon-cursor" src="@/assets/icons/arrow-left-tail-blue.svg" alt="arrow left slider" />
          </template>

          <template #arrow-right>
            <img class="icon-cursor" src="@/assets/icons/arrow-right-tail-blue.svg" alt="arrow right slider" />
          </template>

          <vueper-slide v-for="i in (1, 6)" :key="i" :class="windowWidth < 768 ? 'fcc-container' : 'fcs-container'">
            <template #content>
              <div class="tier-container">
                <div :class="`tier-image-container fcc-container tier${i}`">
                  <img class="tier-image w-100" :src="require(`@/assets/tier/Tier${i}-card.png`)" />
                </div>
              </div>
            </template>
          </vueper-slide>
        </vueper-slides>
      </div>
      <div class="utility-roadmap nft-container text-left mt-64 p-relative">
        <img src="@/assets/icons/utility-q2.svg" class="p-absolute utility-img" alt="utility img" />
        <div class="utilitiy-roadmap-container">
          <h1 class="weight-bold text-shadow">
            3
            <h4 class="weight-semi d-inline-block">- Q1</h4>
          </h1>
          <br /><br />
          <h4 class="weight-semi color-petrol500">Revenue Sharing from FCFS Rounds in CRP</h4>
          <h4 class="weight-semi color-neutral50">
            The FCFS round will require users to pay with CRP in addition to the token price.
          </h4>
          <br /><br />
          <h4 class="weight-semi color-petrol500">Premium Access to FCFS Rounds</h4>
          <h4 class="weight-semi color-neutral50">
            Get access to the FCFS rounds 2 minutes before the public through your staked NFT(s).
          </h4>
          <div class="utility-note rounded-6 fs-container my-24">
            <img class="info-icon mr-16" src="@/assets/icons/info.svg" width="20px" height="20px" />
            <span class="font-body-large weight-semi spacing-medium">
              All CRP earned will be distributed to the NFT holders according to their staked NFT through an airdrop
              mechanism.
            </span>
          </div>
          <img
            :src="require(`@/assets/background/roadmap-q2${windowWidth <= 767 ? '-mobile' : ''}.png`)"
            :class="`w-100 ${windowWidth > 767 ? 'px-64' : ''}`"
            alt="staking nft potion"
          />
        </div>
      </div>
      <div class="utility-roadmap nft-container text-left mt-64">
        <div class="utilitiy-roadmap-container">
          <h1 class="weight-bold text-shadow">
            4
            <h4 class="weight-semi d-inline-block">- Q2</h4>
          </h1>
          <br /><br />
          <h4 class="weight-semi color-petrol500">More Surprises to Come Along the Way 🧪🔥</h4>
          <h4 class="weight-semi color-neutral50">Make sure to follow us on social media to stay up to date.</h4>
          <div class="social-btn-group fcc-container mt-64">
            <a
              class="btn-container btn-gradient rounded-24 font-medium weight-semi spacing-small fcc-container mr-36"
              href="https://t.co/JHryU5Umpk"
              target="_blank"
              aria-label="discord"
            >
              Join
              <img src="@/assets/icons/discord-white.svg" class="ml-8" width="30px" alt="discord icon" />
            </a>
            <a
              class="btn-container btn-gradient rounded-24 font-medium weight-semi spacing-small fcc-container"
              href="https://twitter.com/CropperFinance"
              target="_blank"
              aria-label="twitter"
            >
              Follow
              <img src="@/assets/icons/twitter-white.svg" class="ml-8" width="30px" alt="twitter icon" />
            </a>
          </div>
          <div class="nft-faq my-64">
            <h3 class="weight-bold w-100 d-block text-center">FAQ's</h3>
            <div class="nft-faq-container w-100 mt-24">
              <Row :gutter="16">
                <Col :span="windowWidth > 767 ? 12 : 24">
                  <Collapse expand-icon-position="right">
                    <CollapsePanel v-for="(item, idx) in nftFAQList" v-show="idx % 2 === 0" :key="idx">
                      <template slot="header">
                        <span class="font-medium weight-bold">{{ item.title }}</span>
                      </template>
                      <span class="font-medium" v-html="item.content"></span>
                    </CollapsePanel>
                  </Collapse>
                </Col>
                <Col :span="windowWidth > 767 ? 12 : 24">
                  <Collapse expand-icon-position="right">
                    <CollapsePanel v-for="(item, idx) in nftFAQList" v-show="idx % 2 === 1" :key="idx">
                      <template slot="header">
                        <span class="font-medium weight-bold">{{ item.title }}</span>
                      </template>
                      <span class="font-medium" v-html="item.content"></span>
                    </CollapsePanel>
                  </Collapse>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script lang="ts">
import Vue from 'vue'
import { Statistic, Divider, Row, Col, Button, Collapse } from 'ant-design-vue'
const { VueperSlides, VueperSlide } = require('vueperslides')
import 'vueperslides/dist/vueperslides.css'
const Countdown = Statistic.Countdown
const CollapsePanel = Collapse.Panel
import { sleep } from '@/utils'

export default Vue.extend({
  components: {
    Row,
    Col,
    Countdown,
    Divider,
    Button,
    Collapse,
    CollapsePanel,
    VueperSlides,
    VueperSlide
  },

  data() {
    return {
      isIPhone: false,
      saleStartDate: 1664200802000 as number,
      potionsList: [
        {
          id: 'primitive',
          title: 'Primitive',
          total_supply: 1333,
          crp_boost: 10,
          rarity: 0.6,
          blurry: false,
          video: 'https://cropper.finance/distant/nft/sm_Common.mp4'
        },
        {
          id: 'rare',
          title: 'Rare',
          total_supply: 667,
          crp_boost: 25,
          rarity: 0.3,
          blurry: false,
          video: 'https://cropper.finance/distant/nft/sm_Uncommon.mp4'
        },
        {
          id: 'epic',
          title: 'Epic',
          total_supply: 200,
          crp_boost: 50,
          rarity: 0.09,
          blurry: false,
          video: 'https://cropper.finance/distant/nft/sm_Rare.mp4'
        },
        {
          id: 'legendary',
          title: 'Legendary',
          total_supply: 22,
          crp_boost: 100,
          rarity: 0.01,
          blurry: false,
          video: 'https://cropper.finance/distant/nft/sm_Legendary.mp4'
        }
      ] as any[],
      nftFAQList: [
        {
          title: 'Where can I get Cropper Potions NFTs?',
          content: 'The mint will happen on MagicEden launchpad <a href="https://magiceden.io/launchpad/cropper_potions" target="_blank" aria-label="discord">https://magiceden.io/launchpad/cropper_potions</a>'
        },
        {
          title: 'What are the mint details?',
          content: 'Cropper Potions supply : 2222<br /><br />Minting schedule and price : <br /><br />Alchemist 🧙🏽 /OG 🥷<br/>- price : 1.9 SOL <br/>- date : 26/09 14:00 PM UTC<br /><br />Druid  🧝🏻<br/>- price : 2 SOL <br/>- date : 26/09 20:00 PM UTC<br /><br />Public 🙍<br/>- price : 2 SOL <br/>- date : 26/09 14:00 PM UTC<br /><br />Where to mint ? ⬇️ <br/><a href="https://magiceden.io/launchpad/cropper_potions" target="_blank" aria-label="discord">https://magiceden.io/launchpad/cropper_potions</a>'
        },
        {
          title: 'When can I mint the Cropper Potions?',
          content: 'White-listed users will be able to mint the 26th sept.<br />Public mint will be on the 26th sept.'
        },
        {
          title: 'What are Cropper Potions NFTs official links?',
          content: `Discord: <a href="https://discord.gg/zqf76CHAKy" target="_blank" aria-label="discord">https://discord.gg/zqf76CHAKy</a> <br />
            Twitter: <a href="https://twitter.com/CropperFinance" target="_blank" aria-label="twitter">https://twitter.com/CropperFinance</a> <br />
            Website: <a href="https://cropper.finance/nfts" target="_blank" aria-label="website">https://cropper.finance/nfts</a>`
        },
        {
          title: 'What is the advantage of being OG, Alchemist, Druid?',
          content: 'Being whitelisted and have a chance to mint a Cropper Potion NFT on MagicEden.'
        },
        {
          title: 'How can I earn a whitelist spot?',
          content:
            'There will have different ways to get whitelist spots through our partnerships and giveaways on Discord and Twitter.<br /> You can also access our WL by getting a role by doing quest on our Crew3 : <a href="https://cropper.crew3.xyz/questboard" target="_blank" aria-label="website">https://cropper.crew3.xyz/questboard</a>'
        },
        {
          title: 'Is potions NFT are cumulative?',
          content: 'Yes, you will be able to stake a maximum of 10 potions per wallet.'
        },
        {
          title: 'Is tier 6 is only accessible with NFT?',
          content: 'Yes, to reach tier 6 Alchemist you will need at least 300.000 sCRP staked + 100% from NFT(s) boost.'
        },
        {
          title: 'Hint on surprises to come along the way?',
          content: '🧪🔥'
        },
        {
          title: 'Should i stake CRP to enjoy the NFTs advantage?',
          content: 'Yes, to enjoy sCRP boost and tiers up you will need to stake CRP.'
        }
      ],
      windowWidth: window.innerWidth as any
    }
  },

  async mounted() {
    //@ts-ignore
    if (window.navigator.userAgent.match('iPhone') == 'iPhone') {
      this.isIPhone = true
    }

    if (this.windowWidth < 1200) {
      await sleep(100)
      //@ts-ignore
      this.$refs.myVueperSlides.next()
    }

    await sleep(100)

    this.stopVideo()

    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize)
    })
  },

  methods: {
    onResize() {
      this.windowWidth = window.innerWidth
    },
    playVideo(ref: any) {
      if (this.isIPhone) {
        return
      }
      this.potionsList.forEach((potion) => {
        //@ts-ignore
        const $video = this.$refs[potion.id][0]
        if (potion.id === ref) $video.play()
        else {
          $video.pause()
          $video.currentTime = 0
          //  $video.load()
        }
      })
    },
    stopVideo() {
      if (this.isIPhone) {
        return
      }
      this.potionsList.forEach((potion) => {
        //@ts-ignore
        const $video = this.$refs[potion.id][0]
        $video.pause()
        $video.currentTime = 0
        //  $video.load()
      })
    }
  }
})
</script>

<style lang="less" scoped>
.nft-landing {
  overflow-x: hidden;
  zoom: 0.67;

  .blurry {
    filter: blur(20px);
  }

  // global stylesheet
  .nft-container {
    max-width: @desktop-xl-width;
    margin: auto;
    padding: 0 64px !important;

    @media @max-lg-tablet {
      padding: 0 32px !important;
    }

    @media @max-sl-mobile {
      margin-top: 24px !important;
      padding: 0 20px !important;
    }
  }

  .btn-gradient {
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    padding: 9px 30px;
    height: auto;
    border: none;
  }

  .landing-description {
    text-shadow: 0 0 5px #000;
  }

  .mobile-show {
    display: none;

    @media @max-sl-mobile {
      display: block;
    }
  }

  .mobile-hidden {
    display: flex;

    @media @max-sl-mobile {
      display: none !important;
    }
  }

  // font
  h1 {
    @media @max-lg-tablet {
      font-size: 39px !important;
      line-height: 46.6px !important;
    }

    @media @max-sl-mobile {
      font-size: 31px !important;
      line-height: 37.2px !important;
    }
  }

  h2 {
    @media @max-lg-tablet {
      font-size: 31px !important;
      line-height: 37.2px !important;
    }

    @media @max-sl-mobile {
      font-size: 25px !important;
      line-height: 35px !important;
    }
  }

  h3 {
    @media @max-lg-tablet {
      font-size: 25px !important;
      line-height: 35px !important;
    }

    @media @max-sl-mobile {
      font-size: 20px !important;
      line-height: 26px !important;
    }
  }

  h4 {
    @media @max-lg-tablet {
      font-size: 20px !important;
      line-height: 26px !important;
    }

    @media @max-sl-mobile {
      font-size: 16px !important;
      line-height: 24px !important;
    }
  }

  // class stylesheet

  // slider
  .nft-videos-group {
    .vueperslide {
      .nft-video-item {
        transition: all ease-in-out 0.3s;

        .nft-video-container {
          aspect-ratio: 4 / 5;
          background: #000;
          border: 4px solid @color-blue400;
          max-width: 240px;
          overflow: hidden;
          mask-image: -webkit-radial-gradient(white, black);
          -webkit-mask-image: -webkit-radial-gradient(white, black);

          @media @max-lg-tablet {
            max-width: 200px;
          }

          @media @max-sl-mobile {
            max-width: 160px;
          }
        }

        &:hover {
          @media @max-xl-desktop {
            transform: scale(1.25);
            filter: drop-shadow(0 0 15px #fff);
          }

          @media @max-lg-tablet {
            transform: scale(1.25);
            filter: drop-shadow(0 0 10px #fff);
          }

          @media @max-sl-mobile {
            transform: scale(1);
            filter: drop-shadow(0 0 5px #fff);
          }

          .nft-video-container {
            border-width: 2px;
          }
        }
      }

      &.vueperslide--active {
        .nft-video-item {
          @media @max-lg-tablet {
            filter: drop-shadow(0 0 10px #fff);
          }

          @media @max-sl-mobile {
            transform: scale(1.25);
            filter: drop-shadow(0 0 5px #fff);

            .nft-video-container {
              border-width: 2px;
            }
          }
        }
      }
    }
  }

  .tiers-group {
    .tiers-card-group {
      height: 500px;

      .tiers-card-blur {
        top: 0;
        left: 0;
        background: linear-gradient(78.57deg, #000539 10.59%, rgba(0, 5, 57, 0) 117.38%);
        width: 64px;

        @media @max-lg-tablet {
          width: 32px;
        }

        @media @max-sl-mobile {
          width: 24px;
        }
      }

      .tier-card {
        aspect-ratio: 4 / 5;
        width: 225px;

        @media @max-xl-desktop {
          width: calc((100% - 112px - 64px) / 5.6);
        }

        @media @max-lg-tablet {
          width: calc((100% - 112px - 32px) / 5.6);
        }

        @media @max-sl-mobile {
          width: unset;
        }

        &.tier6 {
          width: 360px;
          filter: drop-shadow(0 0 25px #fff);
          margin: 0 32px;

          @media @max-xl-desktop {
            width: calc((100% - 112px - 64px) / 5.6 * 1.6);
          }

          @media @max-lg-tablet {
            width: calc((100% - 112px - 32px) / 5.6 * 1.6);
          }

          @media @max-sl-mobile {
            width: unset;
          }
        }
      }
    }

    .tiers-slider {
      .vueperslide {
        .tier-container {
          .tier-image-container {
            aspect-ratio: 4 / 5;
            max-width: 200px;

            &.tier6 {
              filter: drop-shadow(0 0 25px #fff);
              max-width: 270px;

              @media @max-lg-tablet {
                filter: drop-shadow(0 0 25px #fff);
              }

              @media @max-sl-mobile {
                filter: drop-shadow(0 0 15px #fff);
              }
            }
          }
        }
      }
    }
  }

  .section-banner {
    padding: 70px 0;
    background: url('assets/background/nft.png');
    background-repeat: no-repeat;
    background-size: cover;
    background-position-x: left;
    background-position-y: top;

    @media @max-sl-mobile {
      padding: 0;
      background: unset;
    }

    .section-header {
      padding: 0 64px !important;

      @media @max-lg-tablet {
        padding: 0 32px !important;
      }

      @media @max-sl-mobile {
        padding: 24px 20px !important;
        background: url('assets/background/nft.png');
        background-repeat: no-repeat;
        background-size: cover;
        background-position-x: left;
        background-position-y: top;
      }
    }

    .section-countdown {
      padding: 0 64px !important;

      @media @max-lg-tablet {
        padding: 0 32px !important;
      }

      @media @max-sl-mobile {
        padding: 0 20px !important;
        margin-top: -40px !important;
      }

      .countdown-container {
        background-color: transparent;
        border: solid 3px transparent;
        background-image: linear-gradient(@color-blue900, @color-blue900), @gradient-color03;
        background-origin: border-box;
        background-clip: padding-box, border-box;
        max-width: 700px;

        .sale-details-value {
          color: @color-nft;
        }
      }
    }

    .logo-magiceden {
      bottom: 36px;
      right: 20px;

      @media @max-sl-mobile {
        bottom: 356px;
      }
    }
  }

  .section-concept {
    .nft-potions-group {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-column-gap: 40px;
      grid-row-gap: 40px;
      margin: 100px 0 200px 0;

      @media @max-md-tablet {
        grid-template-columns: repeat(2, 1fr);
      }

      .nft-potion-item {
        padding: 32px 0;
        background: linear-gradient(302.66deg, rgba(39, 53, 146, 0.6) 0.08%, rgba(35, 173, 180, 0.6) 100%);
        box-shadow: 0 0 15px #183068;

        @media @max-lg-tablet {
          padding: 24px 0;
        }

        @media @max-sl-mobile {
          padding: 16px 0;
        }

        .nft-potion-title {
          height: 75px;

          @media @max-lg-tablet {
            height: 30px;
          }

          @media @max-sl-mobile {
            height: 30px;
          }
        }

        .nft-potion-label {
          opacity: 0.6;
        }
      }
    }
  }

  .section-utility {
    .utility-img {
      top: 0;
      right: 0;
      opacity: 0.35;
      height: 200px;

      &.q4 {
        height: 350px;
      }

      @media @max-md-tablet {
        display: none;
      }
    }

    .utility-note {
      background: #3d4574;
      padding: 18px;
    }

    .utility-guide-img {
      filter: drop-shadow(0 4px 55px rgba(255, 255, 255, 0.25));
    }

    .utility-roadmap {
      .social-btn-group {
        .btn-container {
          width: 200px;
        }
      }
    }
  }
}
</style>

<style lang="less">
.nft-landing {
  // ant countdown
  .ant-statistic {
    .ant-statistic-title {
      font-weight: 700;
      font-size: 31px;
      line-height: 37px;
      color: #fff;
    }
  }

  // ant divider
  .ant-divider {
    height: 2px;
    background: @gradient-color01;
    margin: 16px 0;
  }

  // ant collapse
  .ant-collapse {
    .ant-collapse-item {
      background: @color-blue500;
      border-radius: 8px;
      padding: 24px;
      margin-top: 16px;

      .ant-collapse-header {
        padding: 0;

        .ant-collapse-arrow {
          display: inline-block !important;
          right: 0;
        }
      }

      .ant-collapse-content {
        padding: 0;
        margin-top: 10px;

        .ant-collapse-content-box {
          padding: 0;
        }
      }
    }
  }

  // vueperslide
  .vueperslides {
    .vueperslides__inner {
      .vueperslides__parallax-wrapper {
        overflow: visible;
        .vueperslides__track {
          overflow: visible;
        }
      }
    }

    .vueperslides__arrows {
      .vueperslides__arrow--prev {
        left: 0 !important;

        @media @max-sl-mobile {
          left: 1.5em !important;
        }
      }
      .vueperslides__arrow--next {
        right: 0 !important;

        @media @max-sl-mobile {
          right: 1.5em !important;
        }
      }
    }
  }
}
</style>