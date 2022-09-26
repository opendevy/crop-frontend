<template>
  <Modal
    :title="`${type === 'stake' ? 'Stake' : 'Unstake'} Potion NFT`"
    :visible="show"
    :footer="null"
    :mask-closable="true"
    :closable="false"
    :width="420"
    @cancel="handleCloseModal"
    centered
  >
    <img
      class="modal-close"
      src="@/assets/icons/close-circle.svg"
      @click="handleCloseModal"
      alt="close circle button"
    />
    <div class="stake-nft-modal-container">

<!--      <button @click="initi">INITIER</button>-->


      <div class="potions-list">
        <CheckBoxGroup class="potion-check-group w-100" @change="handleSelectPotion" v-model="activePotions">
          <div v-for="item in potions" :key="item.mint.toBase58()" class="potion-check-container mb-24">
            <Checkbox :value="item" :disabled="(new Date().getTime() / 1000) < item.end_lock_date">
              <label class="font-medium weight-semi spacing-small">{{ potionName }}  {{ item.mint.toBase58().substring(0, 7) }}</label>
            </Checkbox>
            <div v-if="type === 'unstake'" class="fcsb-container mt-16">
              <span class="font-small weight-bold color-blue200">End of Lock</span>
              <span class="font-small weight-semi spacing-large color-blue100">{{ parseTimeStamp(item.end_lock_date) }}</span>
            </div>
          </div>
        </CheckBoxGroup>
      </div>
      <div v-if="type === 'stake'" class="fb-container mt-16">
        <img src="@/assets/icons/info.svg" class="mr-8" width="12" height="12" alt="info icon" />
        <span class="font-small weight-bold color-blue200"
          >Once staked, Your NFTs are blocked 10 days at the date of staking.</span
        >
      </div>
      <Button class="btn-container btn-gradient w-100 mt-16 icon-cursor"
        @click="() => {
          if (type == 'stake')
            stakeNFT()
          else 
            unstakeNFT()
        }">
        <span class="font-large weight-bold">{{ type === 'stake' ? 'Stake' : 'Unstake' }} Now</span>
      </Button>
    </div>
  </Modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Modal, Checkbox } from 'ant-design-vue'
import { getUnixTs } from '@/utils'
import { w3_stakeNft, w3_unStakeNft, w3_initializeProgram } from '@/utils/nft-staking'
import { PublicKey } from '@solana/web3.js'

const CheckBoxGroup = Checkbox.Group
Vue.use(Modal)

export default Vue.extend({
  components: {
    Modal,
    Checkbox,
    CheckBoxGroup
  },
  data() {
    return {
      activePotions: [] as any[]
    }
  },
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'stake'
    },
    potionName: {
      type: String,
      default: ''
    },
    potionType: {
      type: Number,
      default: 0
    },
    potions: {
      default: []
    },
    maxCount: {
      type: Number,
      default: 0
    }
  },

  computed: {
    ...mapState(['url', 'wallet'])
  },

  watch: {},

  mounted() {
  },

  methods: {
    handleSelectPotion(checkedValues: any[]) {
      this.activePotions = checkedValues;

      console.log("checkedValues =", checkedValues);
    },

    handleCloseModal() {
      this.activePotions = [];
      this.$emit('onCancel');
    },

    parseTimeStamp(timeInSeconds: number) {
      let d = new Date(timeInSeconds * 1000);
      return d.toString();
    },

    async stakeNFT() {
      const conn = this.$web3
      const wallet = (this as any).$wallet
      let nftMints: PublicKey[] = [];
      this.activePotions.forEach((potion) => nftMints.push(potion.mint));
      if (!nftMints.length) return;
      if (nftMints.length > this.maxCount) {
        this.$notify.warning({
          key: getUnixTs().toString(),
          message: `Exceeds maximum count - ${this.maxCount}`,
          description: '',
          duration: 2
        })
        return;
      }
      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })
      w3_stakeNft({
        connection: conn, 
        wallet, 
        nftMints
      }).then((txid) => {
        this.$notify.info({
          key,
          message: 'Transaction has been sent',
          description: (h: any) =>
            h('div', [
              'Confirmation is in progress.  Check your transaction on ',
              h(
                'a',
                {
                  attrs: {
                    href: `${this.url.explorer}/tx/${txid}`,
                    target: '_blank'
                  }
                },
                'here'
              )
            ])
        })

        const description = `Staking ${nftMints.length} of ${this.$props.potionName}`
        this.$accessor.transaction.sub({ txid, description })
        this.$emit('onCancel');
      })
      .catch((error) => {
        this.$notify.error({
          key,
          message: 'Staking failed',
          description: error.message
        })

        this.$accessor.farm.requestInfos()
        this.$accessor.wallet.getTokenAccounts()
        this.$accessor.wallet.getNftStakingState()
      })
      .finally(async() => {
        this.$accessor.wallet.getTokenAccounts()
        this.$accessor.wallet.getNftStakingState()
      })
  },



    async initi() {
      const conn = this.$web3
      const wallet = (this as any).$wallet
      let nftMints: PublicKey[] = [];
      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })
      w3_initializeProgram({
        connection: conn, 
        wallet
      }).then((txid) => {
        this.$notify.info({
          key,
          message: 'Transaction has been sent',
          description: (h: any) =>
            h('div', [
              'Confirmation is in progress.  Check your transaction on ',
              h(
                'a',
                {
                  attrs: {
                    href: `${this.url.explorer}/tx/${txid}`,
                    target: '_blank'
                  }
                },
                'here'
              )
            ])
        })
      })
      .catch((error) => {
        this.$notify.error({
          key,
          message: 'Staking failed',
          description: error.message
        })
      })
      .finally(async() => {
      })
  },

  async unstakeNFT() {
      const conn = this.$web3
      const wallet = (this as any).$wallet
      let nftMints: PublicKey[] = [];
      this.activePotions.forEach((potion) => nftMints.push(potion.mint));
      if (!nftMints.length) return;
      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })
      w3_unStakeNft({
        connection: conn, 
        wallet, 
        nftMints
      }).then((txid) => {
        this.$notify.info({
          key,
          message: 'Transaction has been sent',
          description: (h: any) =>
            h('div', [
              'Confirmation is in progress.  Check your transaction on ',
              h(
                'a',
                {
                  attrs: {
                    href: `${this.url.explorer}/tx/${txid}`,
                    target: '_blank'
                  }
                },
                'here'
              )
            ])
        })

        const description = `unstaking ${nftMints.length} of ${this.$props.potionName}`
        this.$accessor.transaction.sub({ txid, description })
        this.$emit('onCancel');
      })
      .catch((error) => {
        this.$notify.error({
          key,
          message: 'unstaking failed',
          description: error.message
        })

        this.$accessor.farm.requestInfos()
        this.$accessor.wallet.getTokenAccounts()
        this.$accessor.wallet.getNftStakingState()
      })
      .finally(() => {
        this.$accessor.wallet.getTokenAccounts()
        this.$accessor.wallet.getNftStakingState()
      })
  },
}})
</script>

<style lang="less" scoped>
.stake-nft-modal-container {
  margin-top: 18px;

  // global stylesheet
  .btn-gradient {
    padding: 10px 0;
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 38px;
    border: none;
  }

  // class stylesheet
  .potions-list {
    padding: 0 10px;
    .potion-check-group {
      .potion-check-container {
        padding: 18px 10px;
        border-radius: 18px;
        background: @color-blue800;

        &:last-child {
          margin-bottom: 0 !important;
        }
      }
    }
  }
}
</style>
