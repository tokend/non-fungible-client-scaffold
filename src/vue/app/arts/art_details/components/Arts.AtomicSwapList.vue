<template>
    <div class="art-market">
        <template v-if="bids">
            <template v-if="!activeBid">
                <template v-if="bids && bids.length">
                    <h3 class="art-market__heading">{{ 'art_active_bids' | translate }}</h3>
                    <md-table>
                        <md-table-row>
                            <md-table-head>{{ 'art_bid_available' | translate }}</md-table-head>
                            <md-table-head>{{ 'art_bid_opened' | translate }}</md-table-head>
                            <md-table-head></md-table-head>
                        </md-table-row>
                        <template v-for="(bid, i) in bids">
                            <md-table-row :key="`${i}-market-row`">
                                <md-table-cell>{{ i18n.c(bid.availableAmount) }}%</md-table-cell>
                                <md-table-cell>{{ bid.createdAt | humanizePastDate('DoMT') }}</md-table-cell>
                                <md-table-cell>
                                    <template v-if="bid.ownerId === accountId">
                                        <button class="app__button-icon"
                                                @click="cancelBid(bid)"
                                                :disabled="isPending">
                                            <md-icon class="art-market__cancel-icon">cancel</md-icon>
                                            <md-tooltip md-direction="right">{{ 'art_cancel_bid' | translate }}
                                            </md-tooltip>
                                        </button>
                                    </template>
                                    <template v-else-if="isLoggedIn">
                                        <button class="app__button-flat" @click="activeBid = bid">
                                            {{ 'art_market_buy' | translate }}
                                        </button>
                                    </template>
                                </md-table-cell>
                            </md-table-row>
                        </template>
                    </md-table>
                    <router-link class="app__button-flat art-market__sell-btn"
                                 v-if="isCanSell"
                                 tag="button"
                                 :to="{ name: 'bids.new', params: { code: art.code } }">
                        {{ 'art_market_sell' | translate }}
                    </router-link>
                </template>
                <template v-else>
                    <no-data-message icon-name="inbox"
                                     :msg-title="''"
                                     :msg-message="i18n.art_no_active_bids()"/>
                    <div class="art-market__btn" v-if="isCanSell">
                        <router-link tag="button" class="app__button-raised"
                                     :to="{ name: 'bids.new', params: { code: art.code } }">
                            {{ 'art_market_sell' | translate }}
                        </router-link>
                    </div>
                </template>
            </template>
            <template v-else>

                <h3 class="art-market__bid-heading">Bid #{{ activeBid.id }}</h3>
                <arts-buyer :bid="activeBid"
                            @cancel-click="activeBid = null"
                            @ask-created="activeBid = null; $emit('load-market')"
                            @cancel-bid="$emit('cancel-bid')"
                />
            </template>
        </template>
        <template v-else>
            {{ 'art_no_bids' | translate }}
        </template>
    </div>
</template>

<script>
  import ArtsBuyer from './Arts.Buyer'
  import FormMixin from '@/vue/common/mixins/form.mixin'
  import NoDataMessage from '@/vue/common/messages/NoDataMessage'

  import { ErrorHandler } from '@/js/errors/error_handler'
  import { bidsService } from '@/js/services/bids.service'
  import { mapGetters } from 'vuex'
  import { vuexTypes } from '@/vuex/types'
  import { i18n } from '@/js/i18n'
  import { confirmAction } from '@/js/modals/confirmation_message'

  export default {
    name: 'arts-atomic-swap-list',
    components: {
      ArtsBuyer,
      NoDataMessage
    },
    mixins: [FormMixin],
    props: {
      bids: {type: Array, require: true},
      isCanSell: {type: Boolean, require: true},
      art: {type: Object, require: true}
    },
    data: _ => ({
      i18n,
      activeBid: null
    }),
    computed: {
      ...mapGetters([
        vuexTypes.accountId,
        vuexTypes.isLoggedIn
      ])
    },
    methods: {
      async cancelBid (bid) {
        if (!await confirmAction()) return
        this.disable()
        try {
          await bidsService.cancelBid({
            bidID: bid.id
          })
          this.$emit('load-market')
        } catch (e) { ErrorHandler.processUnexpected(e) }
        this.enable()
      }
    }
  }
</script>

<style lang='scss'>
    @import "~@scss/variables";
    @import "~@scss/mixins";

    .art-market {
        position: relative;
        @include respond-to-custom(840px) {
            overflow-y: scroll;
        }
    }

    .art-market__heading,
    .art-market__bid-heading,
    .art-market__bid-record-cell {
        color: $col-md-primary;
    }

    .art-market__heading{
        margin-bottom: 15px;
        margin-left: 24px;
    }

    .art-market__bid-heading{
        margin-bottom: 15px;
        color: $col-md-primary;
    }

    .art-market__bid-record {
        margin-bottom: 4 * $point;
    }

    .art-market__bid-record-heading{
        height: 54px;
    }

    .art-market__bid-record-heading{
        height: 54px;
    }

    .art-market__bid-record-cell {
        $padding: 3 * $point;

        padding: 0 $padding 0 0;
        text-align: left;
        white-space: nowrap;
    }

    .art-market__back-btn {
        padding-left: 0;
        margin-left: -0.4rem;
        padding-top: 0;
    }

    .art-market__cancel-icon {
        color: $col-md-accent!important;
    }

    .art-market__btn {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-top: 3 * $point;
    }

    .art-market__sell-btn{
        position: absolute;
        top: -8px;
        right: 10px;
    }
</style>
