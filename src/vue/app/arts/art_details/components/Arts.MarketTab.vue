<template>
    <div class="art-market-tab">

        <div class="art-market-tab__lists">
            <buy-sell-list
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
            <buy-sell-list
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

        </div>
        <template v-if="!isLoggedIn">
            <p class="art-market-tab__list-explanations
                app__page-explanations
                app__page-explanations--secondary">
                {{ 'art_market_trade_unavailable_unverified_message' | translate }}
            </p>
        </template>
        <template v-if="isBuyFormShown">
            <div class="app-market__buy-form-wrp">
                <buy-form
                        :art="art"
                        :quote-asset="quoteAsset"
                        @close-form="(isBuyFormShown = false); loadArtOffers()"
                />
            </div>
        </template>
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
    </div>
</template>

<script>
  import {translate} from '@/vue/common/filters/translate'
  import {ORDER_TYPES} from '@/js/const/order-types'
  import OrderMakerMixin from './order-maker.mixin'
  import SubmitterMixin from '@/vue/common/mixins/submitter.mixin'
  import {vuexTypes} from '@/vuex/types'
  import {mapGetters, mapActions} from 'vuex'
  import {ACCOUNT_TYPES} from '@/js/const/xdr.const'
  import BuyForm from './Arts.BuyForm'
  import SellForm from './Arts.SellForm'
  import BuySellList from './Arts.BuySellList'
  import {RecordFactory} from '@/js/records/factory'
  import {offersService} from '@/js/services/offer.service'

  import {ErrorHandler} from '@/js/errors/error_handler'
  import {EventDispatcher} from '@/js/events/event_dispatcher'
  import {confirmAction} from '@/js/modals/confirmation_message'

  import {SECONDARY_MARKET_ORDER_BOOK_ID} from '@/js/const/offers.const'

  const UPDATE_REQUEST_EVENT_NAME = 'art-update-request'

  export default {
    mixins: [OrderMakerMixin, SubmitterMixin],
    filters: {
      translate
    },
    components: {
      BuyForm,
      SellForm,
      BuySellList
    },
    data: _ => ({
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
    props: {
      art: null,
      quoteAsset: ''
    },
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
        if (!await confirmAction()) return
        this.disable()
        try {
          await offersService.cancelOffer({
            baseBalance: this.accountBalances[order.baseAssetCode].balance_id,
            quoteBalance: this.accountBalances[order.quoteAssetCode].balance_id,
            offerId: '' + order.id,
            price: order.price,
            orderBookId: SECONDARY_MARKET_ORDER_BOOK_ID
          })
          await this.loadArtOffers()
          EventDispatcher.dispatchShowSuccessEvent(translate('trd_offer_canceled'))
        } catch (error) {
          ErrorHandler.processUnexpected(error)
        }
        this.enable()
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

    .art-market-tab__list-row {
        cursor: pointer;
    }

    .art-market-tab__list-no-transactions {
        width: 100%;
        text-align: center;
        margin: 0 auto;

        & > i {
            color: $col-md-primary-secondary-inactive !important;
        }

        & > p {
            color: $col-md-primary-inactive;
        }
    }

    .orders__list {
        width: 100%;
    }

    .art-market-tab__cancel-btn {
        margin-left: -18px;
    }

    .art-market-tab__list-title {
        min-height: 0;
        margin-bottom: 1 * $point;
    }

    .art-market-tab__list {
        .md-table-head-label,
        .md-table-cell-container {
            padding-right: 4px;
            padding-left: 4px;
        }
    }

    .art-market-tab__list-form-divider {
        border: none;
        border-bottom: 1px dashed $col-horizontal-content-divider;
        margin: 5 * $point 0;
    }

    .art-market-tab__list-action-btn {
        margin-top: 2 * $point;
        margin-right: 10px;
    }

    .art-market-tab__list-no-transactions-btn {
        margin-top: 3 * $point;
    }

    .art-market-tab__list-explanations {
        margin: 2 * $point auto 1 * $point !important;
        text-align: center;
        line-height: 1.5;
        max-width: 100% !important;
    }

    .art-market-tab__actions-wrp {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin-top: 2 * $point;

        & > .art-market-tab__list-action-btn {
            margin-top: 0;
            flex-shrink: 0;
        }
    }

    .art-market-tab__has-offers-msg {
        padding-left: 1.3 * $point;
        font-size: 1.2 * $point;
        color: $col-md-primary-inactive;
    }

    .app-market__buy-form-wrp {
        width: 100%;
        margin-top: 2 * $point;
        padding: 2 * $point;
        border: 1px dashed $col-light-bg-content-emphasis-border-color;
        position: relative;
    }

    .art-market-tab__not-available-for-artists {
        padding: 24px 0;
        text-align: center;
        font-size: 14px;
        color: $col-md-primary;
    }

    .art-market-tab__list-cell {
        &--right > .md-table-cell-container,
        &--right > .md-table-head-container {
            padding-right: 4px !important;
            text-align: right;

            & > .md-table-head-label {
                padding-right: 16px !important;
            }

            & > button {
                margin-left: 0;
            }
        }
    }

    .app-market__unavailable-for-guests {
        padding-top: 24px;
        margin-bottom: 16px !important;
        text-align: center;
        max-width: 100% !important;
    }

    .app-market__unavailable-for-guests-login-btn {
        margin: 0 auto 24px;
        display: block;
    }

    .art-market-tab__lists {
        width: 100%;
        display: flex;
        justify-content: space-between;
        @media (max-width: 1000px) {
            flex-direction: column;
        }

        .art-market-tab__list {
            width: 48%;
            @media (max-width: 1000px) {
                width: 100%;
            }
        }
    }
</style>
