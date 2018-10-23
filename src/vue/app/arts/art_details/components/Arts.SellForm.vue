<template>
    <div>
        <form @submit.prevent="submit" :id="`art-buy-form-${_uid}`">
            <div class="app__form-row">
                <input-field-unchained
                        v-model.trim="form.amount"
                        :label="i18n.art_buy_form_input_price()"
                        name="order-quote-amount"
                        min="0"
                        step="0.000001"
                        class="app__input"
                        v-validate="'required'"
                        :whiteAutofill="true"
                        type="number"
                        :errorMessage="inputErrorMsg"
                />
                <input-field-unchained
                        v-model.trim="form.price"
                        :label="i18n.art_price_per_token()"
                        name="order-quote-amount"
                        min="0"
                        step="0.000001"
                        class="app__input"
                        v-validate="'required'"
                        :whiteAutofill="true"
                        type="number"
                />
            </div>
        </form>
        <div class="app__form-actions">
            <button v-ripple
                    class="app__button-raised"
                    :disabled="!isValidForm"
                    :form="`art-buy-form-${_uid}`">
                {{ 'art_market_sell' | translate }}
            </button>

            <button v-ripple
                    class="app__button-flat"
                    @click="emitClose"
                    :disabled="isPending">
                {{ i18n.art_buy_form_button_cancel() }}
            </button>
        </div>
        <div class="sell-form__total-offer" v-if="+quoteAmount">
            {{ 'art_form_total_offer_sell' | translate({ asset: this.form.quoteAsset, amount: +quoteAmount })}}
        </div>
    </div>
</template>

<script>
  import InputField from '@/vue/common/fields/InputField'
  import FormMixin from '@/vue/common/mixins/form.mixin'
  import OrderMakerMixin from './order-maker.mixin'

  import {multiply} from '@/js/utils/math.util'
  import {confirmAction} from '@/js/modals/confirmation_message'
  import {i18n} from '@/js/i18n'
  import {issuanceService} from '@/js/services/issuances.service'

  import {ErrorHandler} from '@/js/errors/error_handler'
  import {translate} from '@/vue/common/filters/translate'

  const UPDATE_REQUEST_EVENT_NAME = 'art-update-request'
  const CLOSE_FORM_EVENT = 'close-form'

  export default {
    name: 'trade-orders-buy',
    mixins: [FormMixin, OrderMakerMixin],
    components: {InputField},
    props: {
      art: {type: Object, required: true},
      isCreator: {type: Boolean, required: false},
      quoteAssetCode: {type: String, required: false}
    },
    data () {
      return {
        form: {
          quoteAsset: this.quoteAssetCode || '',
          price: '',
          amount: ''
        },
        isValidForm: true,
        inputErrorMsg: '',
        i18n
      }
    },
    computed: {
      quoteAmount () {
        return multiply(this.form.amount, this.form.price)
      }
    },
    methods: {
      multiply,
      validateForm () {
        this.isValidForm = !(!+this.form.amount || this.isPending || !+this.form.price || +this.form.amount > this.art.max)
        if (+this.form.amount > this.art.max) {
          this.inputErrorMsg = this.i18n.art_buy_form_available_balance({
            amount: this.i18n.c(this.art.max),
            asset: ''
          })
        } else {
          this.inputErrorMsg = ''
        }
      },
      emitClose () {
        this.$emit(CLOSE_FORM_EVENT)
      },
      async submit () {
        if (!await confirmAction({message: translate('art_market_confirm_sell')})) return
        this.disable()
        const isUnissued = +this.art.issued === 0
        if (isUnissued && this.isCreator) {
          try {
            await issuanceService.createIssuanceRequest({
              token: this.art.code,
              amount: this.art.max,
              receiver: this.accountBalances[this.art.code].balance_id,
              reference: new Date().toString(),
              externalDetails: {},
              allTasks: 0
            })
          } catch (error) {
            ErrorHandler.processUnexpected(error)
            this.$emit(UPDATE_REQUEST_EVENT_NAME)
            return
          }
        }
        await this.createOrder({
          pair: {
            base: this.art.code,
            quote: this.quoteAssetCode
          },
          baseAmount: this.form.amount,
          quoteAmount: this.quoteAmount,
          price: this.form.price,
          isBuy: false
        })
        this.$emit(UPDATE_REQUEST_EVENT_NAME)
        this.resetForm()
        this.emitClose()
        this.enable()
      },
      resetForm () {
        this.form.price = ''
        this.form.amount = ''
      }
    },
    watch: {
      'form.price' () {
        this.validateForm()
      },
      'form.amount' () {
        this.validateForm()
      }
    }
  }
</script>

<style lang="scss" scoped>
    @import "~@scss/variables";

    .app__form-row .app__input {
        margin-left: 10px;
    }

    .sell-form__total-offer {
        color: $col-md-primary-inactive;
        position: absolute;
        bottom: 1.7rem;
        right: 1.25rem;
    }
</style>
