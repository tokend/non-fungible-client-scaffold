<template>
    <div>
        <template v-if="list.length">
            <template v-if="isBuy">
                {{ 'art_market_buy' | translate}}
            </template>
            <template v-else>
                {{ 'art_market_sell' | translate}}
            </template>
            <md-table>
                <md-table-row>
                    <md-table-head class="art-market-tab__list-cell">
                        {{ 'art_market_column_date' | translate }}
                    </md-table-head>
                    <md-table-head class="art-market-tab__list-cell">
                        {{ 'art_market_column_amount' | translate }}
                    </md-table-head>
                    <md-table-head class="art-market-tab__list-cell">
                        {{ 'art_market_column_price' | translate }}
                    </md-table-head>
                    <md-table-head class="art-market-tab__list-cell">
                        {{ 'art_market_column_offer' | translate }}
                    </md-table-head>
                    <md-table-head class="art-market-tab__list-cell
                              art-market-tab__list-cell--right"
                                   v-if="hasOffer">
                        {{ 'art_market_column_actions' | translate }}
                    </md-table-head>
                </md-table-row>
                <template v-for="(order, i) in list">
                    <md-table-row class="art-market-tab__list-row"
                                  :key="`${i}-market-row`">
                        <md-table-cell class="art-market-tab__list-cell">
                            {{ order.createdAt | formatDate }}
                        </md-table-cell>
                        <md-table-cell class="art-market-tab__list-cell">
                            {{ 'c' | translate(order.baseAmount) }}
                        </md-table-cell>
                        <md-table-cell class="art-market-tab__list-cell">
                            {{ 'c' | translate(order.price) }}
                            {{ order.quoteAssetCode }}
                        </md-table-cell>
                        <md-table-cell class="art-market-tab__list-cell">
                            {{ 'c' | translate(order.quoteAmount) }}
                            {{ order.quoteAssetCode }}
                        </md-table-cell>
                        <md-table-cell class="art-market-tab__list-cell
                                art-market-tab__list-cell--right">
                            <template v-if="order.owner === accountId">
                                <button v-ripple
                                        class="app__button-flat
                            art-market-tab art-market-tab__cancel-btn"
                                        :disabled="isPending"
                                        @click="cancelOrder(order)"
                                >
                                    {{ 'art_market_cancel_order_btn' | translate }}
                                </button>
                            </template>
                        </md-table-cell>
                    </md-table-row>
                </template>
            </md-table>
        </template>
        <template v-else>
            <div class="art-market-tab__list-no-transactions">
                <md-icon class="md-size-4x">inbox</md-icon>
                <p>
                    <template v-if="isBuy">
                        {{ 'art_market_no_orders_message' | translate({ asset: quoteAsset }) }}
                    </template>
                    <template v-else>
                        {{ 'art_market_no_sell_orders_message' | translate({ asset: quoteAsset }) }}
                    </template>
                </p>
                <div class="art-market-tab__list-no-transactions-btn">
                    <template v-if="isBuy">
                        <template v-if="isCanBuy && !isFormShown">
                            <button class="app__button-raised"
                                    v-if="isCanBuy && !isFormShown"
                                    @click="showForm"
                                    :disabled="isPending || hasOffer">
                                {{ 'art_market_buy_btn' | translate }}
                            </button>
                        </template>
                    </template>
                    <template v-if="!isBuy">
                        <button class="app__button-raised"
                                v-if="isCanSell && !isFormShown"
                                @click="showForm"
                                :disabled="isPending || hasOffer">
                            {{ 'art_market_sell_btn' | translate }}
                        </button>
                    </template>
                </div>
            </div>
        </template>
        <div class="art-market-tab__btns">
            <template v-if="isCanBuy && list.length && !isFormShown && isBuy">
                <div class="art-market-tab__actions-wrp">
                    <button class="app__button-raised art-market-tab__list-action-btn"
                            @click="showForm"
                            :disabled="isPending || hasOffer">
                        {{ 'art_market_buy_btn' | translate }}
                    </button>
                </div>
            </template>
            <template v-if="isCanSell && list.length && !isFormShown && !isBuy">
                <button class="app__button-raised art-market-tab__list-action-btn"
                        @click="showForm"
                        :disabled="isPending">
                    {{ 'art_market_sell_btn' | translate }}
                </button>
            </template>
            <template v-if="hasOffer && isBuy">
                <div class="art-market-tab__actions-wrp">
                    <p class="art-market-tab__has-offers-msg">
                        {{ 'art_only_one_offer_allowed' | translate }}
                    </p>
                </div>
            </template>
        </div>
        <template v-if="!isCanBuy && isBuy">
            <p class="art-market-tab__list-explanations
                      app__page-explanations
                      app__page-explanations--secondary">
                {{ 'art_market_trade_unavailable_for_artists' | translate }}
            </p>
        </template>
    </div>
</template>

<script>
  import {commonEvents} from '@/js/events/common_events'

  const CANCEL_ORDER_EVENT_NAME = 'cancel-order'
  export default {
    name: 'trade-orders-buy',
    mixins: [],
    components: {},
    props: {
      list: {type: Array, required: true},
      isFormShown: {type: Boolean, required: true},
      isBuy: {type: Boolean, required: true},
      isCanBuy: {type: Boolean, required: true},
      isCanSell: {type: Boolean, required: true},
      hasOffer: {type: Boolean, required: true},
      isPending: {type: Boolean, required: true},
      quoteAsset: {type: String, required: true},
      accountId: {type: String, required: true}
    },
    methods: {
      showForm () {
        this.$emit(commonEvents.showMakeOfferFormEvent, this.isBuy)
      },
      cancelOrder (order) {
        this.$emit(CANCEL_ORDER_EVENT_NAME, order)
      }
    }
  }
</script>

<style lang="scss" scoped>
    .art-market-tab__btns {
        display: flex;
    }
</style>
