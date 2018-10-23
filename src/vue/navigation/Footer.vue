<template>
  <footer class="footer"
         :class="{ 'footer--private': isSidebarBackground }">
    <span class="footer__item footer__text">{{ i18n.auth_copyright() }}</span>
  </footer>
</template>

<script>
import { vueRoutes } from '../../vue-router/const'
import { i18n } from '../../js/i18n'

export default {
  name: 'Footer',
  data: _ => ({
    vueRoutes,
    i18n
  }),
  props: {
    isSidebarBackground: false
  }
}
</script>

<style lang="scss" scoped>
@import "~@scss/variables";
@import "~@scss/mixins";

.footer {
  position: absolute;
  display: flex;
  align-items: center;
  flex-wrap: wrap-reverse;
  justify-content: center;
  bottom: 0;
  left: 0;
  width: 100%;
  color: $col-md-primary-inactive;
  background-color: $col-md-background;
  box-shadow: 0 0 3px 2px $col-md-background;
  &--private {
    background-color: #e9eaed;
    box-shadow: 0 0 3px 2px #e9eaed;
  }
}

.footer__text {
  line-height: 2.5 * $point;
}
</style>
