<style scoped>
.qr-base
{
  height: 12rem;
  width: 100%;
}
</style>

<template>
  <n-flex class="qr-base" justify="center" align="center">
    <div style="border: 1px red solid">
      <img src="#" alt="QR Code">
    </div>

  </n-flex>
</template>

<script setup lang="ts">

import {debounce,} from 'lib-opal/lib/util.js'

const props = defineProps({
  link: { type: String, default: '', },
})

// todo 将链接计算为二维码


</script>
