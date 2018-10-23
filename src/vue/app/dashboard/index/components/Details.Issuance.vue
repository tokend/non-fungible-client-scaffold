<template>
  <table class="app__table-details">
    <tr>
      <td>{{ i18n.lbl_date() }}</td>
      <td>{{ tx.dateFull }}</td>
    </tr>
    <tr>
      <td>{{ i18n.lbl_amount() }}</td>
      <td>{{ tx.amount | formatCurrency}}%</td>
    </tr>
    <tr>
      <td>{{ i18n.lbl_status() }}</td>
      <td>{{ tx.state === 'fully matched' ? 'success' : tx.state }}</td>
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
