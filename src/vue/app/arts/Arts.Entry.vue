<template>
  <router-view/>
</template>

<script>
  import RouteEntryMixin from '@/vue/common/mixins/route-entry'

  export default {
    name: 'arts',
    mixins: [RouteEntryMixin],
    data: _ => ({
      routes: [
        { path: '/arts/explore', label: 'Explore arts' }
      ]
    })
  }
</script>

<style scoped>

</style>
