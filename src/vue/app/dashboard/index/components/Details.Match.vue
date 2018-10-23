<template>
  <table class="app__table-details">
    <tr>
      <td>{{ i18n.lbl_date() }}</td>
      <td>{{ tx.date }}</td>
    </tr>
    <tr>
      <td>{{ i18n.lbl_amount() }}</td>
      <td>{{ tx.baseAmount | formatCurrency}}%</td>
    </tr>
    <tr>
      <td v-if="tx.isBuy">{{ i18n.lbl_art_bought() }}</td>
      <td v-else>{{ i18n.lbl_art_sold() }}</td>
      <td>{{ `${i18n.c(tx.quoteAmount)} ${tx.quoteAsset}` }}</td>
    </tr>
    <tr>
      <td>{{ i18n.lbl_status() }}</td>
      <td>{{ tx.state === 'fully matched' ? 'success' : tx.state }}</td>
    </tr>
    <tr>
      <td>{{ i18n.lbl_art_fee() }}</td>
      <td>{{ tx.feePaid | formatCurrency}}</td>
    </tr>
  </table>
</template>

<script>
  import DetailsMixin from './details.mixin'

  export default {
    name: 'issuance-details',
    mixins: [DetailsMixin],
    computed: {
      id () {
        return this._uid
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
