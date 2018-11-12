<template>
  <div class="quote-viewer">
    <div class="quote-viewer__inner">
      <template v-if="token">
        <div class="quote-viewer__img-wrp">
          <img :src="token.logoURL" alt="">
        </div>

        <div class="ticket-market__asset" :key="quote.asset">
          {{ 'art_buy_for_asset' | translate({ asset: quote.asset, price: i18n.c(quote.price) }) }}
        </div>

      </template>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { vuexTypes } from '../../../../../vuex/types'
  import { i18n } from '@/js/i18n'

  export default {
    name: 'TicketsQuoteViewer',
    props: ['quote'],
    data: _ => ({
      i18n
    }),
    computed: {
      ...mapGetters([
        vuexTypes.tokens
      ]),
      token () {
        return this.tokens.find(t => t.code === this.quote.asset)
      }
    }
  }
</script>

<style lang="scss" scoped>
  $image-size: 2.5rem;

  .quote-viewer__inner,
  .quote-viewer__img-wrp {
    align-items: center;
    display: flex;
    flex-direction: column;
    text-align: center;
  }

  .quote-viewer__inner {
    border: 1px solid lightgray;
    border-radius: 4px;
    padding: 1rem 0.3rem;
  }

  .quote-viewer__img-wrp {
    margin-bottom: 1rem;
    height: $image-size;
    width: $image-size;

    img {
      height: 100%;
      width: 100%;
    }
  }
</style>
