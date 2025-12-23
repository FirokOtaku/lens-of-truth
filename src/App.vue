<style>
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

#app {
background: linear-gradient(180deg,#536976,#292e49)
}

</style>
<style scoped>

.lot-title
{
  font-size: 4rem;
  font-family: Blackadder ITC, system-ui;
}
.lot-input
{
  background: transparent;
  backdrop-filter: blur(4px);
}

</style>

<template>
  <n-flex class="full" align="center" justify="center">
    <div>
      <n-flex justify="center">
        <div class="lot-title">
          Lens of Truth
        </div>
      </n-flex>

      <n-flex :vertical="false">
        <n-input class="lot-input"
                 v-model="valueInputUrl"
                 placeholder="输入链接" />

        <n-flex class="full-width" justify="end">
          <n-button type="info" ghost>
            <n-icon size="1rem">
              <Copy16Regular/>
            </n-icon>
            复制
          </n-button>
          <n-button type="primary" ghost>
            <n-icon>

            </n-icon>
            导入
          </n-button>
        </n-flex>
      </n-flex>
    </div>

  </n-flex>
</template>

<script setup lang="ts">

import { Copy16Regular, } from '@vicons/fluent'
import {ref, onMounted,} from 'vue'
import axios from 'axios'

const valueInputUrl = ref<any>('')

onMounted(async () => {

  // window.axios = axios
})


</script>
