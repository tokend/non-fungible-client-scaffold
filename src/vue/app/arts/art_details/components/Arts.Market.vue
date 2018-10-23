<template>
  <div class="art-market">
    <tabs class="art-market__tabs app__tabs app__tabs--md"
      :options="{ useUrlFragment: false }">
      <tab v-for="asset in quoteAssets"
        :key="asset"
        :name="i18n.art_market_tab_label({asset})">
        <art-market-tab
          :art="art"
          :quote-asset="asset"
          @art-update-request="$emit('art-update-request')"
        />
      </tab>
    </tabs>
  </div>
</template>

<script>
import { i18n } from '@/js/i18n'
import ArtMarketTab from './Arts.MarketTab.vue'

const QUOTE_ASSETS = ['BTC', 'ETH']

export default {
  components: {
    ArtMarketTab
  },
  data () {
    return {
      quoteAssets: QUOTE_ASSETS,
      i18n
    }
  },
  props: {
    art: null
  }
}
</script>

<style lang="scss">
</style>
