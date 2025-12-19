<style>
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>
<style scoped>

</style>

<template>
  <div class="full flex-vertical">
    <div class="flex-fixed">
      <n-flex size="large">
        <n-page-header title="Lens of Truth" subtitle="微型自用服务">
        </n-page-header>
      </n-flex>
    </div>

    <div class="flex-dynamic">
      <pre>{{ value }}</pre>
    </div>

    <div class="flex-fixed">
      123
    </div>

  </div>
</template>

<script setup lang="ts">

import {ref, onMounted,} from 'vue'
import axios from 'axios'

const value = ref<any>(null)

onMounted(async () => {

  window['axios'] = axios
})


</script>
