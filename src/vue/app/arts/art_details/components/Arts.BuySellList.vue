<template>
    <div>
        <template v-if="list.length">
            <h3 class="art-market__heading">
                <template v-if="isBuy">
                    {{ 'art_market_buy' | translate}}
                </template>
                <template v-else>
                    {{ 'art_market_sell' | translate}}
                </template>
            </h3>
            <md-table>
                <md-table-row>
                    <md-table-head>{{ 'art_market_column_date' | translate }}</md-table-head>
                    <md-table-head>{{ 'art_bid_available' | translate }}</md-table-head>
                    <md-table-head v-if="hasOffer">{{ 'art_market_column_actions' | translate }}</md-table-head>
                </md-table-row>
                <template v-for="(order, i) in list">
                    <md-table-row :key="`${i}-market-row`">
                        <md-table-cell>{{ order.createdAt | humanizePastDate }}</md-table-cell>
                        <md-table-cell>{{ 'c' | translate(order.baseAmount) }}%</md-table-cell>
                        <md-table-cell>
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
                <no-data-message v-if="isBuy"
                        icon-name="inbox"
                        :msg-title="''"
                        :msg-message="i18n.art_market_no_orders_message({ asset: quoteAsset })"/>
                <no-data-message v-else
                        icon-name="inbox"
                        :msg-title="''"
                        :msg-message="i18n.art_market_no_sell_orders_message({ asset: quoteAsset })"/>
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
            <template v-if="isCanBuy && list.length && !isFormShown && isBuy && !hasOffer">
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
    </div>
</template>

<script>
  import { commonEvents } from '@/js/events/common_events'
  import NoDataMessage from '@/vue/common/messages/NoDataMessage'
  import { i18n } from '@/js/i18n'

  const CANCEL_ORDER_EVENT_NAME = 'cancel-order'
  export default {
    name: 'trade-orders-buy',
    mixins: [],
    components: {
      NoDataMessage
    },
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
    data: _ => ({
      i18n
    }),
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
    @import "~@scss/variables";
    @import "~@scss/mixins";

    .art-market-tab__btns {
        display: flex;
    }

    .art-market-tab__list-row {
        cursor: pointer;
    }

    .art-market-tab__cancel-btn {
        margin-left: -18px;
    }

    .art-market-tab__actions-wrp {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin-top: 2 * $point;
        padding-left: 24px;

        & > .art-market-tab__list-action-btn {
            margin-top: 0;
            flex-shrink: 0;
        }
    }

    .art-market-tab__list-no-transactions-btn {
        margin-top: 3 * $point;
    }

    .art-market__heading{
        margin-left: 24px;
        margin-bottom: 15px;
        color: $col-md-primary;
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
</style>
