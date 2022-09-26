import { getterTree, mutationTree, actionTree } from 'typed-vuex'

import { cloneDeep } from 'lodash-es'
import logger from '@/utils/logger'
import fixedtokens from './tokens.json';

import { DEVNET_MODE, TOKEN_UPDATE_INTERVAL } from '@/utils/ids'
import { POP_TOKENS, TOKENS, WRAPPED_SOL } from '@/utils/tokens'

export const state = () => ({
  initialized: false,
  loading: false,
})

export const getters = getterTree(state, {})

export const mutations = mutationTree(state, {
  setInitialized(state) {
    state.initialized = true
  },

  setLoading(state, loading: boolean) {
    state.loading = loading
  },
})

export const actions:any = actionTree(
  { state, getters, mutations },
  {
    async loadTokens({ commit }) {

      commit('setLoading', true)

      let need_to_update = false
      let cur_date = new Date().getTime()


      if(window.localStorage.tokensLoading_v3 && window.localStorage.tokensLoading_v3 == 1){
     //   logger('Skiped')
     //   return
      }


      window.localStorage.tokensLoading_v3 = 0

      if(window.localStorage.token_last_updated_v6){
        const last_updated = parseInt(window.localStorage.token_last_updated_v6)
        if(cur_date - last_updated >= TOKEN_UPDATE_INTERVAL || last_updated < 1639125197){
          need_to_update = true
        }
      }
      else
      {
        need_to_update = true
      }

      if(!DEVNET_MODE )
      {
        if(need_to_update == false)
        {
          const tokens = JSON.parse(window.localStorage.tokens)
  
          for (const [key, value] of Object.entries(tokens)) {
            TOKENS[key] = value
          }


          if(Object.entries(TOKENS).length == 0)
          {
            need_to_update = true
          }
        }

        if(need_to_update)
        {

          let tokens = []
          try {
          let myJson:any = await (await fetch('https://api.cropper.finance/token_list/')).json()
           tokens = myJson
          } catch {
           tokens = fixedtokens
          }




          let allowed = await fetch('https://api.cropper.finance/tokens/').then((res) => res.json())

          tokens.forEach((itemToken: any) => {

            if(itemToken.chainId != 101) return

            if (itemToken.tags && 
              ( 
                itemToken.tags.includes('lp-token') || 
                itemToken.tags.includes('lending') ||
                !allowed[itemToken.address] ||
                itemToken.tags.includes('stake-pool') || 
                itemToken.name.includes("(Allbridge")
              )

              && itemToken.symbol != 'wUSDT'
              && itemToken.symbol != 'wSOL'
              && itemToken.symbol != 'USDC'
            ) {
              return
            }


            if(itemToken.address == 'FCqfQSujuPxy6V42UvafBhsysWtEq1vhjfMN1PUbgaxA') { return ; }




              if(itemToken.symbol == 'PANDA'){
                itemToken.decimals = 9;
              }

              if(itemToken.symbol == 'FLOOF'){
                itemToken.decimals = 1;
              }

            const token = Object.values(TOKENS).find((item) => item.mintAddress === itemToken.address)
            if (!token) {// + itemToken.address + 'solana'
              let key = POP_TOKENS[itemToken.address] ?? itemToken.address
              let wt = '';
              if(itemToken.extensions && itemToken.extensions.twitter){
                wt = itemToken.extensions.twitter;
              }

              TOKENS[key] = {
                symbol: itemToken.symbol,
                name: itemToken.name,
                mintAddress: itemToken.address,
                decimals: itemToken.decimals,
                twitter: wt,
                picUrl: itemToken.logoURI,
                tags: ['solana']
              }

              if(itemToken.extensions){
                TOKENS[key].twitter = itemToken.extensions.twitter
              }

            } else {
              token.picUrl = itemToken.logoURI

              if (token.symbol !== itemToken.symbol && !token.tags.includes('cropper')) {
                let wt = '';
                if(itemToken.extensions && itemToken.extensions.twitter){
                  wt = itemToken.extensions.twitter;
                }
                token.symbol = itemToken.symbol
                token.name = itemToken.name
                token.mintAddress = itemToken.address
                token.decimals = itemToken.decimals
                token.twitter = wt
                token.tags.push('solana')
              }

              if(itemToken.extensions){
                token.twitter = itemToken.extensions.twitter
              }

            }

            
          })
          TOKENS['WSOL'] = cloneDeep(WRAPPED_SOL)
          //fix-me add API
          TOKENS['oCRP'] = {
            symbol: 'oCRP',
            name : 'oCRP',
            mintAddress : '2Ng4KG6HaWzubTFXsz9DcSCpKgzmJxT3g5ATMoFxVuYG',
            decimals : 0,
            picUrl: 'https://api.cropper.finance/coins/BNCuARZSwAvaFKszS5xhKyRLSjpriSeBCvyBqcffq1T9.png',
            twitter : ''
          }
          TOKENS['oCRP'] = {
            symbol: 'oCRP',
            name : 'oCRP',
            mintAddress : '9WrAKR9pePuJwaXBHrSh2VMN8xHU1Zb2r2gquguRL6U8',
            decimals : 0,
            picUrl: 'https://api.cropper.finance/coins/BNCuARZSwAvaFKszS5xhKyRLSjpriSeBCvyBqcffq1T9.png',
            twitter : ''
          }
          TOKENS['oCRP'] = {
            symbol: 'oCRP',
            name : 'oCRP',
            mintAddress : '5WA6i722rgTmsj2gjXXWW7BaU2gCtSHjnCcdeW6e8rLD',
            decimals : 0,
            picUrl: 'https://api.cropper.finance/coins/BNCuARZSwAvaFKszS5xhKyRLSjpriSeBCvyBqcffq1T9.png',
            twitter : ''
          }
          TOKENS['oCRP-2'] = {
            symbol: 'oCRP-2',
            name : 'oCRP-2',
            mintAddress : '6F6oBRjjKgTLHvDwJNBXNCzwLrSh81xSZKKajSgJYzdp',
            decimals : 0,
            picUrl: 'https://api.cropper.finance/coins/BNCuARZSwAvaFKszS5xhKyRLSjpriSeBCvyBqcffq1T9.png',
            twitter : ''
          }
          TOKENS['oCHICKS'] = {
            symbol: 'oCHICKS',
            name : 'oCHICKS',
            mintAddress : 'HmdxxWUnNM8P7XZ6npwGsezQnNoSB1uz4YFq3mFmuHHE',
            decimals : 0,
            picUrl: 'https://api.cropper.finance/coins/solchicks_option.png',
            twitter : ''
          }
          TOKENS['oCHICKS-2'] = {
            symbol: 'oCHICKS-2',
            name : 'oCHICKS-2',
            mintAddress : 'FNFY5M63Q9ceoN3CRxZwVUVujVhFU3SndY99f6i1qNaJ',
            decimals : 0,
            picUrl: 'https://api.cropper.finance/coins/solchicks_option.png',
            twitter : ''
          }
          TOKENS['oCHICKS-3'] = {
            symbol: 'oCHICKS-3',
            name : 'oCHICKS-3',
            mintAddress : '9ub93R6ZwPNp8W8R6QJJ1FzRbnPSWRqZu5FeSXiJA7V3',
            decimals : 0,
            picUrl: 'https://api.cropper.finance/coins/solchicks_option.png',
            twitter : ''
          }

          TOKENS['oARB'] = {
            symbol: 'oARB',
            name : 'oARB',
            mintAddress : 'GFCsvjL6SRk1syRoRa2HaMW29J1pHeZPgQuAiCnKejwG',
            decimals : 0,
            picUrl: 'https://api.cropper.finance/coins/ARB_option.png',
            twitter : ''
          }

          TOKENS['oARB-2'] = {
            symbol: 'oARB-2',
            name : 'oARB-2',
            mintAddress : 'C6m74739aNRH2Avj3WhbHo5Bfod8mdbTxdwLm7r6S6PZ',
            decimals : 0,
            picUrl: 'https://api.cropper.finance/coins/ARB_option.png',
            twitter : ''
          }
          
          TOKENS['oCRP-3'] = {
            symbol: 'oCRP-3',
            name : 'oCRP-3',
            mintAddress : '2qY5W5sQmcFmzfAg133xs67GrmXNq47k8kFKC8GHCWZW',
            decimals : 0,
            picUrl: 'https://api.cropper.finance/coins/solchicks_option.png',
            twitter : ''
          }
          TOKENS['oCRP-4'] = {
            symbol: 'oCRP-4',
            name : 'oCRP-4',
            mintAddress : 'HSjFjF8NmrXWGpessZYNkqj6uPLnTeMf6zLskAKCXPMP',
            decimals : 0,
            picUrl: 'https://api.cropper.finance/coins/BNCuARZSwAvaFKszS5xhKyRLSjpriSeBCvyBqcffq1T9.png',
            twitter : ''
          }
          TOKENS['oCRP-5'] = {
            symbol: 'oCRP-5',
            name : 'oCRP-5',
            mintAddress : 'Gn5YFfemGP7PnMPwiJhrLKsFG6ociRvRQ84t5mQ8Pnno',
            decimals : 0,
            picUrl: 'https://api.cropper.finance/coins/BNCuARZSwAvaFKszS5xhKyRLSjpriSeBCvyBqcffq1T9.png',
            twitter : ''
          }

          TOKENS['HUSKY'] = {
            symbol: 'HUSKY',
            name : 'HUSKY SOLANA',
            mintAddress : 'GXQBfrgAngEvVM2VmEDFmkWTa9xdhJ9o1wwn6Fas79bg',
            decimals : 6,
            picUrl: 'https://www.arweave.net/7srcs1O_kvS6jFQ4TFnne9TJIWkZv1mw1jDmzj6mThk?ext=png',
            twitter : ''
          }
          

          
          window.localStorage.token_last_updated_v6 = new Date().getTime()
          window.localStorage.tokens = JSON.stringify(TOKENS)
        }

      }

      window.localStorage.tokensLoading_v3 = 0

      logger('Token list updated - ' + need_to_update + ' | ' + (new Date().getTime() - cur_date))
      commit('setInitialized')
      commit('setLoading', false)
    }
  }
)
