<template>
  <div class="swap-address">

    <template v-if="!isPending && !isFailed">

      <p class="swap-address__quote-amount">
        {{ i18n.c(quoteAmount) }} {{ request.quoteAsset }}<br>
        <span class="swap-address__quote-label">price for {{ i18n.n(request.baseAmount) }} tickets</span>
      </p>

      <p class="swap-address__hint">{{ 'art_send_to_this_address' | translate({ asset: request.quoteAsset }) }}</p>
      <div class="swap-address__content">
        <div class="swap-address__qr-wrp">
          <!--TODO: use vue-qr instead for consistency-->
          <qrcode class="swap-address__qr-code"
                  :text="request.address"
                  :size="180"
                  color="#3f4244"
          />
        </div>

        <div class="app__form-row">
          <clipboard-field
            :value="request.address"
            :label="i18n.art_address({ asset: request.quoteAsset })"
            :monospaced="true"
          />
        </div>
      </div>

      <div class="swap-address__actions">
        <button class="app__button" @click="$emit('close')">
          {{ 'lbl_ok' | translate }}
        </button>
      </div>
    </template>

    <template v-else-if="isFailed">
      {{ 'art_failed_load' | translate}}
    </template>

    <template v-else>
      <loader :message="'lbl_loading' | translate"/>
    </template>

  </div>
</template>

<script>
  import ClipboardField from '../../../../common/fields/ClipboardField'
  import Qrcode from 'vue-qrcode-component'
  import Loader from '@/vue/app/common/Loader'

  import { i18n } from '@/js/i18n'
  import { Sdk } from '@/sdk'

  import { RecordFactory } from '@/js/records/factory'
  import { multiply } from '@/js/utils/math.util'

  import _get from 'lodash/get'

  export default {
    props: ['request', 'bid'],
    data: _ => ({
      i18n,
      newBid: null,
      isPending: false,
      isFailed: false
    }),
    components: {
      ClipboardField,
      Qrcode,
      Loader
    },
    async created () {
      this.isPending = true
      if (!this.bid) {
        try {
          await this.loadBid()
        } catch (e) {
          console.error(e)
          this.isFailed = true
        }
      }
      this.isPending = false
    },
    computed: {
      quoteAmount () {
        let price = null
        if (this.bid) {
          price = (_get(this, 'bid.quoteAssets', [])
            .find(q => q.asset === this.request.quoteAsset) || {})
            .price
        } else {
          price = (_get(this, 'newBid.quoteAssets', [])
            .find(q => q.asset === this.request.quoteAsset) || {})
            .price
        }
        return multiply(price, this.request.baseAmount)
      }
    },
    methods: {
      async loadBid () {
        const respons = await Sdk.horizon.atomicSwapBid.get(this.request.bidId)
        this.newBid = RecordFactory.createBidRecord(respons.data)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@scss/variables";

  .swap-address {
    max-width: 20rem;
  }

  .swap-address__quote-amount {
    width: 100%;
    background: $col-background;
    border-radius: 5px;
    color: $col-md-primary;
    font-size: 2.4 * $point;
    text-align: center;
    padding: 1rem 0;
    margin-bottom: 2rem;
  }


  .swap-address__quote-label {
    font-size: .7rem;
  }

  .swap-address,
  .swap-address button {
    font-family: 'Circular', 'Noto Sans', '-apple-system', 'BlinkMacSystemFont', sans-serif !important;
    color: $col-md-primary;
  }

  .swap-address__heading {
    margin-bottom: 1rem;
  }

  .swap-address__hint,
  .swap-address__content {
    margin-bottom: 2rem;
  }

  .swap-address__qr-code {
    margin: auto;
    width: 180px;
  }

  .swap-address__actions {
    text-align: right;
  }
</style>
