<template>
  <div class="create-bid">
    <template v-if="isLoading">
      <loader :message="i18n.art_modal_loading()"/>
    </template>

    <template v-else-if="art.code">
      <div class="create-bid__wrp">
        <div class="create-bid__art-img-wrp">
          <img :src="art.photoUrl" alt="">
        </div>

        <div class="create-bid__content">
          <h2 class="app__page-heading">
            {{ 'art_open_a_new_bid' | translate }}
            <br>
            <span class="create-bid__available-caption">
              {{ 'art_available' | translate }}
              {{ i18n.n(available) }}
              {{ art.code }}
            </span>

          </h2>

          <form id="create-bid-form" @submit.prevent="submit">
            <div class="app__form-row">
              <div class="app__form-field">
                <select-field-unchained :values="[code]"
                                        :value="code"
                                        :label="i18n.lbl_art()"
                                        :readonly="true"
                />
              </div>

              <div class="app__form-field">
                <input-field-unchained name="amount"
                                       step="1"
                                       type="number"
                                       v-model.trim="form.amount"
                                       v-validate="`required|amount|decimal:0|max_amount:${available}`"
                                       :label="i18n.lbl_amount()"
                                       :white-autofill="true"
                                       :disabled="isPending"
                                       :errorMessage="errors.first('amount')"
                />
              </div>
            </div>

            <template v-for="quoteAsset in quoteAssets">

              <div class="app__form-row">
                <div class="app__form-field create-bid__tick-wrp">
                  <tick-field v-model="form.quoteAssets"
                              :cbValue="quoteAsset"
                              :name="`quote-asset-${code}`"
                              :id="`quote-asset-${code}`"
                  >
                    {{ quoteAsset.code }}
                  </tick-field>

                  <div class="create-bid__quote-img-wrp">
                    <img :src="logoURLs[quoteAsset.code]" alt="">
                  </div>

                </div>

                <div class="app__form-field">
                  <input-field-unchained v-model.trim="quoteAsset.price"
                                         v-validate="'required|amount'"
                                         :key="`price-${quoteAsset.code}`"
                                         :data-vv-as="i18n.lbl_price()"
                                         :name="`price-${quoteAsset.code}`"
                                         :id="`price-${quoteAsset.code}`"
                                         :errorMessage="errors.first(`price-${quoteAsset.code}`)"
                                         :label="i18n.lbl_price()"
                                         :disabled="isPending || !form.quoteAssets.find(q => q.code === quoteAsset.code)"
                                         :white-autofill="true"
                  />
                </div>

                <div class="app__form-field create-bid__address-field">
                  <input-field-unchained v-model.trim="quoteAsset.address"
                                         v-validate="'required'"
                                         :key="`address-${quoteAsset.code}`"
                                         :data-vv-as="i18n.lbl_address()"
                                         :name="`address-${quoteAsset.code}`"
                                         :id="`address-${quoteAsset.code}`"
                                         :errorMessage="errors.first(`address-${quoteAsset.code}`)"
                                         :label="i18n.lbl_address()"
                                         :disabled="isPending || !form.quoteAssets.find(q => q.code === quoteAsset.code)"
                                         :white-autofill="true"
                  />
                </div>

              </div>
            </template>

            <div class="app__form-actions create-bid__actions">
              <button class="app__form-submit-btn"
                      form="create-bid-form"
                      v-ripple
                      type="submit"
                      :disabled="isPending"
              >
                {{ 'art_open' | translate }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </template>
    <template v-else>
      Something went wrong
    </template>
  </div>
</template>

<script>
  import FormMixin from '../../common/mixins/form.mixin'
  import Loader from '../common/Loader'

  import { ErrorHandler } from '../../../js/errors/error_handler'
  import { EventDispatcher } from '../../../js/events/event_dispatcher'
  import { i18n } from '../../../js/i18n'

  import { bidsService } from '../../../js/services/bids.service'
  import { issuanceService } from '../../../js/services/issuances.service'

  import { mapGetters, mapActions } from 'vuex'
  import { vuexTypes } from '../../../vuex/types'

  import { confirmAction } from '../../../js/modals/confirmation_message'
  import { Keypair } from 'tokend-js-sdk'

  import { artsService } from '@/js/services/arts.service'

  import _get from 'lodash/get'

  export default {
    components: { Loader },
    mixins: [FormMixin],
    props: ['code'],
    data: _ => ({
      art: '',
      isLoading: false,
      form: {
        amount: '',
        details: {},
        quoteAssets: []
      },
      i18n
    }),
    created () {
      this.loadArt(this.code)
    },
    computed: {
      ...mapGetters([
        vuexTypes.quoteAssetsInAtomicSwaps,
        vuexTypes.accountBalances,
        vuexTypes.accountId,
        vuexTypes.tokens
      ]),
      quoteAssets () {
        return this.quoteAssetsInAtomicSwaps
          .map(q => ({ code: q.code, name: q.name, price: '0', address: '' }))
      },
      logoURLs () {
        return this.quoteAssets.reduce((res, q) => {
          const token = this.tokens.find(t => t.code === q.code)
          res[q.code] = token ? token.logoURL : null
          return res
        }, {})
      },
      isNeededToIssue () {
        return +_get(this.accountBalances, `${this.art.code}.balance`) === 0 &&
          this.art.owner === this.accountId
      },
      available () {
        if (this.isNeededToIssue) {
          return this.art.available
        }
        return this.accountBalances[this.art.code].balance
      }
    },
    methods: {
      ...mapActions({
      }),
      async loadArt (code) {
        this.isLoading = true
        this.art = await artsService.get(code)
        this.isLoading = false
      },
      async submit () {
        if (!await this.isValid()) return
        if (!await confirmAction()) return
        this.disable()
        try {
          if (this.isNeededToIssue) {
            await issuanceService.createIssuanceRequest({
              token: this.art.code,
              amount: this.art.max,
              receiver: this.accountBalances[this.art.code].balance_id,
              reference: Keypair.random().accountId(),
              externalDetails: {},
              allTasks: 0
            })
          }
          await bidsService.createBid({
            balanceID: this.accountBalances[this.art.code].balance_id,
            amount: this.form.amount,
            fee: '0.0000000',
            details: {
              addresses: this.form.quoteAssets.reduce((res, q) => {
                res[q.code] = q.address
                return res
              }, {})
            },
            quoteAssets: this.form.quoteAssets.map(q => ({ ...q, asset: q.code }))
          })
          EventDispatcher.dispatchShowSuccessEvent(i18n.art_opened())
          this.$router.push({
            name: 'arts.art-details',
            params: {
              id: this.code
            }
          })
        } catch (e) { ErrorHandler.processUnexpected(e) }
        this.enable()
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@scss/variables";
  @import "~@scss/mixins";

  .create-bid {
    flex: 1;
    max-width: 60 * $point;
    width: 100%;
  }

  .create-bid__wrp {
    background: $col-md-block;
    border-radius: 5px;
    @include box-shadow;
  }

  .create-bid__content {
    padding: 1rem 2rem;
  }

  .create-bid__art-img-wrp {
    border-radius: 5px;
    margin-bottom: 1.5rem;
    width: 100%;

    img {
      border-radius: 5px 5px 0 0;
      object-fit: contain;
      width: 100%;
    }
  }

  .create-bid__actions {
    display: flex;
    justify-content: center;
  }

  .create-bid__quote-img-wrp {
    $size: 2rem;
    border-radius: 50%;
    @include box-shadow;
    border: 2px solid #fff;
    margin-left: 1rem;
    height: $size;
    width: $size;

    img {
      object-fit: cover;
      height: 100%;
      width: 100%;
    }
  }

  .create-bid__tick-wrp {
    display: flex;
    align-items: center;
    position: relative;
    top: .28rem;
  }

  .create-bid__available-caption {
    font-size: 1.2 * $point;
    color: $col-text-secondary;
  }
</style>
