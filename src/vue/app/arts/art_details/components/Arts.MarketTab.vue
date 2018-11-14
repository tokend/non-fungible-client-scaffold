<template>
    <div class="art-market-tab">
        <template v-if="!isLoggedIn">
            <p class="art-market-tab__list-explanations
        app__page-explanations
        app__page-explanations--secondary">
                {{ 'art_market_trade_unavailable_unverified_message' | translate }}
            </p>
        </template>
        <template v-else>
            <template v-if="!bids">
                <loader :message="i18n.art_modal_loading()"/>
            </template>
            <div class="art-market-tab__lists">
                <buy-sell-list
                        v-if="!isBuyFormShown"
                        :list="buyersList"
                        :is-form-shown="isBuyFormShown"
                        :is-buy="true"
                        :is-can-buy="isCanBuy"
                        :is-can-sell="isCanSell"
                        :quote-asset="quoteAsset"
                        :has-offer="hasOffer"
                        :is-pending="isPending"
                        :account-id="accountId"
                        class="art-market-tab__list"
                        @show-make-offer-form="handleFormShow"
                        @cancel-order="cancelOrder"
                />
                <template v-if="isBuyFormShown">
                    <div class="app-market__buy-form-wrp">
                        <buy-form
                                :art="art"
                                :quote-asset="quoteAsset"
                                @close-form="(isBuyFormShown = false); loadArtOffers()"
                        />
                    </div>
                </template>
                <!--this part is not used -->
                <template v-if="false">
                    <buy-sell-list
                            v-if="!isSellFormShown"
                            :list="sellersList"
                            :is-form-shown="isSellFormShown"
                            :is-buy="false"
                            :is-can-buy="isCanBuy"
                            :is-can-sell="isCanSell"
                            :quote-asset="quoteAsset"
                            :has-offer="hasOffer"
                            :is-pending="isPending"
                            :account-id="accountId"
                            class="art-market-tab__list"
                            @show-make-offer-form="handleFormShow"
                            @cancel-order="cancelOrder"
                    />
                    <template v-if="isSellFormShown">
                        <div class="app-market__buy-form-wrp">
                            <sell-form
                                    :art="art"
                                    :quote-asset-code="quoteAsset"
                                    :is-creator="isCreator"
                                    @close-form="(isSellFormShown = false); loadArtOffers()"
                                    @art-update-request="$emit(UPDATE_REQUEST_EVENT_NAME)"
                            />
                        </div>
                    </template>
                </template>
                <arts-atomic-swap-list
                        v-if="bids"
                        :bids="bids"
                        :art="art"
                        class="art-market-tab__list"
                        :is-can-sell="isCanSell"
                        @load-market="$emit('load-market')"
                        @cancel-bid="cancelOrder"
                />
            </div>
        </template>
    </div>
</template>

<script>
  import { translate } from '@/vue/common/filters/translate'
  import { ORDER_TYPES } from '@/js/const/order-types'
  import OrderMakerMixin from './order-maker.mixin'
  import SubmitterMixin from '@/vue/common/mixins/submitter.mixin'
  import { vuexTypes } from '@/vuex/types'
  import { mapGetters, mapActions } from 'vuex'
  import { ACCOUNT_TYPES } from '@/js/const/xdr.const'
  import BuyForm from './Arts.BuyForm'
  import SellForm from './Arts.SellForm'
  import BuySellList from './Arts.BuySellList'
  import { RecordFactory } from '@/js/records/factory'
  import { offersService } from '@/js/services/offer.service'
  import ArtsAtomicSwapList from './Arts.AtomicSwapList'

  import { ErrorHandler } from '@/js/errors/error_handler'
  import { EventDispatcher } from '@/js/events/event_dispatcher'
  import { confirmAction } from '@/js/modals/confirmation_message'

  import { SECONDARY_MARKET_ORDER_BOOK_ID } from '@/js/const/offers.const'

  import Loader from '@/vue/app/common/Loader'
  import { i18n } from '@/js/i18n'

  const UPDATE_REQUEST_EVENT_NAME = 'art-update-request'

  export default {
    mixins: [OrderMakerMixin, SubmitterMixin],
    filters: {
      translate
    },
    components: {
      BuyForm,
      SellForm,
      BuySellList,
      ArtsAtomicSwapList,
      Loader
    },
    props: {
      art: null,
      quoteAsset: '',
      bids: null
    },
    data: _ => ({
      i18n,
      UPDATE_REQUEST_EVENT_NAME,
      ORDER_TYPES,
      buyersList: [],
      sellersList: [],
      isBuyFormShown: false,
      isSellFormShown: false,
      ticker: undefined,
      tickerBlocked: false,
      ACCOUNT_TYPES
    }),
    created () {
      this.loadArtOffers()
      this.initTicker()
    },
    destroyed () {
      this.destroyTicker()
    },
    methods: {
      ...mapActions({
        loadOffers: vuexTypes.GET_BUY_OFFERS
      }),
      async cancelOrder (order) {
        let temporaryOrder = {}
        if (order) {
          if (!await confirmAction()) return
          temporaryOrder = order
        } else {
          temporaryOrder = this.buyersList.find(order => order.owner === this.accountId)
        }
        if (temporaryOrder) {
          this.disable()
          try {
            await offersService.cancelOffer({
              baseBalance: this.accountBalances[temporaryOrder.baseAssetCode].balance_id,
              quoteBalance: this.accountBalances[temporaryOrder.quoteAssetCode].balance_id,
              offerId: '' + temporaryOrder.id,
              price: temporaryOrder.price,
              orderBookId: SECONDARY_MARKET_ORDER_BOOK_ID
            })
            await this.loadArtOffers()
            EventDispatcher.dispatchShowSuccessEvent(translate('trd_offer_canceled'))
          } catch (error) {
            ErrorHandler.processUnexpected(error)
          }
          this.enable()
        }
      },
      handleFormShow (isBuy) {
        if (isBuy) {
          this.isBuyFormShown = true
        } else {
          this.isSellFormShown = true
        }
      },
      destroyTicker () {
        clearInterval(this.ticker)
      },
      initTicker () {
        this.ticker = setInterval(async _ => {
          if (this.tickerBlocked) return
          this.tickerBlocked = true
          await this.$emit(UPDATE_REQUEST_EVENT_NAME)
          if (this.isLoggedIn) await this.loadBalances()
          await this.loadArtOffers()
          this.tickerBlocked = false
        }, 5000)
      },
      async loadArtOffers () {
        const responseBuyersList = await offersService.loadTradeOffers({
          base: this.art.code,
          quote: this.quoteAsset || this.form.quoteAsset,
          isBuy: true,
          owner: this.accountId
        })
        const responseSellersList = await offersService.loadTradeOffers({
          base: this.art.code,
          quote: this.quoteAsset || this.form.quoteAsset,
          isBuy: false,
          owner: this.accountId
        })
        const offersSell = responseSellersList.records
          .map(record => RecordFactory.createOfferRecord(record))
          .sort((a, b) => b.quoteAmount - a.quoteAmount)
        const offersBuy = responseBuyersList.records
          .map(record => RecordFactory.createOfferRecord(record))
          .sort((a, b) => b.quoteAmount - a.quoteAmount)
        this.buyersList = offersBuy
        this.sellersList = offersSell
      }
    },
    computed: {
      ...mapGetters([
        vuexTypes.accountId,
        vuexTypes.accountTypeI,
        vuexTypes.buyOffers,
        vuexTypes.isLoggedIn
      ]),
      hasOffer () {
        return this.isLoggedIn
          ? !!this.buyersList.find(offer => offer.owner === this.accountId)
          : false
      },
      isCanSell () {
        const haveBalance = (+(this.accountBalances[this.art.code] || []).balance > 0)
        return ((haveBalance || this.isCreator) && this.isLoggedIn)
      },
      isCanBuy () {
        return (!this.isCreator && !this.isArtist && this.isLoggedIn)
      },
      isArtist () {
        return this.accountTypeI === ACCOUNT_TYPES.syndicate
      },
      isCreator () {
        return this.accountId === this.art.owner
      },
      isFormShown () {
        return this.isBuyFormShown || this.isSellFormShown
      }
    }
  }
</script>

<style lang="scss">
    @import "~@scss/variables";
    @import "~@scss/mixins";

    .art-market-tab__list-form-divider {
        border: none;
        border-bottom: 1px dashed $col-horizontal-content-divider;
        margin: 5 * $point 0;
    }

    .art-market-tab__list-action-btn {
        margin-top: 2 * $point;
        margin-right: 10px;
    }

    .art-market-tab__list-explanations {
        margin: 2 * $point auto 1 * $point !important;
        text-align: center;
        line-height: 1.5;
        max-width: 100% !important;
    }

    .app-market__buy-form-wrp {
        width: 48.5%;
        padding: 2 * $point;
        max-height: 191px;
        border: 1px dashed $col-light-bg-content-emphasis-border-color;
        position: relative;
    }

    .art-market-tab__lists {
        width: 100%;
        display: flex;
        justify-content: space-between;
        @media (max-width: 1000px) {
            flex-direction: column;
        }

        .art-market-tab__list {
            width: 48.5%;
            @media (max-width: 1000px) {
                width: 100%;
            }
        }
    }
</style>
