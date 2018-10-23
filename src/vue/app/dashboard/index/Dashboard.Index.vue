<template>
  <div class="dashboard">
    <template v-if="isLoading">
      <loader :message="i18n.dash_loading()"/>
    </template>
    <template v-else>
      <portfolio-widget class="md-layout-item dashboard__portfolio"
                        :currentAsset="currentAsset"
                        @asset-change="setCurrentAsset"
                        @change-dashboard-scale="changeDashboardScale"
                        :scale="scale"
                        :show-tabls="showTabs"
      />
      <info-widget v-if="currentAsset" class="dashboard__activity" :currentAsset="currentAsset"/>
    </template>
  </div>
</template>

<script>
import PortfolioWidget from './Dashboard.PortfolioWidget'
import InfoWidget from './Dashboard.InfoWidget'
import Chart from './Dashboard.Chart'
import { mapGetters, mapActions } from 'vuex'
import { vuexTypes } from '@/vuex/types'
import { i18n } from '@/js/i18n'
import config from '@/config'
import Loader from '@/vue/app/common/Loader'
import { ASSET_POLICIES } from '@/js/const/const'

export default {
  name: 'dashboard',
  components: {
    PortfolioWidget,
    InfoWidget,
    Chart,
    Loader
  },
  data: _ => ({
    currentAsset: null,
    showTabs: false,
    isLoading: false,
    scale: 'month',
    i18n
  }),
  async created () {
    this.isLoading = true
    await this.loadBalances()
    this.setCurrentAsset()
    this.isLoading = false
  },
  computed: {
    ...mapGetters([
      vuexTypes.accountBalances
    ])
  },
  methods: {
    ...mapActions({
      loadBalances: vuexTypes.GET_ACCOUNT_BALANCES
    }),
    setCurrentAsset (value) {
      const regExp = /\(([^)]+)\)/
      if (value) {
        this.currentAsset = regExp.exec(value)[1]
      } else {
        let tokens = []
        for (const key in this.accountBalances) {
          if (this.accountBalances.hasOwnProperty(key)) {
            const element = this.accountBalances[key].asset_details
            const isQuote = element.code === config.DEFAULT_QUOTE_ASSET
            const isBase = element.policy & ASSET_POLICIES.baseAsset
            const isHidden = config.HIDDEN_ARTS.includes(element.code)
            if (!isQuote && !isBase && !isHidden) {
              tokens.push(element.code)
            }
          }
        }
        tokens = tokens.sort((a, b) => a.localeCompare(b))
        this.currentAsset = tokens[0] || null
      }
    },
    changeDashboardScale (value) {
      this.scale = value
    },
    checkDashboardHasValue (value) {
      this.showTabs = value
    }
  },
  watch: {
    accountBalances () {
      this.setCurrentAsset()
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@scss/variables";
@import "~@scss/mixins";

$custom-breakpoint: 800px;

.dashboard {
  padding: 0 0;
}

.dashboard__portfolio {
  margin-bottom: 24px;
}

.dashboard__activity {
  width: 100%;
}
</style>
