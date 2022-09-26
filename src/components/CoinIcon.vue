<template>
  <img
    v-if="coinPicUrl"
    :src="coinPicUrl"
    @error="
      (event) => {
        event.path[0].src = `https://api.cropper.finance/coins/${this.mintAddress}.png`
      }
    "
    alt="coin icon"
  />
  <img v-else :src="importIcon(`/coins/${coinName}.png`)" alt="coin icon" />
</template>

<script lang="ts">
import { TOKENS, NATIVE_SOL } from '@/utils/tokens'
import importIcon from '@/utils/import-icon'
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  components: {},
  props: {
    mintAddress: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      coinPicUrl: '',
      coinName: ''
    }
  },
  computed: {
    ...mapState(['liquidity'])
  },
  watch: {
    mintAddress() {
      this.getCoinPicUrl()
    }
  },
  mounted() {
    this.getCoinPicUrl()
  },
  methods: {
    importIcon,
    getCoinPicUrl() {

      if(this.url){
        this.coinPicUrl = this.url
        return
      }

      let token
      if (this.mintAddress === NATIVE_SOL.mintAddress) {
        token = NATIVE_SOL
      } else {
        token = Object.values(TOKENS).find((item) => item.mintAddress === this.mintAddress)
      }
      if (token) {
        this.coinName = token.symbol.toLowerCase()
        if (token.picUrl) {
          this.coinPicUrl = token.picUrl
        } else {
          this.coinPicUrl = ''
        }
      }
    }
  }
})
</script>
