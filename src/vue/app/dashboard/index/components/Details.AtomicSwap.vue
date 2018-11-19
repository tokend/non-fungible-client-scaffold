<template>
    <table class="app__table-details">
        <tr>
            <td>{{ i18n.lbl_date() }}</td>
            <td>{{ tx.dateFull }}</td>
        </tr>
        <tr>
            <td>{{ i18n.lbl_status() }}</td>
            <td>{{ tx.state }}</td>
        </tr>
        <tr>
            <td>{{ i18n.lbl_amount() }}</td>
            <td>{{ tx.amount | formatCurrency}}%</td>
        </tr>
        <tr>
            <td>{{ i18n.lbl_full_price() }}</td>
            <td>{{ tx.quoteAmount | formatCurrency}} {{tx.quoteAsset}}</td>
        </tr>

        <tr>
            <td>{{ i18n.lbl_from() }}</td>
            <td>{{ fromEmail }}</td>
        </tr>

        <tr>
            <td>{{ i18n.lbl_to() }}</td>
            <td>{{ toEmail }}</td>
        </tr>

        <tr>
            <td>{{ i18n.lbl_direction() }}</td>
            <td>{{ direction }}</td>
        </tr>

    </table>
</template>

<script>
  import DetailsMixin from './details.mixin'
  import { accountsService } from '@/js/services/accounts.service'
  import { mapGetters } from 'vuex'
  import { vuexTypes } from '@/vuex/types'

  export default {
    name: 'issuance-details',
    mixins: [DetailsMixin],
    data: _ => ({
      fromEmail: '-',
      toEmail: '-',
      direction: ''
    }),
    computed: {
      ...mapGetters([
        vuexTypes.userEmail,
        vuexTypes.accountId
      ]),
      id () {
        return this._uid
      }
    },
    methods: {
      async getEmail (id) {
        const email = await accountsService.loadMultipleAccountDetails([id])
        return email.data('users')[id].email
      }
    },
    async created () {
      this.fromEmail = this.accountId === this.tx.bidOwnerId ? this.userEmail : await this.getEmail(this.tx.bidOwnerId)
      this.toEmail = this.accountId === this.tx.purchaserId ? this.userEmail : await this.getEmail(this.tx.purchaserId)
      this.direction = this.accountId === this.tx.bidOwnerId ? this.i18n.lbl_incoming() : this.i18n.lbl_outcoming()
    }
  }
</script>

<style lang="scss" scoped>

</style>
