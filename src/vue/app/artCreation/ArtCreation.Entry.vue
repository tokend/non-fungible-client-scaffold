<template>
  <router-view/>
</template>

<script>
  import RouteEntryMixin from '../../common/mixins/route-entry'

  export default {
    name: 'art-creation',
    mixins: [RouteEntryMixin],
    data: _ => ({
      routes: [
        { path: '/art-creation/index', label: 'Creating art' }
      ]
    })
  }
</script>
