import { vuexTypes } from '../types'

import { artsService } from '../../js/services/arts.service'
import { RecordFactory } from '../../js/records/factory'
import { StateHelper } from '../helpers/state.helper'
import config from '@/config'

export const state = {
  arts: [],
  userOwnedArts: [],
  acquiredArts: []
}

export const mutations = {
  SET_ALL_ARTS: (state, arts) => {
    state.arts = arts
  },
  SET_USER_OWNED_ARTS: (state, arts) => {
    state.user_arts = arts
  },
  SET_USER_ACQUIRED_ARTS: (state, arts) => {
    state.acquiredArts = arts
  }
}

export const actions = {
  async GET_ALL_ARTS ({ commit }) {
    commit(
      vuexTypes.SET_ALL_ARTS,
      (await artsService.loadArts())
        .filter(item => !config.HIDDEN_ARTS.includes(item.code))
        .map(record => RecordFactory.createArtRecord(record))
    )
  }
}

export const getters = {
  arts: state => state.arts.filter(art => !art.isWalletToken),
  userOwnedArts: state => state.userOwnedArts,
  userAcquiredArts: _ => StateHelper.deriveTokensFromBalancesDetails(),
  userWalletArts: _ => StateHelper.deriveTokensFromBalancesDetails(art => art.isWalletArt),
  userTransferableArts: _ => StateHelper.deriveTokensFromBalancesDetails(art => art.isTransferable),
  userWithdrawableArts: _ => StateHelper.deriveTokensFromBalancesDetails(art => art.isWithdrawable)
}

export default {
  actions,
  getters,
  mutations,
  state
}
