import { getterTree, mutationTree, actionTree } from 'typed-vuex'

import { PricesData } from '@/types/api'

import { cloneDeep } from 'lodash-es'
import logger from '@/utils/logger'
import { DEVNET_MODE } from '@/utils/ids'

const AUTO_REFRESH_TIME = 60

export const state = () => ({
  initialized: false,
  loading: false,

  autoRefreshTime: AUTO_REFRESH_TIME,
  countdown: 0,

  prices: {} as PricesData
})

export const getters = getterTree(state, {})

export const mutations = mutationTree(state, {
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

  setPrices(state, prices: PricesData) {
    state.prices = cloneDeep(prices)
  },

  setCountdown(state, countdown: number) {
    state.countdown = countdown
  }
})


export const actions = actionTree(
  { state, getters, mutations },
  {
    async requestPrices({ commit }) {
      commit('setLoading', true)

      const baseprices = await this.$api.getPrices();
      const prices: PricesData = {}

      Object.entries(baseprices).forEach(
        ([key, value]) => {
          prices[value['symbol']] = value['price']
        }
      );



      const stake = await fetch('https://api.cropper.finance/staking/').then((res) => res.json());

      prices['CRP'] = stake['price']
      prices['oCRP'] = stake['price'] //- 0.0065
      prices['oCRP-2'] = stake['price'] //- 0.0065
      prices['oCRP-3'] = stake['price'] //- 0.0065
      prices['oCRP-4'] = stake['price'] //- 0.0065
      prices['oCRP-5'] = stake['price'] - 0.089
      prices['oCHICKS'] = stake['prices']['CHICKS'] //- 0.0065
      prices['oCHICKS-2'] = stake['prices']['CHICKS'] //- 0.0065
      prices['oCHICKS-3'] = stake['prices']['CHICKS'] //- 0.0065
      prices['oARB'] = (stake['prices']['ARB'] - 0.011) * 2 //- 0.0065
      prices['oARB-2'] = (stake['prices']['ARB'] - 0.011) * 2 //- 0.0065
      prices['CHICKS'] = stake['prices']['CHICKS'] //- 0.0065
      prices['SOLCHICKS'] = stake['prices']['CHICKS'] //- 0.0065

      //for hongbo's test
      if(DEVNET_MODE){
        prices["CRP"]=0.32
        prices["B2B"]=2.24
      }
      
      commit('setPrices', prices)

      commit('setInitialized')
      commit('setLoading', false)
    }
  }
)
