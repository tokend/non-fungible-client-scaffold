<template>
    <div class="art-market">
        <tabs class="art-market__tabs app__tabs app__tabs--md"
              :options="{ useUrlFragment: false }">
            <tab :key="'market_tab'"
                 :name="i18n.art_market_tab()">
                <art-market-tab :art="art"
                                :quote-asset="'BTC'"
                                :bids="bids"
                                @load-market="loadMarket"
                />
            </tab>
            <tab v-if="isLoggedIn"
                 :key="'you_asks'"
                 :name="i18n.art_you_asks()">
                <art-requests-viewer :requests="requests"/>
            </tab>
        </tabs>
    </div>
</template>

<script>
  import { i18n } from '@/js/i18n'
  import ArtMarketTab from './Arts.MarketTab.vue'
  import ArtRequestsViewer from './Art.RequestsViewer'

  import { mapGetters } from 'vuex'
  import { vuexTypes } from '@/vuex/types'
  import { Sdk } from '@/sdk'
  import { RecordFactory } from '@/js/records/factory'

  export default {
    components: {
      ArtMarketTab,
      ArtRequestsViewer
    },
    props: {
      art: null
    },
    data () {
      return {
        i18n,
        requests: [],
        bids: null
      }
    },
    computed: {
      ...mapGetters([
        vuexTypes.isLoggedIn,
        vuexTypes.accountId
      ])
    },
    methods: {
      async loadMarket () {
        try {
          const bids = await this.getBids(this.art.code)
          this.requests = await this.getRequests()
          this.bids = bids.filter(b => !b.isCanceled)
        } catch (e) {
          console.error(e)
        }
      },
      async getRequests () {
        const response = await Sdk.horizon.request.getAllForAtomicSwap({requestor: this.accountId}) // state:
        const requests = response.data.map(r => RecordFactory.createASwapRequestRecord(r))

        function compareData (a, b) {
          const timeA = new Date(a.createdAt)
          const timeB = new Date(b.createdAt)
          if (timeA > timeB) return -1
          if (timeA < timeB) return 1
        }

        requests.sort(compareData)
        return requests
      },
      async getBids (baseAsset) {
        const response = await Sdk.horizon.atomicSwapBid.getPage({base_asset: baseAsset})
        return response.data.map(r => RecordFactory.createBidRecord(r))
      }
    },
    async created () {
      await this.loadMarket()
    }
  }
</script>

<style lang="scss">
</style>
