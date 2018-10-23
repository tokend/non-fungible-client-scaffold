<template>
  <div class="provenance-tab">
    <template v-if="!isLoggedIn">
      <p class="provenance-tab__unavailable-for-guests
                app__page-explanations
                app__page-explanations--secondary">
        {{ 'art_provenance_tab_unavailable_title' | translate }}
      </p>
      <router-link
        tag="button"
        class="app__button-raised
               provenance-tab__unavailable-for-guests-login-btn"
        :to="{ name: 'login' }">
        {{ 'lbl_signin' | translate }}
      </router-link>
    </template>
    <template v-else-if="!isReady">
      <loader :message="'art_provenance_tab_loading' | translate"/>
    </template>
    <template v-else-if="!list.length">
      <div class="provenance-tab__no-list">
        <md-icon class="md-size-4x">inbox</md-icon>
        <p>{{ 'art_provenance_tab_no_provenance' | translate }}</p>
      </div>
    </template>
    <div class="provenance-tab__inner" v-else>
      <table class="provenance-tab__table">
        <tr>
          <th class="provenance-tab__table-cell
                     provenance-tab__table-cell--head">
            {{ 'art_date' | translate }}
          </th>
          <th class="provenance-tab__table-cell
                     provenance-tab__table-cell--head">
            {{ 'art_event' | translate }}
          </th>
        </tr>
        <template v-for="(item, i) in list">
          <tr :key="i" class="provenance-tab__table-row">
            <td class="provenance-tab__table-cell
                       provenance-tab__table-cell--head">
              {{ item.date }}
            </td>
            <td class="provenance-tab__table-cell">{{ item.eventDetails | eventString }}</td>
          </tr>
        </template>
      </table>
      <template v-if="!isAllFetched">
        <div class="provenance-tab__btn-wrp">
          <button class="app__button-flat"
                  :disabled="isPending"
                  @click="loadNext"
          >
            {{ 'lbl_view_more' | translate }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
  import { accountsService } from '@/js/services/accounts.service'
  import { parseTransaction } from '@/js/parsers/tx.parser'
  import config from '@/config'
  import get from 'lodash/get'

  import Loader from '@/vue/app/common/Loader'
  import NoDataMessage from '@/vue/common/messages/NoDataMessage'
  import { PublicMatchRecord } from '@/js/records/public.match.record'
  import { IssuanceRecord } from '@/js/records/issuance.record'
  import { mapGetters } from 'vuex'
  import { vuexTypes } from '@/vuex/types'
  import { i18n } from '@/js/i18n'

  const EVENT_TYPES = {
    issuance: 'issuance',
    matchRecord: 'matchRecord'
  }
  export default {
    name: 'ArtsProvenanceTab',
    props: ['art'],
    data: _ => ({
      paymentsList: [],
      next: _ => {},
      isAllFetched: false,
      isPending: false,
      PublicMatchRecord,
      IssuanceRecord,
      isReady: false
    }),
    async created () {
      if (this.isLoggedIn) await this.loadList()
      this.isReady = true
    },
    components: {
      Loader,
      NoDataMessage
    },
    filters: {
      eventString (eventDetails) {
        if (eventDetails.type === EVENT_TYPES.issuance) {
          return `${i18n.art_created_by()} ${eventDetails.creator} ${eventDetails.amount}%`
        }
        if (eventDetails.type === EVENT_TYPES.matchRecord) {
          return `${eventDetails.seller} ${i18n.art_sold()} ${eventDetails.email} ${eventDetails.amount}% ${i18n.art_for()} ${eventDetails.quoteAmount} ${eventDetails.quoteAsset}`
        }
      }
    },
    computed: {
      ...mapGetters([
        vuexTypes.isLoggedIn
      ]),
      creator () {
        return get(this.paymentsList[this.paymentsList.length - 2], 'fromAccounts[0].email')
      },
      list () {
        return this.paymentsList.reduce((payments, payment) => {
          if (payment instanceof IssuanceRecord) {
            payments.push({
              date: payment.date,
              eventDetails: {
                type: EVENT_TYPES.issuance,
                creator: this.creator,
                amount: +payment.amount
              }
            })
          }
          if (payment instanceof PublicMatchRecord) {
            if (payment.fromAccounts.length === 1 && payment.toAccounts.length >= 1) {
              payment.toAccounts.forEach(toAccount => {
                const seller = payment.fromAccounts[0].email || payment.fromAccounts[0].account_id
                payments.push({
                  date: payment.date,
                  eventDetails: {
                    type: EVENT_TYPES.matchRecord,
                    seller: seller,
                    email: toAccount.email,
                    amount: toAccount.amount,
                    quoteAmount: toAccount.quoteAmount,
                    quoteAsset: toAccount.quoteAsset
                  }
                })
              })
            }

            if (payment.toAccounts.length === 1 && payment.fromAccounts.length !== 1) {
              payment.fromAccounts.forEach(fromAccount => {
                const seller = fromAccount.email || fromAccount.account_id
                payments.push({
                  date: payment.date,
                  type: EVENT_TYPES.matchRecord,
                  eventDetails: {
                    type: EVENT_TYPES.matchRecord,
                    seller: seller,
                    email: payment.toAccounts[0].email,
                    amount: fromAccount.amount,
                    quoteAmount: fromAccount.quoteAmount,
                    quoteAsset: fromAccount.quoteAsset
                  }
                })
              })
            }
          }
          return payments
        }, [])
      }
    },
    methods: {
      async loadList () {
        this.isPending = true
        const response = await accountsService.loadPublicPayments(this.art.code)
        this.parseResponse(response)
        this.isPending = false
      },
      async loadNext () {
        this.isPending = true
        const response = this.next()
        await this.parseResponse(response)
        this.isPending = false
      },
      async parseResponse (response) {
        const records = response.records.map(r => parseTransaction(r, this.art.code, true))
        await this.loadEmails(records)
        this.paymentsList = this.paymentsList.concat(records)
        this.next = response.next
        this.isAllFetched = response.records.length < config.TRANSACTIONS_PER_PAGE
      },
      async loadEmails (records) {
        const accountIds = records
          .reduce((ids, record) => {
            switch (record.constructor) {
              case IssuanceRecord:
                ids.add(record.creator)
                break
              case PublicMatchRecord:
                record.toAccounts.map(toAccount => {
                  ids.add(toAccount.account_id)
                })
                record.fromAccounts.map(fromAccount => {
                  ids.add(fromAccount.account_id)
                })
                break
              default:
                break
            }
            return ids
          }, new Set())

        const details = (await accountsService.loadMultipleAccountDetails(accountIds)).data('users')
        records.forEach(record => {
          switch (record.constructor) {
            case IssuanceRecord:
              const email = get(details, `${record.creator}.email`)
              if (email) { record.creatorEmail = email }
              break
            case PublicMatchRecord:
              record.toAccounts.map(toAccount => {
                toAccount.email = get(details, `${toAccount.account_id}.email`)
              })
              record.fromAccounts.map(fromAccount => {
                fromAccount.email = get(details, `${fromAccount.account_id}.email`)
              })
              break
            default:
              break
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '~@scss/variables';

  .provenance-tab__table {
    color: $col-md-primary;
    border-collapse: collapse;
    width: 100%;
    max-width: 100%;
  }

  .provenance-tab__table-head {
    text-align: left;
  }

  .provenance-tab__inner {
    width: 100%;
    overflow-x: auto;
  }

  .provenance-tab__table-cell {
    border-radius: 10px;
    padding: 1 * $point 2 * $point;
    text-align: left;
    white-space: nowrap;

    &--head { border: none }
    &:first-child {
      padding-left: 0;
    }
  }

  .provenance-tab__btn-wrp {
    margin-top: 3 * $point;
    text-align: center;
  }

  .provenance-tab__no-list {
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

  .provenance-tab__unavailable-for-guests {
    padding-top: 24px;
    margin-bottom: 16px !important;
    text-align: center;
    max-width: 100% !important;
  }

  .provenance-tab__unavailable-for-guests-login-btn {
    margin: 0 auto 24px;
    display: block;
  }
</style>
