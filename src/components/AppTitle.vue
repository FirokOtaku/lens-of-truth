<style scoped>

.lot-title
{
  font-size: 4rem;
  @media screen and (max-width: 768px)
  {
    font-size: 3rem;
  }
  @media screen and (min-width: 1200px)
  {
    font-size: 5rem;
  }
  transition: font-size 0.8s ease,
              opacity 0.8s ease ;

  height: 12rem;
  width: 100%;
  padding: 0;
  margin: 0;

  position: relative;
  top: 0;
  left: 0;

  user-select: none;
}

.lot-title-zh, .lot-title-eng
{
  position: absolute;
  top: 0;
  left: 0;
  height: 12rem;
  width: 100%;
  text-align: center;
  line-height: 12rem;
  text-wrap: nowrap;

  transition: opacity 1.2s cubic-bezier(0.5, 0, 0.5, 1),
              color 1.2s cubic-bezier(0.5, 0, 0.5, 1),
              text-shadow 1.2s cubic-bezier(0.5, 0, 0.5, 1) ;
}

.lot-title-eng
{
  font-family: "Blackadder ITC", system-ui;
  text-shadow: grey 2px -2px;
}
.lot-title-zh
{
  font-family: "宋体", "SimSun", system-ui;
  text-shadow: grey 2px -2px;
  opacity: 0;
}

.lot-title:hover .lot-title-zh
{
  opacity: 1;
}
.lot-title:hover .lot-title-eng
{
  opacity: 0;
  color: lightgrey;
  text-shadow: grey 2px -1px,
  #fff 0 0 10px,
  #fff 0 0 20px,
  #fff 0 0 30px;
}

</style>

<template>
  <div class="lot-title" :style="viewStyleBase">

    <div class="lot-title-eng">
      Lens of Truth
    </div>

    <div class="lot-title-zh">
      真实透镜
    </div>
  </div>
</template>

<script setup lang="ts">

import {computed, type CSSProperties} from 'vue'

const props = defineProps({
  active: { type: Boolean, default: true, },
})

const viewStyleBase = computed(() => {
  return {
    opacity: props.active ? 1 : 0,
  } as CSSProperties
})

</script>
