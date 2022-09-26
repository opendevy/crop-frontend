<template>
  <Footer>
    <div class="footer-body">
      <div class="logo">
        <a href="/" aria-label="cropper logo"><img src="@/assets/icons/cropper-logo.svg" alt="cropper logo" /></a>
      </div>
      <div class="icon_list noMobile">
        <a class="social-medium" :href="linkUrl.medium" target="_blank" aria-label="social medium icon">
          <img class="social-icon" src="@/assets/icons/medium-blue.svg" alt="social medium blue icon" />
          <img class="social-icon" src="@/assets/icons/medium-gradient.svg" alt="social medium gradient icon" />
        </a>
        <a class="social-discord" :href="linkUrl.discord" target="_blank" aria-label="social discord icon">
          <img class="social-icon" src="@/assets/icons/discord-blue.svg" alt="social discord blue icon" />
          <img class="social-icon" src="@/assets/icons/discord-gradient.svg" alt="social discord gradient icon" />
        </a>
        <a class="social-twitter" :href="linkUrl.twitter" target="_blank" aria-label="social twitter icon">
          <img class="social-icon" src="@/assets/icons/twitter-blue.svg" alt="social twitter blue icon" />
          <img class="social-icon" src="@/assets/icons/twitter-gradient.svg" alt="social twitter gradient icon" />
        </a>
        <a class="social-telegram" :href="linkUrl.telegram" target="_blank" aria-label="social telegram icon">
          <img class="social-icon" src="@/assets/icons/telegram-blue.svg" alt="social telegram blue icon" />
          <img class="social-icon" src="@/assets/icons/telegram-gradient.svg" alt="social telegram gradient icon" />
        </a>
      </div>
    </div>
    <div class="footer-line"></div>
    <div class="footer-refer">
      <label class="font-small decentralized">Decentralized 2022</label>
    </div>
  </Footer>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

import { Layout } from 'ant-design-vue'

const { Footer } = Layout

@Component({
  components: {
    Footer
  }
})
export default class Foot extends Vue {
  navOpened = false
  linkUrl = {
    home: '/',
    app: '/swap/',
    twitter: 'https://twitter.com/CropperFinance',
    discord: 'https://discord.gg/zqf76CHAKy',
    medium: 'https://cropperfinance.medium.com/',
    telegram: 'https://linktr.ee/cropperfinance',
    telegram_en: 'https://t.me/CropperFinance',
    telegram_cn: 'https://t.me/cropperChineseofficial',
    telegram_kr: 'https://t.me/CropperFinance_Korea',
    telegram_jp: 'https://t.me/cropperfinancejapan',
    telegram_es: 'https://t.me/cropperspanish',
    telegram_tr: 'https://t.me/CropperTurkish',
    telegram_vn: 'https://t.me/CropperFinanceVietNam',
    telegram_ru: 'https://t.me/cropperrussia',
    telegram_fr: 'https://t.me/cropperfinancefrance',
    telegram_br: 'https://t.me/cropperfinancebrazil',
    telegram_id: 'https://t.me/cropperfinanceindo',
    telegram_it: 'https://t.me/cropperitalia'
  }
  displayfilters = false

  get isMobile() {
    return this.$accessor.isMobile
  }

  beforeMount() {
    this.$accessor.queryIsMobile()
  }
}
</script>

<style lang="less" scoped>
.footer-body {
  display: flex;
  justify-content: space-between;

  @media @max-sl-mobile {
    display: unset;
  }

  .logo {
    img {
      height: 35px;
    }

    @media @max-sl-mobile {
      margin-bottom: 30px;
    }
  }

  .icon_list {
    &.noMobile {
      display: flex;
      align-items: center;

      .social-telegram .social-icon {
        margin-right: 0;
      }

      .social-medium,
      .social-discord,
      .social-twitter,
      .social-telegram {
        .social-icon {
          height: 18px;
        }

        .social-icon:last-child {
          display: none;
        }

        &:hover .social-icon:last-child {
          display: unset;
        }

        &:hover .social-icon:first-child {
          display: none;
        }
      }
    }

    &.noDesktop {
      display: none;
      @media @max-sl-mobile {
        display: inline-block;
      }
    }

    a {
      margin-right: 38px;
      color: #ccd1f1;

      @media @max-sl-mobile {
        display: block;
      }

      &:last-child {
        margin-right: 0;
      }
    }

    label {
      color: #fff !important;
      font-size: 22px;
    }

    .telegramButton > img {
      margin-left: 12px;
      transform: 0;
    }

    .telegramButton-active > img {
      transform: rotate(180deg);
      transition: transform 0.3s;
    }
  }
}

.telegram {
  &.noDesktop {
    display: none;

    &.visible {
      height: 250px;
      display: block;
      padding-top: 18px;
    }

    .telegram-group {
      display: flex;
      justify-content: space-between;

      @media @max-sl-mobile {
        display: block;
      }

      a {
        color: #fff;

        @media @max-sl-mobile {
          display: block;
          width: 50%;
          float: left;
          margin-bottom: 18px;
        }
      }
    }
  }
}

.footer-line {
  height: 1px;
  background: #fff;
  opacity: 0.2;
  margin: 28px 0 16px 0;
}

.footer-refer {
  position: relative;
  z-index: 2;
  text-align: center;
  color: @color-blue200;

  @media @max-sl-mobile {
    text-align: left;
  }
}
</style>