import { getterTree, mutationTree, actionTree } from 'typed-vuex'

import { PublicKey, AccountInfo, ParsedAccountData } from '@solana/web3.js'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import { NATIVE_SOL } from '@/utils/tokens'
import { NFT_VERIFIED_CREATOR, TOKEN_PROGRAM_ID } from '@/utils/ids'
import { TokenAmount } from '@/utils/safe-math'
import { cloneDeep } from 'lodash-es'
import logger from '@/utils/logger'
import { findAssociatedTokenAddress } from '@/utils/web3'
import { getMetadataKey } from '@/utils/nft-staking/keys'
import { fetchParsedUserState } from '@/utils/nft-staking/fetch'
const AUTO_REFRESH_TIME = 60

export const state = () => ({
  initialized: false,
  loading: false,
  modalShow: false,

  autoRefreshTime: AUTO_REFRESH_TIME,
  countdown: 0,
  lastSubBlock: 0,

  connected: false,
  address: '',

  tokenAccounts: {},
  auxiliaryTokenAccounts: [] as Array<{ pubkey: PublicKey; account: AccountInfo<ParsedAccountData> }>,
  
  potionNFTs:  [] as Array<{mint: PublicKey, metadata: Metadata, kind: number}>,
  nftStakingState: {},

  xCRPAmount: 0,
  boostPotion: 0,
  tiers: 0
})

export const getters = getterTree(state, {})

export const mutations = mutationTree(state, {
  setModal(state, show: boolean) {
    state.modalShow = show
  },

  setConnected(state, address: string) {
    state.connected = true
    state.address = address
  },

  setStakingTiers(state, data:any) {
    state.xCRPAmount = data.xCRP;
    state.boostPotion = Math.round(data.boostTotal * 100) / 100;
    if(([
    'AFZkhKGF9GqEuNb8FEmE3Jb3Ui7fWgyccTT3yJoxWuQL',
    'HiSzoQfEKXnJN5nA1Z7MUd8AbW4akMqpERXBdhwjNme4',
    'EFCPaZ8eAXD4tnTFuamFcuv9mt3PS3tYAbeAb4vk8pp4',
    'Dz2vU5QJSVow9WMkFhUTPZpfz5J8vcDuv81MW4Z6E4Jy',
    'B8BYtdMLaCWcfF9End1QxToip2n4ggP9E4SUCCtZFRE1'
    ]).includes(state.address)){
      state.tiers = 5;
    } else if(([
    '5Tpi3fWL6XwKqNAV8Th3HK5g6bW3ceKaJ5pqz8GtyL85',
    '3a13fbzAGsV1rNhg5Uas2XoDWMKFYGiuwW3vjFdJYoZW',
    '9ke9BcXtKYc8FsAyjy3cpQDkUT4ePdqnJdupCkPx6Xm5',
    'A7xwL74dgB6bYVco7BfhtCEpi9gphz6rj2EVS77Dd6Lt',
    'AU78FcWzwGrNg7hycPLdB2JWwEHY8xTfyS3UoWdyuChn'
       ]).includes(state.address)){
      state.tiers = 4;
    } else if(([
    '8ifzzBQtem2wE1JH3YUVX1Uco2H5XvQuF7mqfnKeRXeJ',
    '6b13W29VDDS7R2ikyUeUeZaWkGftfoZgA3Nd22fAkkb8',
    'FwgwVdYf4hoUgc482bNBNXcNVto9LJoLB8qC7xgk8JSq'
       ]).includes(state.address)){
      state.tiers = 3;
    } else {
      state.tiers = data.tiers;
    }
  },

  setDisconnected(state) {
    state.connected = false
    state.address = ''
  },

  setInitialized(state) {
    state.initialized = true
  },

  setLoading(state, loading: boolean) {
    if (loading) {
      state.countdown = AUTO_REFRESH_TIME
    }

    state.loading = loading

    if (!loading) {
      state.countdown = 0
    }
  },

  setTokenAccounts(state, tokenAccounts: any) {
    state.tokenAccounts = cloneDeep(tokenAccounts)
  },

  setPotionNFTs(state, potionNFTs) {
    state.potionNFTs = cloneDeep(potionNFTs)
  },

  setNftStakingState(state, nftStakingState) {
    state.nftStakingState = cloneDeep(nftStakingState);
  },

  setAuxiliaryTokenAccounts(
    state,
    auxiliaryTokenAccounts: Array<{ pubkey: PublicKey; account: AccountInfo<ParsedAccountData> }>
  ) {
    state.auxiliaryTokenAccounts = cloneDeep(auxiliaryTokenAccounts)
  },

  setCountdown(state, countdown: number) {
    state.countdown = countdown
  },

  setLastSubBlock(state, lastSubBlock: number) {
    state.lastSubBlock = lastSubBlock
  }
})

export const actions = actionTree(
  { state, getters, mutations },
  {
    openModal({ commit }) {
      commit('setModal', true)
    },

    closeModal({ commit }) {
      return new Promise((resolve) => {
        commit('setModal', false)
        setTimeout(() => {
          resolve(true)
        }, 500)
      })
    },

    getNftStakingState({ commit }) {
      const conn = this.$web3
      const wallet = (this as any)._vm.$wallet
      fetchParsedUserState(conn, wallet).then((stateData) => {
        commit("setNftStakingState", stateData)
      })
    },

    getTokenAccounts({ commit }) {
      const conn = this.$web3
      const wallet = (this as any)._vm.$wallet

      if (wallet && wallet.connected) {
        commit('setLoading', true)

        conn
          .getParsedTokenAccountsByOwner(
            wallet.publicKey,
            {
              programId: TOKEN_PROGRAM_ID
            },
            'confirmed'
          )
          .then(async (parsedTokenAccounts) => {
            const tokenAccounts: any = {}
            const auxiliaryTokenAccounts: Array<{ pubkey: PublicKey; account: AccountInfo<ParsedAccountData> }> = []

            // for potion nfts
            const allMetadataKeys: Array<PublicKey> = [];
            const allNftAccountKeys: Array<PublicKey> = [];
            
            const potionNFTs: Array<{mint: PublicKey, metadata: Metadata, kind: number}> = [];

            parsedTokenAccounts.value.forEach(async (tokenAccountInfo) => {
              const tokenAccountPubkey = tokenAccountInfo.pubkey
              const tokenAccountAddress = tokenAccountPubkey.toBase58()
              const parsedInfo = tokenAccountInfo.account.data.parsed.info
              const mintAddress = parsedInfo.mint
              const balance = new TokenAmount(parsedInfo.tokenAmount.amount, parsedInfo.tokenAmount.decimals)

              const ata = await findAssociatedTokenAddress(wallet.publicKey, new PublicKey(mintAddress))

              if (ata.equals(tokenAccountPubkey)) {
                tokenAccounts[mintAddress] = {
                  tokenAccountAddress,
                  balance
                }

                // get metadata accounts if amount is 1 && decimal is 0. it means NFT token account
                if (parsedInfo.tokenAmount.uiAmount == 1 && parsedInfo.tokenAmount.decimals == 0) {
                  let metadataKey = await getMetadataKey(new PublicKey(parsedInfo.mint));
                  allMetadataKeys.push(metadataKey);
                  allNftAccountKeys.push(tokenAccountPubkey);
                }

              } else if (parsedInfo.tokenAmount.uiAmount > 0) {
                auxiliaryTokenAccounts.push(tokenAccountInfo)
              }
            })
            const solBalance = await conn.getBalance(wallet.publicKey, 'confirmed')
            tokenAccounts[NATIVE_SOL.mintAddress] = {
              tokenAccountAddress: wallet.publicKey.toBase58(),
              balance: new TokenAmount(solBalance, NATIVE_SOL.decimals)
            }
            commit('setAuxiliaryTokenAccounts', auxiliaryTokenAccounts)
            commit('setTokenAccounts', tokenAccounts)
            logger('Wallet TokenAccounts updated')

            const FETCH_LIMIT = 100;
            conn.getMultipleAccountsInfo(allMetadataKeys.slice(0, FETCH_LIMIT)).then(async (metaInfoList) => {
              for(let mil in metaInfoList){
                let metaInfo = metaInfoList[mil]
                if (metaInfo) {
                  let metadataInfo = Metadata.fromAccountInfo(metaInfo)[0];
                  if (metadataInfo.data.creators) {

                    let idx = metadataInfo.data.creators.findIndex(
                      (v) => v.verified && NFT_VERIFIED_CREATOR == v.address.toBase58()
                    );
                    
                    if (idx >= 0) { // it means this nft is potion nft
                      const requestOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: metadataInfo.data.name.trim().replace(/\0/g, '') })
                      }

                      let responseData
                      let typePotion 

                      try {
                        responseData = await fetch('https://flow.cropper.finance/nft/', requestOptions).then((res) => res.json())
                        if(responseData.expect > -1 && responseData.expect < 4){
                          typePotion = responseData.expect
                        }
                      } catch {
                      }


                      potionNFTs.push({
                        mint: metadataInfo.mint,
                        metadata: metadataInfo,
                        kind: typePotion
                      });

                    }
                  }
                }
              }


              commit("setPotionNFTs", potionNFTs)
              logger('Potion NFTs updated')
            })
          })
          .catch()
          .finally(() => {
            commit('setInitialized')
            commit('setLoading', false)
          })
      }
    }
  }
)
