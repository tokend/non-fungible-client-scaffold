<template>
  <router-view/>
</template>

<script>
  import RouteEntryMixin from '../../common/mixins/route-entry'

  export default {
    name: 'bids',
    mixins: [RouteEntryMixin],
    data: _ => ({
      routes: [
        { path: '/bid/create', label: 'Create bid' }
      ]
    })
  }
</script>

<style scoped>

</style>
