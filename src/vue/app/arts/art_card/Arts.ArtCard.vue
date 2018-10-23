<template>
  <div class="art-card">
    <div class="art-card__image-wrp">
      <img :src="art.photoUrl" :alt="art.name">
    </div>

    <div class="art-card__content">
      <div class="art-card__header">
        <h3 class="art-card__name">{{ art.name }}</h3>
      </div>
      <p class="art-card__description">{{ art.description }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'art-card',
  props: ['art'],
  data: _ => ({
  }),
  computed: {
  },
  methods: {

  }
}
</script>

<style lang="scss" scoped>
@import "../../../../scss/variables";
@import "../../../../scss/mixins";

$padding-side: 20px;

$ratio_16: 100%;
$ratio_9: $ratio_16 * (9/16);

.art-card {
  font-weight: 200;
  overflow: hidden;
  position: relative;
  width: $ratio_16;
  color: $col-md-primary;

  &:before {
    bottom: 0;
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }
}

.art-card__image-wrp {
  position: relative;
  padding-bottom: $ratio_9;
  padding-top: 15px;

  img {
    position: absolute;
    object-fit: contain;
    width: 100%;
    height: 100%;
  }
}

.art-card__content {
  padding: 1.2rem 1rem;
  height: 7.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.art-card__name {
  font-weight: 200;
}

.art-card__header {
  position: relative;
}

.art-card__syndicate {
  color: $col-active;
  font-style: italic;
}

.art-card__syndicate,
.art-card__description {
  font-size: $fs-tip;
}

.art-card__description {
  $line-height: 1.15rem;
  $max-lines: 3;
  text-align: justify;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: $max-lines;
  -webkit-box-orient: vertical;
  line-height: $line-height;
  max-height: 3.45rem;
  min-height: 3.45rem;
}

.art-card__state-tip {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.5rem 3rem;
  transform: translate(32%, 33%) rotate(45deg);
  color: $col-msg-text;

  &--upcoming {
    background: $col-pending;
  }
  &--finished {
    background: $col-success;
  }
  &--cancelled {
    background: $col-danger;
  }
}
</style>
