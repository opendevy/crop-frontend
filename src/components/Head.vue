<template>
  <Header class="header fcsb-container" :class="isScrolling ? 'scrolling' : ''">
    <div class="nav-container fcs-container">
      <div
        class="menu collapse"
        v-click-outside="
          () => {
            this.showMenu = false
          }
        "
      >
        <div class="menu-icon-container icon-cursor" @click="() => (showMenu = !showMenu)">
          <img class="menu-icon" :src="require(`@/assets/icons/${showMenu ? 'close' : 'menu'}.svg`)" alt="menu icon" />
        </div>

        <div v-if="showMenu" class="collapse-menu">
          <div v-if="wallet.connected" class="tier-container">
            <div
              :class="`tier-info-icon fcsb-container icon-cursor w-100 ${showTierMenu ? 'active' : ''}`"
              @click="
                () => {
                  this.showTierMenu = !this.showTierMenu
                }
              "
            >
              <div class="fcs-container">
                <div class="tier-profile fcc-container">
                  <img class="tier-profile-img" :src="require(`@/assets/tier/Tier${wallet.tiers}.png`)" />
                </div>
                <span class="font-large weight-bold"> Profile </span>
              </div>

              <img
                class="arrow-icon"
                :class="showTierMenu ? 'arrow-up' : 'arrow-down'"
                src="@/assets/icons/arrow-down-white.svg"
              />
            </div>

            <div v-if="showTierMenu" class="tier-info-menu">
              <div class="nohover collapse-item">
                <div class="tier-profile-container fcsb-container">
                  <span class="font-medium weight-bold">Level: Tier {{ tierloaded ? wallet.tiers : '-' }}</span>
                </div>
              </div>
              <div v-if="tierloaded" class="nohover collapse-item text-center font-medium weight-semi">
                <div class="tier-progress text-left">
                  <div class="tier-progress-label fcsb-container">
                    <span class="font-xsmall weight-bold">Tier {{ wallet.tiers }}</span>
                    <span v-if="wallet.tiers < 5" class="font-xsmall weight-bold">Tier {{ wallet.tiers + 1 }}</span>
                  </div>
                  <Progress
                    type="line"
                    :stroke-width="14"
                    :percent="Number(pctToNexttiers.toFixed(1))"
                    :show-info="false"
                  />
                  <div class="tier-progress-info-container">
                    <div
                      v-if="Number(pctToNexttiers.toFixed(1)) > 1"
                      class="tier-progress-end"
                      :style="'margin-left: calc(' + Number(pctToNexttiers.toFixed(1)) + '% - 2px)'"
                    ></div>
                    <label
                      v-if="wallet.tiers < 5"
                      class="tier-progress-percent font-xsmall"
                      :style="
                        Number(pctToNexttiers.toFixed(1)) < 90
                          ? 'margin-left: calc(' + Number(pctToNexttiers.toFixed(1)) + '% - 2px)'
                          : 'margin-left: 90%'
                      "
                    >
                      {{ userTier }} sCRP
                    </label>
                    <label v-else class="staking-progress-percent max-tier font-xsmall"> {{ userTier }} sCRP </label>
                  </div>
                </div>
              </div>

              <div
                class="collapse-item text-center font-medium weight-semi icon-cursor"
                @click="
                  () => {
                    this.showMenu = false
                  }
                "
              >
                <NuxtLink to="/staking/"> Stake CRP </NuxtLink>
              </div>
              <NuxtLink
                to="/kyc"
                v-if="false && currentTiers >= 3 && KYCStatus.step == 2 && KYCStatus.verification == 0"
                ><div class="collapse-item fcc-container">
                  <div class="kyc-status">
                    <span class="font-medium weight-semi icon-cursor d-block text-center">KYC status</span>
                    <span class="kyc-status-label font-xsmall weight-bold d-block text-center vfailed"
                      >Verification failed</span
                    >
                  </div>
                </div>
              </NuxtLink>
              <NuxtLink to="/kyc" v-if="false && currentTiers >= 3 && KYCStatus.step == 1">
                <div class="collapse-item fcc-container">
                  <div class="kyc-status">
                    <span class="font-medium weight-semi icon-cursor d-block text-center">KYC status</span>
                    <span class="kyc-status-label font-xsmall weight-bold d-block text-center nverified"
                      >Not verified</span
                    >
                  </div>
                </div>
              </NuxtLink>
              <NuxtLink
                to="/kyc"
                v-if="false && currentTiers >= 3 && KYCStatus.step == 2 && KYCStatus.verification == 1"
              >
                <div class="collapse-item fcc-container">
                  <div class="kyc-status">
                    <span class="font-medium weight-semi icon-cursor d-block text-center">KYC status</span>
                    <span class="kyc-status-label font-xsmall weight-bold d-block text-center progress"
                      >In progress</span
                    >
                  </div>
                </div>
              </NuxtLink>
              <div
                class="nohover collapse-item fcc-container"
                v-if="
                  false &&
                  currentTiers >= 3 &&
                  KYCStatus.verification == 2 &&
                  KYCStatus.step == 3 &&
                  KYCStatus.userVerified == true
                "
              >
                <div class="kyc-status">
                  <span class="font-medium weight-semi icon-cursor d-block text-center">KYC status</span>
                  <span class="kyc-status-label font-xsmall weight-bold d-block text-center verified">Verified</span>
                </div>
              </div>
              <div
                class="collapse-item text-center icon-cursor fcc-container"
                @click="
                  () => {
                    this.showTierInfo = false
                    this.showMenu = false
                  }
                "
              >
                <div class="fcs-container">
                  <NuxtLink to="/dashboard/" class="font-medium weight-semi mx-8"> Dashboard </NuxtLink>
                  <div class="new-label font-xsmall weight-semi">New</div>
                </div>
              </div>
            </div>
          </div>

          <Menu v-model="currentRoute" :mode="'vertical'" :theme="'light'" @click="changeRoute">
            <MenuItem v-for="nav in navs" :key="nav.id" :class="`fcs-container ${nav.id === banURL ? 'disable' : ''}`">
              <div class="menu-icon-group">
                <span class="font-large weight-bold"> {{ nav.title }} </span>
              </div>
              <div v-if="nav.id === banURL" class="soon">Soon</div>
            </MenuItem>
          </Menu>
        </div>
      </div>

      <NuxtLink class="logo-container" to="/" aria-label="cropper logo">
        <img class="logo" src="@/assets/icons/cropper-logo.svg" alt="cropper logo" />
      </NuxtLink>

      <div class="menu">
        <Menu v-model="currentRoute" :mode="'horizontal'" :theme="'light'" @click="changeRoute">
          <MenuItem v-for="nav in navs" :key="nav.id" :class="nav.id === banURL ? 'disable' : ''">
            <div class="menu-icon-group">
              <span class="font-body-medium weight-semi fcc-container"> {{ nav.title }} </span>
            </div>
            <div v-if="nav.title === banURL" class="soon">Soon</div>
          </MenuItem>
        </Menu>
      </div>
    </div>

    <div class="wallet-container d-flex">
      <div v-if="wallet.connected" class="tier-container fcs-container">
        <div
          v-if="windowWidth > 768"
          class="tier-info-icon fcs-container icon-cursor"
          @click="
            () => {
              this.showTierInfo = !this.showTierInfo
            }
          "
        >
          <div class="tier-profile fcc-container">
            <img class="tier-profile-img" :src="require(`@/assets/tier/Tier${wallet.tiers}.png`)" />
            <!-- <div class="new-container"></div> -->
          </div>
          <div class="fcs-container">
            <span class="tier-id font-medium weight-semi spacing-small d-flex"> Profile </span>
            <img
              class="arrow-icon"
              :class="showTierInfo ? 'arrow-up' : 'arrow-down'"
              src="@/assets/icons/arrow-down-white.svg"
            />
          </div>
        </div>

        <div
          v-if="showTierInfo"
          class="tier-info-menu"
          v-click-outside="
            () => {
              this.showTierInfo = false
            }
          "
        >
          <div class="nohover collapse-item">
            <div class="tier-profile-container fcc-container">
              <div class="tier-profile fcc-container">
                <img class="tier-profile-img" :src="require(`@/assets/tier/Tier${wallet.tiers}.png`)" />
              </div>

              <span class="font-medium weight-semi spacing-small d-flex">
                Tier
                <span v-if="tierloaded" class="tier-no">{{ wallet.tiers }}</span>
                <span v-else class="tier-no">&mdash;</span>
              </span>
            </div>
          </div>
          <div v-if="tierloaded" class="nohover collapse-item text-center font-medium weight-semi">
            <div class="tier-progress text-left">
              <div class="tier-progress-label fcsb-container">
                <span class="font-xsmall weight-bold">Tier {{ wallet.tiers }}</span>
                <span v-if="wallet.tiers < 5" class="font-xsmall weight-bold">Tier {{ wallet.tiers + 1 }}</span>
              </div>
              <Progress
                type="line"
                :stroke-width="14"
                :percent="Number(pctToNexttiers.toFixed(1))"
                :show-info="false"
              />
              <div class="tier-progress-info-container">
                <div
                  v-if="Number(pctToNexttiers.toFixed(1)) > 1"
                  class="tier-progress-end"
                  :style="'margin-left: calc(' + Number(pctToNexttiers.toFixed(1)) + '% - 2px)'"
                ></div>
                <label
                  v-if="wallet.tiers < 5"
                  class="tier-progress-percent font-xsmall"
                  :style="
                    Number(pctToNexttiers.toFixed(1)) < 90
                      ? 'margin-left: calc(' + Number(pctToNexttiers.toFixed(1)) + '% - 2px)'
                      : 'margin-left: 90%'
                  "
                >
                  {{ userTier }} sCRP
                </label>
                <label v-else class="staking-progress-percent max-tier font-xsmall"> {{ userTier }} sCRP </label>
              </div>
            </div>
          </div>

          <div class="collapse-item text-center font-medium weight-semi icon-cursor">
            <NuxtLink to="/staking/"> Stake CRP </NuxtLink>
          </div>
          <NuxtLink to="/kyc" v-if="false && currentTiers >= 3 && KYCStatus.step == 2 && KYCStatus.verification == 0"
            ><div class="collapse-item fcc-container">
              <div class="kyc-status">
                <span class="font-medium weight-semi icon-cursor d-block text-center">KYC status</span>
                <span class="kyc-status-label font-xsmall weight-bold d-block text-center vfailed"
                  >Verification failed</span
                >
              </div>
            </div>
          </NuxtLink>
          <NuxtLink to="/kyc" v-if="false && currentTiers >= 3 && KYCStatus.step == 1">
            <div class="collapse-item fcc-container">
              <div class="kyc-status">
                <span class="font-medium weight-semi icon-cursor d-block text-center">KYC status</span>
                <span class="kyc-status-label font-xsmall weight-bold d-block text-center nverified">Not verified</span>
              </div>
            </div>
          </NuxtLink>
          <NuxtLink to="/kyc" v-if="false && currentTiers >= 3 && KYCStatus.step == 2 && KYCStatus.verification == 1">
            <div class="collapse-item fcc-container">
              <div class="kyc-status">
                <span class="font-medium weight-semi icon-cursor d-block text-center">KYC status</span>
                <span class="kyc-status-label font-xsmall weight-bold d-block text-center progress">In progress</span>
              </div>
            </div>
          </NuxtLink>
          <div
            class="nohover collapse-item fcc-container"
            v-if="
              false &&
              currentTiers >= 3 &&
              KYCStatus.verification == 2 &&
              KYCStatus.step == 3 &&
              KYCStatus.userVerified == true
            "
          >
            <div class="kyc-status">
              <span class="font-medium weight-semi icon-cursor d-block text-center">KYC status</span>
              <span class="kyc-status-label font-xsmall weight-bold d-block text-center verified">Verified</span>
            </div>
          </div>
          <div
            class="collapse-item text-center icon-cursor fcc-container"
            @click="
              () => {
                this.showTierInfo = false
              }
            "
          >
            <div class="fcs-container">
              <!-- <div class="new-container"></div> -->
              <NuxtLink to="/dashboard/" class="font-medium weight-semi mx-8"> Dashboard </NuxtLink>
              <div class="new-label font-xsmall weight-semi">New</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="wallet.connected" class="notification-container">
        <div class="icon-cursor" @click="openOrClose()">
          <img class="bell-icon" :src="require(`@/assets/icons/notification${notifalert == 0 ? '-none' : ''}.svg`)" />
        </div>

        <div
          v-if="showNotification"
          class="notification-menu"
          v-click-outside="
            () => {
              this.showNotification = false
            }
          "
        >
          <div class="notification-group" :class="notificationList.length <= 3 ? 'no-scroll' : ''">
            <div v-for="notification in notificationList" :key="notification.id" class="notification-box fs-container">
              <!-- <img
              class="remove-icon icon-cursor"
              src="@/assets/icons/close-circle.svg"
              @click="
                () => {
                  notificationList.splice(idx, 1)
                }
              "
            /> -->
              <div class="notification-icon">
                <span :class="`notification-circle ${notification.alert == 0 ? 'none' : ''}`"></span>
              </div>
              <div class="notification-body">
                <span class="notification-title font-small weight-bold">{{ notification.title }}</span>
                <span class="font-small">{{ notification.content }}</span>
                <NuxtLink v-if="notification.nLink" :to="notification.nLink"><small>See more &gt;</small></NuxtLink>
                <a v-else-if="notification.link" target="_blank" :href="notification.link"
                  ><small>See more &gt;</small></a
                >
              </div>
            </div>

            <div v-if="notificationList.length === 0" class="notification-alarm text-center">
              <span class="font-small weight-bold review-text">No new notification</span>
            </div>
          </div>
        </div>
      </div>

      <div class="wallet-btn">
        <div
          class="btncontainer fcs-container"
          :class="!wallet.connected ? 'unconnected' : 'connected'"
          v-if="!wallet.connected"
          ghost
          @click="openPopIn"
        >
          <Button class="font-body-small weight-bold fcc-container">
            <img src="@/assets/icons/wallet.svg" style="margin-right: 10px" />
            {{ windowWidth >= 768 ? 'Connect wallet' : 'Connect' }}
          </Button>
        </div>

        <div
          class="btncontainer fcs-container"
          :class="!wallet.connected ? 'unconnected' : 'connected'"
          v-else
          ghost
          @click="$accessor.wallet.openModal"
        >
          <Button class="font-body-small weight-bold fcc-container">
            <img src="@/assets/icons/wallet.svg" style="margin-right: 10px" />
            {{ wallet.address.substr(0, 4) }}
            ...
            <!-- {{ wallet.address.substr(wallet.address.length - 4, 4) }} -->
          </Button>
        </div>

        <!-- <a v-if="wallet.connected" :href="this.sonarUrl" target="_blank" class="sonar-container">
          <div class="btncontainer sonar connected fcs-container" ghost>
            <Button class="fcc-container">
              <img src="@/assets/icons/sonar-watch.svg" />
            </Button>
          </div>
          <div class="sonar-dashboard font-small">My dashboard</div>
        </a> -->

        <Modal
          :title="!wallet.connected ? 'Connect to a wallet' : 'Your wallet'"
          :visible="wallet.modalShow && isModal"
          :footer="null"
          :closable="false"
          class="connect-modal"
          centered
          @cancel="$accessor.wallet.closeModal"
        >
          <img class="modal-close" src="@/assets/icons/close-circle.svg" @click="$accessor.wallet.closeModal" />
          <div v-if="!wallet.connected" class="select-wallet">
            <Button
              v-for="(info, name) in wallets"
              :key="name"
              ghost
              @click="connect(name, info)"
              class="select-wallet-btn w-100 text-left fcsb-container"
            >
              <img :src="importIcon(`/wallets/${name.replace(' ', '-').toLowerCase()}.png`)" />
              <span>{{ name }}</span>
            </Button>
          </div>
          <div v-else class="wallet-info">
            <p class="address font-medium">{{ wallet.address }}</p>
            <Button class="btn-gradient font-large weight-bold" @click="disconnect"> Disconnect </Button>
          </div>
        </Modal>
      </div>

      <div v-if="!wallet.connected && popIn" class="wallet-list" v-click-outside="outPopIn">
        <div class="select-wallet-header fcsb-container">
          <span class="font-large weight-bold">Connect wallet</span>
          <img class="close-icon icon-cursor" src="@/assets/icons/close-circle.svg" @click="closePopIn" />
        </div>

        <div v-if="!wallet.connected" class="select-wallet">
          <Button
            v-for="(info, name) in wallets"
            :key="name"
            class="select-wallet-btn w-100 text-left fcs-container"
            @click="connect(name, info)"
          >
            <img :src="importIcon(`/wallets/${name.replace(' ', '-').toLowerCase()}.png`)" />
            <span>{{ name }}</span>
          </Button>
        </div>
        <div v-else class="wallet-info">
          <p class="address font-medium">{{ wallet.address }}</p>
          <Button class="btn-gradient font-large weight-bold" @click="disconnect"> Disconnect </Button>
        </div>
      </div>
    </div>
  </Header>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator'
import { Layout, Menu, Button, Modal, Icon, Progress, Switch as Toggle } from 'ant-design-vue'
import {
  AccountInfo,
  Context
  // PublicKey
} from '@solana/web3.js'
import importIcon from '@/utils/import-icon'
import logger from '@/utils/logger'
import { commitment } from '@/utils/web3'
import LocalStorage from '@/utils/local-storage'
import type { WalletAdapter } from '@solana/wallet-adapter-base'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolongWalletAdapter } from '@solana/wallet-adapter-solong'
import { BraveWalletAdapter } from '@solana/wallet-adapter-brave'
import { MathWalletWalletAdapter } from '@solana/wallet-adapter-mathwallet'
import { SolletWalletAdapter } from '@solana/wallet-adapter-sollet'
import { LedgerWalletAdapter, getDerivationPath } from '@solana/wallet-adapter-ledger'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { Coin98WalletAdapter } from '@solana/wallet-adapter-coin98'
import { SlopeWalletAdapter } from '@solana/wallet-adapter-slope'
import { getUnixTs } from '@/utils'
import { SafePalWalletAdapter } from '@solana/wallet-adapter-safepal'
//import { BloctoWalletAdapter } from '@solana/wallet-adapter-blocto'
//import { BitpieWalletAdapter } from '@solana/wallet-adapter-bitpie'
import {
  // getLedgerWallet,
  // getPhantomWallet,
  // getSlopeWallet,
  // getSolflareWallet,
  getSolletExtensionWallet
  // getSolletWallet,
  // getTorusWallet,
} from '@solana/wallet-adapter-wallets'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
// import { TorusWalletAdapter } from '@solana/wallet-adapter-torus'
import { TokenAmount } from '@/utils/safe-math'
import { TOKENS } from '@/utils/tokens'
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
  calculateTiers,
  TIERS_XCRP,
  stake,
  unstake,
  harvest
} from '@/utils/crp-stake'
const Vco = require('v-click-outside')
const network = WalletAdapterNetwork.Devnet
declare const window: any
const { Header } = Layout
const MenuItem = Menu.Item

// fix: Failed to resolve directive: ant-portal
Vue.use(Modal)
Vue.use(Vco)

interface WalletInfo {
  // official website
  website: string
  // provider url for web wallet
  providerUrl?: string
  // chrome extension install url
  chromeUrl?: string
  // firefox extension install url
  firefoxUrl?: string
  // isExtension: boolean
  getAdapter: (providerUrl?: string) => WalletAdapter
}

@Component({
  components: {
    Header,
    Menu,
    MenuItem,
    Button,
    Modal,
    Icon,
    Progress,
    Toggle
  }
})
export default class Head extends Vue {
  /* ========== DATA ========== */
  // TrustWallet ezDeFi
  wallets: { [key: string]: WalletInfo } = {
    Phantom: {
      website: 'https://phantom.app',
      chromeUrl: 'https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa',
      getAdapter() {
        return new PhantomWalletAdapter()
      }
    },
    Brave: {
      website: 'https://brave.com/fr/wallet/',
      getAdapter() {
        return new BraveWalletAdapter()
      }
    },
    'Solflare Extension': {
      website: 'https://solflare.com',
      firefoxUrl: 'https://addons.mozilla.org/en-US/firefox/addon/solflare-wallet',
      getAdapter() {
        return new SolflareWalletAdapter()
      }
    },
    'Sollet Web': {
      website: 'https://www.sollet.io',
      providerUrl: 'https://www.sollet.io',
      getAdapter(providerUrl) {
        return new SolletWalletAdapter({ provider: providerUrl })
      }
    },
    'Sollet Extension': {
      website: '',
      chromeUrl: 'https://chrome.google.com/webstore/detail/sollet/fhmfendgdocmcbmfikdcogofphimnkno',
      getAdapter() {
        return getSolletExtensionWallet().adapter()
      }
    },
    Ledger: {
      website: 'https://www.ledger.com',
      getAdapter() {
        return new LedgerWalletAdapter({ derivationPath: getDerivationPath() })
      }
    },
    MathWallet: {
      website: 'https://mathwallet.org',
      chromeUrl: 'https://chrome.google.com/webstore/detail/math-wallet/afbcbjpbpfadlkmhmclhkeeodmamcflc',
      getAdapter() {
        return new MathWalletWalletAdapter()
      }
    },
    Solong: {
      website: 'https://solongwallet.com',
      chromeUrl: 'https://chrome.google.com/webstore/detail/solong/memijejgibaodndkimcclfapfladdchj',
      getAdapter() {
        return new SolongWalletAdapter()
      }
    },
    Coin98: {
      website: 'https://www.coin98.com',
      chromeUrl: 'https://chrome.google.com/webstore/detail/coin98-wallet/aeachknmefphepccionboohckonoeemg',
      getAdapter() {
        return new Coin98WalletAdapter()
      }
    },
    /* Blocto: {
      website: 'https://blocto.portto.io',
      getAdapter() {
        return new BloctoWalletAdapter()
      }
    }, */
    Safepal: {
      website: 'https://safepal.io',
      getAdapter() {
        return new SafePalWalletAdapter()
      }
    },
    Slope: {
      website: 'https://slope.finance',
      chromeUrl: 'https://chrome.google.com/webstore/detail/slope-finance-wallet/pocmplpaccanhmnllbbkpgfliimjljgo',

      //@ts-ignore
      getAdapter() {
        return new SlopeWalletAdapter()
      }
    },
    /*
    Bitpie: {
      website: 'https://bitpie.com',
      getAdapter() {
        return new BitpieWalletAdapter()
      }
    },
    */
    // Torus: {
    //   website: 'https://tor.us',
    //   getAdapter() {
    //     return new TorusWalletAdapter({
    //       options: {
    //         clientId: ''
    //       }
    //     })
    //   }
    // },
    'Solflare Web': {
      website: 'https://solflare.com',
      providerUrl: 'https://solflare.com/access-wallet',
      getAdapter(providerUrl) {
        return new SolletWalletAdapter({ provider: providerUrl })
      }
    }
  }

  connectingWallet = {
    name: null as string | null,
    adapter: null as WalletAdapter | null
  }

  // autoConnect
  lastWalletName = LocalStorage.get('WALLET_NAME')

  sonarUrl: any = ''

  tg: any = {
    active: 0,
    link: '',
    secret: ''
  }

  KYCStatus: any = {
    step: 1 as number,
    verification: 0 as number,
    userVerified: false as boolean,
    sessionID: '' as string
  }

  // auto refresh
  walletTimer: number | undefined = undefined
  notificationTimer: number | undefined = undefined
  priceTimer: number | undefined = undefined
  liquidityTimer: number | undefined = undefined
  farmTimer: number | undefined = undefined
  idoTimer: number | undefined = undefined
  crpbalance: any = undefined
  // web3 listener
  tierloaded: boolean = false
  walletListenerId = null as number | null

  debugCount = 0

  // menu
  popIn = false as boolean
  isModal = true as boolean
  showNotification = false as boolean
  showTierInfo = false as boolean
  showTierMenu = false as boolean

  // tier
  userStaked = 0 as number
  pctToNexttiers = 0 as number
  userTier = 0 as number
  currentTiers = 0 as number
  nextTiers = 1 as number

  // notification

  lastSeen = 0
  notificationList = [] as any[]
  notifalert = 0

  telegramID = '' as string

  // window
  windowWidth = window.innerWidth as any

  isScrolling = false as boolean
  navs = [
    {
      id: 'launchpad',
      title: 'launchpad'
    },
    {
      id: 'nfts',
      title: 'NFTs'
    },
    {
      id: 'staking',
      title: 'Staking'
    },
    {
      id: 'swap',
      title: 'Swap'
    },
    {
      id: 'farms',
      title: 'Farms'
    },
    {
      id: 'pools',
      title: 'Pools'
    }
  ] as any[]
  banURL = '' as string
  showMenu = false as boolean

  /* ========== COMPUTED ========== */
  get price() {
    return this.$accessor.price
  }

  get liquidity() {
    return this.$accessor.liquidity
  }

  get farm() {
    return this.$accessor.farm
  }

  get ido() {
    return this.$accessor.ido
  }

  // history
  get historyList() {
    const rawList = Object.entries(this.$accessor.transaction.history[this.$accessor.wallet.address] ?? {}).map(
      ([txid, txInfo]) => ({
        ...(txInfo as any),
        txid
      })
    )
    return rawList.sort((a, b) => {
      return (b.time || b.t) - (a.time || a.t)
    })
  }

  get isMobile() {
    return this.$accessor.isMobile
  }

  get url() {
    return this.$accessor.url
  }

  get currentRoute() {
    return [this.$accessor.route.name]
  }

  set currentRoute(route) {}

  get wallet() {
    return this.$accessor.wallet
  }

  /* ========== METHODS ========== */
  changeRoute({ key }: { key: string }): void {
    const { from, to, ammId } = this.$route.query
    if (key != this.banURL) {
      if (['swap', 'liquidity'].includes(key) && (ammId || (from && to))) {
        // if (ammId) {
        //   this.$router.push({
        //     path: `/${key}/`,
        //     query: {
        //       ammId
        //     }
        //   })
        // } else
        if (from && to) {
          this.$router.push({
            path: `/${key}/`,
            query: {
              from,
              to
            }
          })
        } else {
          this.$router.push({ path: `/${key}/` })
        }
      } else if (!(this as any).navs[key]) {
        this.$router.push({ path: `/${key}/` })
      }
    } else {
      console.log(this.banURL + 'will be soon!')
    }
    this.showMenu = false
  }

  updateScroll() {
    this.isScrolling = true
    if (window.scrollY === 0) {
      this.isScrolling = false
    }
  }

  /* ========== METHODS ========== */
  importIcon = importIcon

  autoConnect() {
    const name = this.lastWalletName
    if (name && !this.$accessor.wallet.connected) {
      const info = this.wallets[name]
      if (info) {
        this.connect(name, info)
      }
    }
  }

  async getTiersInfo() {
    setAnchorProvider(this.$web3, this.$wallet)

    if (!this.$accessor.token.initialized || !this.$wallet?.connected) {
      return
    }

    this.getNotifs()

    let responseData
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
          localStorage['CYK' + this.wallet.address + 'set'] = 1
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

            responseData = await fetch('https://flow.cropper.finance/kyc/' + this.wallet.address + '/').then((res) =>
              res.json()
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

    let crpbalanceDatas = this.wallet.tokenAccounts[TOKENS['CRP'].mintAddress]

    if (crpbalanceDatas) {
      this.crpbalance = crpbalanceDatas.balance.fixed() * 1
    }

    let tiers_info = {
      tiers: 0,
      xCRP: 0
    }

    try {
      const farm_state = await getFarmState()
      const extraRewardConfigs = await getExtraRewardConfigs()

      const pools = await getAllPools()
      const current_pool = pools[0]
      const userAccount = await getPoolUserAccount(this.$wallet, current_pool.publicKey)

      //@ts-ignore
      this.userStaked = Number(new TokenAmount(userAccount.amount, TOKENS['CRP'].decimals).fixed(3))

      //@ts-ignore
      tiers_info = calculateTiers(this.userStaked, userAccount.lockDuration.toNumber(), this.$accessor.wallet)
      console.log('tiers_info=', tiers_info)
    } catch {}

    this.$accessor.wallet.setStakingTiers(tiers_info)

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
    this.tierloaded = true
  }

  onConnect() {
    const { name, adapter } = this.connectingWallet

    this.$accessor.wallet.closeModal().then(() => {
      if (adapter && adapter.publicKey) {
        // mock wallet
        // const address = new PublicKey('')
        // Vue.prototype.$wallet = {
        //   connected: true,
        //   publicKey: address,
        //   signTransaction: (transaction: any) => {
        //     console.log(transaction)
        //   }
        // }
        // this.$accessor.wallet.setConnected(address.toBase58())

        Vue.prototype.$wallet = adapter
        this.$accessor.wallet.setConnected(adapter.publicKey.toBase58())

        this.subWallet()
        this.$notify.success({
          message: 'Wallet connected',
          description: `Connected with ${name}`
          // icon: (h: any) => {
          //   return h(
          //     'anticon',
          //     {
          //       props: {
          //         type: 'info-circle',
          //         theme: 'filled'
          //       },
          //     },
          //   );
          // },
        })

        LocalStorage.set('WALLET_NAME', name)
      }
    })

    this.setNotificationTimer()

    this.isModal = true
  }

  onDisconnect() {
    this.disconnect()
  }

  disconnect() {
    this.connectingWallet = {
      name: null,
      adapter: null
    }

    try {
      Vue.prototype.$wallet.disconnect()
    } catch (error) {}

    Vue.prototype.$wallet = null

    this.unsubWallet()

    this.$accessor.wallet.setDisconnected()
    this.$notify.warning({
      message: 'Wallet disconnected',
      description: ''
    })
  }

  onWalletError(error: Error) {
    const { name } = this.connectingWallet

    if (name) {
      const info = this.wallets[name]

      if (info) {
        const { website, chromeUrl, firefoxUrl } = info

        if (['WalletNotFoundError', 'WalletNotInstalledError', 'WalletNotReadyError'].includes(error.name)) {
          const errorName = error.name
            .replace('Error', '')
            .split(/(?=[A-Z])/g)
            .join(' ')

          this.$notify.error({
            message: errorName,
            description: (h: any) => {
              const msg = [
                `Please install and initialize ${name} wallet extension first, `,
                h('a', { attrs: { href: website, target: '_blank' } }, 'click here to visit official website')
              ]

              if (chromeUrl || firefoxUrl) {
                const installUrl = /Firefox/.test(navigator.userAgent) ? firefoxUrl : chromeUrl
                if (installUrl) {
                  msg.push(' or ')
                  msg.push(h('a', { attrs: { href: installUrl, target: '_blank' } }, 'click here to install extension'))
                }
              }

              return h('div', msg)
            }
          })

          return
        }
      }
    }

    if (['SecurityError'].includes(error.name)) {
      this.onConnect()
      return
    }

    this.$notify.error({
      message: 'Connect wallet failed',
      description: `${error.name}`
    })
  }

  connect(name: string, wallet: WalletInfo) {
    const { providerUrl } = wallet

    const adapter = wallet.getAdapter(providerUrl)

    if (adapter) {
      // adapter.on('ready', onReady)
      adapter.on('connect', this.onConnect)
      adapter.on('disconnect', this.onDisconnect)
      adapter.on('error', this.onWalletError)

      this.connectingWallet = {
        name,
        adapter
      }

      adapter.connect()

      return () => {
        // adapter.off('ready', onReady)
        adapter.off('connect', this.onConnect)
        adapter.off('disconnect', this.onDisconnect)
        adapter.off('error', this.onWalletError)
      }
    }

    this.setNotificationTimer()
  }

  onWalletChange(_accountInfo: AccountInfo<Buffer>, context: Context): void {
    logger('onAccountChange')

    const { slot } = context

    if (slot !== this.wallet.lastSubBlock) {
      this.$accessor.wallet.setLastSubBlock(slot)
      this.$accessor.wallet.getTokenAccounts()
      this.$accessor.farm.getStakeAccounts()
      this.$accessor.ido.requestInfos()
      this.getTiersInfo()
    }
  }

  subWallet() {
    const wallet = this.$wallet
    if (wallet && wallet.publicKey) {
      this.walletListenerId = this.$web3.onAccountChange(wallet.publicKey, this.onWalletChange, commitment)

      this.$accessor.wallet.getTokenAccounts()
      this.$accessor.farm.getStakeAccounts()
      this.$accessor.ido.requestInfos()
    }
  }

  unsubWallet() {
    if (this.walletListenerId) {
      this.$web3.removeAccountChangeListener(this.walletListenerId)
    }
  }

  debug() {
    if (this.debugCount < 10) {
      this.debugCount += 1
    } else {
      this.$router.push({ path: '/debug/' })
      this.debugCount = 0
    }
  }

  setWalletTimer() {
    this.walletTimer = window.setInterval(async () => {
      if (this.wallet.connected && !this.wallet.loading) {
        // vuex is connected but $wallet not, meaning window closed
        if (this.$wallet && this.$wallet.connected) {
          if (this.wallet.countdown < this.wallet.autoRefreshTime) {
            this.$accessor.wallet.setCountdown(this.$accessor.wallet.countdown + 1)
            if (this.wallet.countdown === this.wallet.autoRefreshTime) {
              await this.$accessor.wallet.getTokenAccounts()
            }
          }
        } else {
          this.disconnect()
        }
      }
      if (!this.tierloaded) {
        await this.getTiersInfo()
      }
      this.sonarUrl = 'https://sonar.watch/dashboard/' + this.wallet.address
    }, 1000)
  }

  setNotificationTimer() {
    this.getNotifs()
    this.notificationTimer = window.setInterval(async () => {
      if (this.wallet.connected && !this.wallet.loading) {
        if (this.$wallet && this.$wallet.connected) {
          this.getNotifs()
        }
      }
    }, 60000)
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

    if (this.$wallet?.connected) {
      try {
        responseData = await fetch('https://flow.cropper.finance/notif/' + this.wallet.address + '/').then((res) =>
          res.json()
        )
      } catch {
      } finally {
        for (let i in responseData) {
          responseData[i].ts_start = Date.parse(responseData[i].date) / 1000
          responseData[i].title = responseData[i].category
          responseData[i].content = responseData[i].message

          responseData[i].alert = 0
          if (localStorage.notifSeen1 == undefined || responseData[i].ts_start > localStorage.notifSeen1) {
            responseData[i].alert = 1
            alertneeded = 1
          }

          tmpnotificationList.push(responseData[i])
        }
      }
    }

    tmpnotificationList.sort(function (a, b) {
      return b.ts_start - a.ts_start
    })

    this.notifalert = alertneeded
    this.notificationList = tmpnotificationList
  }

  openOrClose() {
    this.showNotification = !this.showNotification
    this.lastSeen = Number(localStorage.notifSeen1)
    localStorage.notifSeen1 = getUnixTs() / 1000
    this.notifalert = 0
  }

  setPriceTimer() {
    this.priceTimer = window.setInterval(async () => {
      if (!this.price.loading) {
        if (this.price.countdown < this.price.autoRefreshTime) {
          this.$accessor.price.setCountdown(this.$accessor.price.countdown + 1)
          if (this.price.countdown === this.price.autoRefreshTime) {
            await this.$accessor.price.requestPrices()
          }
        }
      }
    }, 1000)
  }

  setLiquidityTimer() {
    this.liquidityTimer = window.setInterval(async () => {
      if (!this.liquidity.loading) {
        if (this.liquidity.countdown < this.liquidity.autoRefreshTime) {
          this.$accessor.liquidity.setCountdown(this.$accessor.liquidity.countdown + 1)
          if (this.liquidity.countdown === this.liquidity.autoRefreshTime) {
            await this.$accessor.liquidity.requestInfos()
          }
        }
      }
    }, 1000)
  }

  setFarmTimer() {
    this.farmTimer = window.setInterval(async () => {
      if (!this.farm.loading) {
        if (this.farm.countdown < this.farm.autoRefreshTime) {
          this.$accessor.farm.setCountdown(this.$accessor.farm.countdown + 1)
          if (this.farm.countdown === this.farm.autoRefreshTime) {
            await this.$accessor.farm.requestInfos()
          }
        }
      }
    }, 1000)
  }

  setIdoTimer() {
    this.idoTimer = window.setInterval(async () => {
      if (!this.ido.loading) {
        if (this.ido.countdown < this.ido.autoRefreshTime) {
          this.$accessor.ido.setCountdown(this.$accessor.ido.countdown + 1)
          if (this.ido.countdown === this.ido.autoRefreshTime) {
            await this.$accessor.ido.requestInfos()
          }
        }
      }
    }, 1000)
  }

  openPopIn() {
    this.popIn = true
  }

  closePopIn() {
    this.popIn = false
  }

  outPopIn() {
    this.popIn = false
  }

  onResize() {
    this.windowWidth = window.innerWidth
  }

  /* ========== LIFECYCLE ========== */
  async beforeMount() {
    await this.$accessor.token.loadTokens()
    await this.$accessor.price.requestPrices()
    await this.$accessor.liquidity.requestInfos()
    await this.$accessor.swap.getMarkets()
    await this.$accessor.farm.requestInfos()
    await this.$accessor.wallet.getNftStakingState()

    this.setWalletTimer()
    this.setNotificationTimer()
    this.setPriceTimer()
    this.setLiquidityTimer()
    this.setFarmTimer()
    this.setIdoTimer()
  }

  mounted() {
    this.autoConnect()
    this.getTiersInfo()

    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize)
      window.addEventListener('scroll', this.updateScroll)
    })

    const isBraveWallet = window.braveSolana.isBraveWallet
    console.log('Brave Wallet: ', isBraveWallet)
  }

  beforeDestroy() {
    window.clearInterval(this.walletTimer)
    window.clearInterval(this.notificationTimer)
    window.clearInterval(this.priceTimer)
    window.clearInterval(this.liquidityTimer)
    window.clearInterval(this.farmTimer)
    window.clearInterval(this.idoTimer)
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('scroll', this.updateScroll)
  }

  /* ========== WATCH ========== */
  @Watch('wallet.connected', { immediate: true, deep: true }) handler(connected: any) {
    this.getTiersInfo()
  }

  @Watch('wallet.potionNFTs', { immediate: true, deep: true }) handlerpotionNFTs(connected: any) {
    this.getTiersInfo()
  }
}
</script>

<style lang="less" scoped>
.header {
  // global stylesheet
  a {
    color: #fff !important;
  }

  .bell-icon {
    margin-bottom: 1px;
  }

  .remove-icon {
    width: 12px;
    height: 12px;
  }

  .status-icon {
    width: 16px;
    height: 16px;
    margin-left: 8px;
  }

  .close-icon {
    width: 32px;
    height: 32px;
  }

  .kyc-status {
    .kyc-status-label {
      padding: 4px 8px;
      border-radius: 6px;

      &.vfailed,
      &.nverified {
        background: @color-red600;
      }

      &.progress {
        background: @color-yellow600;
      }

      &.verified {
        background: @color-petrol500;
      }
    }
  }

  .arrow-icon {
    transition: all 0.3s;
    margin-left: 4px;

    &.arrow-up {
      transform: rotate(180deg);
    }
  }

  .new-container {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: @color-red500;
  }

  .new-label {
    border-radius: 6px;
    padding: 2px 6px;
    width: fit-content;
    font-size: 10px;
    line-height: 12px;
    border: 2px solid @color-new;
    color: @color-new;
  }

  // class stylesheet
  .nav-container {
    .menu {
      position: relative;
      margin-left: 28px;

      .menu-icon-group {
        display: inline-flex;
        align-items: center;
      }

      &.collapse {
        display: none;

        @media @max-md-tablet {
          display: block;
          margin-right: 18px;
          margin-left: 0;

          .collapse-menu {
            position: absolute;
            top: 70px;
            left: -20px;
            width: 275px;
            height: calc(100vh - 70px);
            background: @color-blue800;
            overflow-y: scroll;

            &::-webkit-scrollbar {
              display: none;
            }

            .tier-container {
              .tier-info-icon {
                padding: 24px 16px;
                border-bottom: 1px solid #c4c4c420;

                &.active {
                  background: @color-blue700;
                }

                .tier-profile {
                  position: relative;
                  background: @gradient-color03;
                  padding: 3px;
                  height: 45px;
                  width: 45px;
                  border-radius: 50%;
                  margin-right: 4px;

                  .tier-profile-img {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                  }
                }
              }

              .tier-info-menu {
                background: @color-blue700;
                background-origin: border-box;

                .collapse-item {
                  padding: 24px 16px;
                  border-bottom: 1px solid #c4c4c420;

                  &:not(.nohover):hover {
                    background: @color-blue600;
                  }

                  .tier-progress {
                    position: relative;

                    .tier-progress-label {
                      margin-bottom: 4px;
                    }

                    .tier-progress-info-container {
                      position: relative;
                      padding: 0 4px;

                      .tier-progress-end {
                        width: 2px;
                        height: 14px;
                        background: @color-petrol500;
                        box-shadow: 0 2px 3px rgba(0, 0, 0, 0.55);
                        margin: -20px 0 4px 0;
                      }

                      .tier-progress-percent {
                        white-space: nowrap;

                        &.max-tier {
                          display: block;
                          text-align: right;
                          padding-top: 4px;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        .menu-icon {
          width: 18px;
          height: 18px;
        }
      }
    }

    .logo-container {
      .logo {
        height: 47px;

        @media @max-md-tablet {
          height: 36px;
        }
      }
    }
  }

  .wallet-container {
    .notification-container {
      margin-right: 18px;
      position: relative;

      @media @max-sl-mobile {
        margin-right: 8px;
      }

      .notification-menu {
        position: absolute;
        top: 58px;
        right: -16px;
        background: #26639f;
        background-origin: border-box;
        border: 2px solid rgba(255, 255, 255, 0.14);
        box-shadow: 18px 11px 14px rgba(0, 0, 0, 0.25);
        border-radius: 8px;
        padding-top: 6px;
        min-width: 264px;
        z-index: 999;
        overflow: hidden;
        mask-image: -webkit-radial-gradient(white, black);
        -webkit-mask-image: -webkit-radial-gradient(white, black);

        @media @max-sl-mobile {
          right: -111px;
        }

        // &::before {
        //   content: '';
        //   display: block;
        //   width: 0;
        //   height: 0;
        //   border-top: 10px solid #26639f;
        //   border-bottom: 25px solid transparent;
        //   border-right: 25px solid transparent;
        //   border-left: 25px solid transparent;
        //   position: absolute;
        //   top: -35px;
        //   right: 28px;
        //   transform: rotate(180deg);
        // }

        .notification-group {
          height: 345px;
          overflow-y: scroll;

          &.no-scroll {
            &::-webkit-scrollbar {
              display: none;
            }
          }

          .notification-box {
            position: relative;
            padding: 8px;
            border-bottom: 1px solid #c4c4c420;
            min-height: 115px;

            .remove-icon {
              position: absolute;
              top: 8px;
              right: 8px;
            }

            .notification-icon {
              padding: 4px;
              margin-right: 8px;

              .notification-circle {
                display: block;
                background: @color-red500;
                width: 10px;
                height: 10px;
                border-radius: 50%;
              }

              .notification-circle.none {
                opacity: 0.1;
              }
            }

            .notification-body {
              span {
                display: block;
              }

              .notification-title {
                padding-right: 16px;
              }
            }
          }

          .notification-alarm {
            position: relative;
            padding: 8px;
            border-bottom: 1px solid #c4c4c420;

            .review-text {
              display: block;
            }
          }
        }

        .notification-telegram {
          position: relative;
          background: #1a446d;
          padding: 8px 8px 14px 8px;
          border-top: 1px solid #c4c4c420;

          .toggle-telegram {
            margin-left: 24px;
          }

          .label-telegram-status {
            display: block;
            margin-top: 8px;

            &.active {
              color: @color-green500;
            }
          }

          .btn-gradient {
            margin: 16px 0;
          }
        }
      }
    }

    .tier-container {
      position: relative;
      margin-right: 8px;

      @media @max-sl-mobile {
        margin-right: 0;
      }

      .tier-info-icon {
        .tier-profile {
          position: relative;
          background: @gradient-color03;
          padding: 3px;
          height: 32px;
          width: 32px;
          border-radius: 50%;
          margin-right: 4px;

          .tier-profile-img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
          }
        }

        .tier-id {
          color: @color-blue100;
        }

        .new-container {
          position: absolute;
          top: 0;
          right: 0;
        }
      }

      .tier-info-menu {
        position: absolute;
        top: 58px;
        right: -16px;
        background: @gradient-color-primary;
        background-origin: border-box;
        border: 2px solid rgba(255, 255, 255, 0.14);
        box-shadow: 18px 11px 14px rgba(0, 0, 0, 0.25);
        border-radius: 8px;
        min-width: 188px;
        z-index: 999;

        .collapse-item {
          padding: 8px 16px;
          border-bottom: 1px solid #c4c4c420;

          &:first-child {
            border-radius: 8px 8px 0 0;
          }

          &:last-child {
            border-radius: 0 0 8px 8px;
            border-bottom: 0;
          }

          &:not(.nohover):hover {
            background: @color-blue600;
          }

          .tier-profile-container {
            .tier-profile {
              background: @gradient-color03;
              padding: 3px;
              height: 32px;
              width: 32px;
              border-radius: 50%;
              margin-right: 8px;

              .tier-profile-img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
              }
            }
          }

          .tier-progress {
            position: relative;

            .tier-progress-label {
              margin-bottom: 4px;
            }

            .tier-progress-info-container {
              position: relative;
              padding: 0 4px;

              .tier-progress-end {
                width: 2px;
                height: 14px;
                background: @color-petrol500;
                box-shadow: 0 2px 3px rgba(0, 0, 0, 0.55);
                margin: -20px 0 4px 0;
              }

              .tier-progress-percent {
                white-space: nowrap;

                &.max-tier {
                  display: block;
                  text-align: right;
                  padding-top: 4px;
                }
              }
            }
          }
        }
      }
    }

    .wallet-list {
      position: absolute;
      right: 64px;
      margin-top: 70px;
      z-index: 999;
      background: @color-blue700;
      border: 3px solid @color-blue500;
      box-shadow: 0 40px 70px rgba(0, 0, 0, 0.3);
      border-radius: 18px;
      padding: 18px;
      width: 283px;

      @media @max-lg-tablet {
        right: 32px;
      }

      @media @max-sl-mobile {
        right: 20px;
      }

      .select-wallet {
        max-height: 460px;
        overflow-y: scroll;
        padding: 0 6px;

        @media @max-lg-tablet {
          max-height: 378px;
        }

        .select-wallet-btn {
          border: none;
          background: transparent;
          border-radius: 16px;
          padding: 8px 16px;
          height: 45px;
          margin-bottom: 18px;

          img {
            height: 30px;
            width: 30px;
            border-radius: 50%;
            margin-right: 18px;
          }

          &:hover {
            background: @color-blue500;
          }
        }
      }

      .select-wallet::-webkit-scrollbar {
        display: block !important; /* Chrome Safari */
      }

      .select-wallet-header {
        padding: 18px 0;
      }

      .wallet-info {
        text-align: center;
      }

      .wallet-info .address {
        border-radius: 7px;
        padding-top: 15px;
        padding-bottom: 15px;
        font-size: 17px;
      }
    }

    .wallet-btn {
      display: inline-flex;
      align-items: center;

      .btncontainer {
        background: @gradient-color04;
        background-origin: border-box;
        text-align: center;
        position: relative;
        margin: auto;
        padding: 3px;
        border-radius: 48px;
        height: 45px;

        button {
          position: relative;
          background: @color-blue800;
          border-radius: 48px;
          border: none;
          height: 100%;
          width: 100%;
          color: white !important;
          padding: 0 10px;
        }

        @media @max-md-tablet {
          height: 32px;
        }
      }

      // .sonar-container {
      //   .sonar-dashboard {
      //     position: absolute;
      //     background: rgba(255, 255, 255, 0.3);
      //     border: 1px solid #fff;
      //     border-radius: 6px;
      //     padding: 5px 10px;
      //     color: #fff;
      //     right: 32px;
      //     margin-top: 10px;
      //     display: none;
      //   }

      //   .btncontainer.sonar {
      //     margin-left: 20px !important;
      //     width: 50px;
      //     height: 50px;

      //     @media @max-lg-tablet {
      //       margin-left: 10px !important;
      //       width: 46px;
      //       height: 46px;
      //     }

      //     &:hover ~ .sonar-dashboard {
      //       display: block;
      //     }

      //     button {
      //       img {
      //         height: 26px;
      //       }
      //     }
      //   }

      //   @media @max-lg-tablet {
      //     display: none;
      //   }
      // }
    }
  }
}
</style>
<style lang="less">
.header {
  .nav-container {
    .menu {
      .ant-menu {
        text-transform: capitalize;
        background: transparent;

        .ant-menu-item {
          .soon {
            display: none;
            width: fit-content;
            margin: auto;
            padding: 5px 8px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: #fff;
            border-radius: 6px;
            font-size: 14px;
            line-height: 17px;
            background: rgba(255, 255, 255, 0.3);
          }

          &.disable {
            &:hover,
            &:active {
              color: unset !important;
            }

            &:hover .menu-icon-group {
              opacity: 0.5;
            }

            &:hover .soon {
              display: block;
            }
          }
        }
      }

      .ant-menu-horizontal {
        line-height: 60px;
        border: none;

        @media @max-md-tablet {
          display: none;
        }

        .ant-menu-item {
          border: none;
          height: 60px;

          @media @max-lg-tablet {
            padding: 0 12px;
          }

          &.ant-menu-item-selected .menu-icon-group span {
            font-weight: 700 !important;
          }
        }
      }

      .ant-menu-vertical {
        border-right: none;

        .ant-menu-item {
          padding: 24px 16px;
          height: auto;
          border-bottom: 1px solid #c4c4c420;
          margin: 0;
          color: #fff;

          &.ant-menu-item-selected {
            background: transparent;
          }
        }
      }

      .ant-menu-horizontal > .ant-menu-item:hover,
      .ant-menu-horizontal > .ant-menu-submenu:hover,
      .ant-menu-horizontal > .ant-menu-item-active,
      .ant-menu-horizontal > .ant-menu-submenu-active,
      .ant-menu-horizontal > .ant-menu-item-open,
      .ant-menu-horizontal > .ant-menu-submenu-open,
      .ant-menu-horizontal > .ant-menu-item-selected,
      .ant-menu-horizontal > .ant-menu-submenu-selected {
        border: none;
      }
    }
  }

  .wallet-container {
    // ant progress
    .ant-progress {
      width: 196px;
    }

    .ant-switch {
      background-color: @color-neutral800 !important;

      &.ant-switch-checked {
        background-color: #fff !important;
      }
    }
  }
}

.connect-modal {
  .ant-modal-body {
    text-align: center;

    .select-wallet {
      .select-wallet-btn {
        border: none;
        background: rgba(255, 255, 255, 0.1) !important;
        border-radius: 14px;
        padding: 0 30px;
        height: 48px;
        margin-bottom: 10px;

        img {
          height: 32px;
          width: 32px;
          border-radius: 50%;
        }
      }
    }

    .wallet-info {
      margin-top: 32px;

      .btn-gradient {
        background: @gradient-color01;
        box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
        border-radius: 38px;
        padding: 10px 18px;
        margin: 18px 0;
        height: auto;
        border: none;

        &:hover {
          background: @gradient-color02;
          color: #fff;
        }
      }
    }
  }
}
</style>