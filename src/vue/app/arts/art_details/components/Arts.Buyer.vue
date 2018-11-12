<template>
    <div class="ticket-market">
        <template v-if="!activeQuote">
            <div class="ticket-market__quotes">
                <template v-for="q in bid.quoteAssets">
                    <div class="ticket-market__quote-wrp">
                        <button @click="activeQuote = q">
                            <quote-viewer :quote="q"/>
                        </button>
                    </div>
                </template>
            </div>
            <button class="app__button-flat" @click="$emit('cancel-click')">Back</button>
        </template>
        <template v-else>

            <form @submit.prevent="submit">
                <div class="ticket-market__form-wrp">
                    <div class="ticket-market__available-wrp">
                        <p class="ticket-market__available-msg">
                            {{ 'art_available' | translate }}:
                            {{ i18n.n(bid.availableAmount) }}%
                        </p>
                    </div>

                    <div class="ticket-market__field-wrp">
                        <input-field-unchained class="md-layout-item"
                                               name="quote-amount" type="number" step="0.00001" min="0"
                                               v-model.trim="form.amount"
                                               v-validate="`required|amount|max_arts_amount:${bid.availableAmount}`"
                                               :data-vv-as="i18n.lbl_amount()"
                                               :label="i18n.lbl_amount()"
                                               :whiteAutofill="true"
                                               :errorMessage="errorMessage('quote-amount')"
                        />
                    </div>

                    <div class="ticket-market__converted-wrp">
            <span class="ticket-market__quote-amount">
              {{ i18n.c(quoteAmount) }}
              {{ activeQuote.asset }}
            </span>
                        <div class="ticket-market__quote-img-wrp">
                            <img :src="activeToken.logoURL" alt="">
                        </div>
                    </div>
                </div>

                <div class="ticket-market__actions">
                    <button class="app__button app__button-flat"
                            type="button"
                            @click="activeQuote = null">
                        {{ 'lbl_cancel' | translate }}
                    </button>
                    <button class="app__button-raised"
                            type="submit"
                            :disabled="isPending">
                        {{ 'lbl_submit' | translate }}
                    </button>
                </div>
            </form>
        </template>

        <md-dialog :md-active.sync="isDialogOpened">
            <div class="app__dialog-inner">
                <template v-if="succeededRequest">
                    <swap-address :request="succeededRequest" :bid="bid" @close="isDialogOpened = false"/>
                </template>
                <template v-else>{{ 'art_something_went_wrong' | translate }}</template>
            </div>
        </md-dialog>
    </div>
</template>

<script>
  import {RecordFactory} from '@/js/records/factory'
  import FormMixin from '@/vue/common/mixins/form.mixin'
  import QuoteViewer from './Arts.QuoteViewer'
  import SwapAddress from './Arts.AddressViewer'

  import { Sdk } from '@/sdk'
  import {i18n} from '@/js/i18n'
  import {ErrorHandler} from '@/js/errors/error_handler'
  import {bidsService} from '@/js/services/bids.service'
  import {confirmAction} from '@/js/modals/confirmation_message'
  import {multiply} from '@/js/utils/math.util'
  import {mapGetters} from 'vuex'
  import {vuexTypes} from '@/vuex/types'
  import {EventDispatcher} from '@/js/events/event_dispatcher'
  import {REQUEST_STATES_STR} from '@/js/const/const'

  export default {
    mixins: [FormMixin],
    components: {QuoteViewer, SwapAddress},
    props: ['bid'],
    data: _ => ({
      i18n,
      activeQuote: null,
      form: {
        amount: ''
      },
      isDialogOpened: false,
      succeededRequest: null
    }),
    created () {
    },
    computed: {
      ...mapGetters([
        vuexTypes.tokens,
        vuexTypes.accountBalances
      ]),
      quoteAmount () {
        if (!this.activeQuote) {
          return
        }
        return multiply(this.form.amount, this.activeQuote.price)
      },
      activeToken () {
        if (!this.activeQuote) return ''
        return this.tokens.find(t => t.code === this.activeQuote.asset)
      },
      available () {
        if (!this.activeQuote) return ''
        return this.accountBalances[this.activeQuote.asset].balance
      }
    },
    methods: {
      async submit () {
        if (!await this.isValid()) return
        if (!await confirmAction()) return
        this.disable()
        try {
          const response = await bidsService.createASwapRequest({
            bidID: this.bid.id,
            baseAmount: this.form.amount,
            quoteAsset: this.activeQuote.asset
          })
          const requestId = response.askRequestID()
          await this.tryDeriveAddress(requestId)
        } catch (e) {
          ErrorHandler.processUnexpected(e)
        }
        this.$emit('cancel-bid')
        this.enable()
      },
      async tryDeriveAddress (requestId) {
        let request = {}
        let response
        await new Promise((resolve) => {
          window.setTimeout(resolve, 300)
        })
        while (!request.address) {
          if (request.state === REQUEST_STATES_STR.rejected ||
            request.state === REQUEST_STATES_STR.permanentlyRejected) {
            EventDispatcher.dispatchShowErrorEvent('Sorry, your request is invalid in some way')
            return
          }
          await new Promise((resolve) => {
            window.setTimeout(resolve, 5000)
          })
          response = await Sdk.horizon.request.get(requestId)
          request = RecordFactory.createASwapRequestRecord(response.data)
        }
        this.succeededRequest = request
        this.isDialogOpened = true
      }
    },
    watch: {
      isDialogOpened (v) {
        if (!v && this.succeededRequest) {
          this.succeededRequest = null
          this.activeQuote = null
          this.$emit('ask-created')
        }
      }
    }
  }
</script>

<style lang='scss'>
    @import "~@scss/variables";

    .ticket-market__form-wrp {
        display: flex;
        flex-direction: column;
        margin-bottom: 2rem;
    }

    .ticket-market__available-wrp {
        margin-bottom: .5rem;
    }

    .ticket-market__available-msg {
        color: $col-unfocused;
    }

    .ticket-market__field-wrp {
        margin-bottom: .5rem;
    }

    .ticket-market__swap-icon {
        margin: 0 1rem;
    }

    .ticket-market__actions {
        text-align: right;
    }

    .ticket-market__quotes {
        display: flex;
        flex-wrap: wrap;
    }

    .ticket-market__quote-wrp {
        margin-right: 1rem;
        margin-bottom: 1rem;
        width: 7rem;

        button {
            border: none;
            background: none;
            cursor: pointer;
            transition: .2s;

            &:hover {
                background: lightgray;
            }
        }
    }

    .ticket-market__quote-img-wrp {
        $size: 1rem;
        height: $size;
        width: $size;

        display: inline-block;
        position: relative;
        bottom: .12rem;
        margin: 0 .25rem;
        img {
            width: 100%;
            height: 100%;
        }
    }

</style>
