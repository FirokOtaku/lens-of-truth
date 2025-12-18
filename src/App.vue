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
import textBase64 from './demo'
import {readSubscribeContent} from '@/utils/factory.ts'
import axios from 'axios'
import {queryHostnameIp} from '@/utils/dns.ts'

const value = ref<any>(null)

onMounted(async () => {
  try
  {
    const listLink = readSubscribeContent(textBase64, 'auto', 'auto')
    const setLinkHostname = new Set<string>()
    for(const link of listLink)
    {
      setLinkHostname.add(link.url.hostname)
    }

    const mapHostnameToIp = await queryHostnameIp(setLinkHostname)

    value.value = {
      listLink,
      mapHostnameToIp,
    }

    console.log('value', value.value)
  }
  catch(any)
  {
    console.warn('错误', any)
  }

  window['axios'] = axios
})


</script>
