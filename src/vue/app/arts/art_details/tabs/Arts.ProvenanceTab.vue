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
        <template v-else-if="isReady && !paymentsList.length">
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
                <template v-for="(item, i) in paymentsList">
                    <tr :key="i" class="provenance-tab__table-row">
                        <td class="provenance-tab__table-cell
                       provenance-tab__table-cell--head">
                            {{ item.dateFull }}
                        </td>
                        <td class="provenance-tab__table-cell">{{ item | eventString }}</td>
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

  import { Sdk } from '@/sdk'

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
        return `${eventDetails.bidOwnerEmail} ${i18n.art_sold()} ${eventDetails.purchaserEmail} ${i18n.c(eventDetails.amount)}% ${i18n.art_for()} ${i18n.c(eventDetails.quoteAmount)} ${eventDetails.quoteAsset}`
      }
    },
    computed: {
      ...mapGetters([
        vuexTypes.isLoggedIn,
        vuexTypes.userEmail,
        vuexTypes.accountId
      ])
    },
    methods: {
      async loadList () {
        this.isPending = true
        const response = await Sdk.horizon.operations.getPage({
          operation_type: 18,
          order: 'desc',
          limit: config.TRANSACTIONS_PER_PAGE
        })
        this.parseResponse(response)
        this.isPending = false
      },
      async loadNext () {
        this.isPending = true
        const response = await this.next()
        await this.parseResponse(response)
        this.isPending = false
      },
      async parseResponse (response) {
        let records = response.data
          .filter(r => r.atomicSwapDetails)
          .map(r => parseTransaction(r, this.art.code, true))
        records = await this.loadEmails(records)
        this.paymentsList = this.paymentsList.concat(records)
        this.next = response.fetchNext
        this.isAllFetched = records.length < config.TRANSACTIONS_PER_PAGE
      },
      async loadEmails (records) {
        const accountIds = records
          .reduce((ids, record) => {
            ids.add(record.bidOwnerId)
            ids.add(record.purchaserId)
            return ids
          }, new Set())
        const details = (await accountsService.loadMultipleAccountDetails(accountIds)).data('users')
        records.forEach(record => {
          record.bidOwnerEmail = record.bidOwnerId === this.accountId ? this.userEmail : get(details, `${record.bidOwnerId}.email`)
          record.purchaserEmail = record.purchaserId === this.accountId ? this.userEmail : get(details, `${record.purchaserId}.email`)
        })
        return records
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
