<style scoped>
.qr-base
{
  height: 12rem;
  width: 100%;
  transition: opacity 0.6s ease;
}
#canvas-base > canvas
{
  width: 100% !important;
  height: 100% !important;
}
</style>

<template>
  <n-flex class="qr-base"
          :style="viewStyleBase"
          justify="center"
          align="center"
  >
    <n-spin v-if="dataQrCode.status === 'loading'" size="large" />
    <div v-else-if="dataQrCode.status === 'failed'">
      加载失败
    </div>
    <n-flex align="center" justify="center" vertical
            v-else-if="dataQrCode.status === 'empty'">
      <div>
        <n-icon size="2rem" color="lightgrey">
          <AnimalCat16Regular/>
        </n-icon>
      </div>
      <div style="color: lightgrey">
        等待输入链接
      </div>
    </n-flex>
    <div v-show="dataQrCode.status === 'loaded'"
         id="canvas-base"
         style="width: 12rem; height: 12rem;">
      <canvas ref="domQrCode"
              style="" ></canvas>
    </div>

  </n-flex>
</template>

<script setup lang="ts">

import {debounce,} from 'lib-opal/lib/util'
import {computed, type CSSProperties, ref, watch, watchEffect, onMounted, } from 'vue'
import QRCode from 'qrcode'
import { AnimalCat16Regular, } from '@vicons/fluent'

const props = defineProps({
  link: { type: String, default: '', },
  active: { type: Boolean, default: true, },
})

const viewStyleBase = computed(() => {
  return {
    opacity: props.active ? 1 : 0,
  } as CSSProperties
})

// todo 将链接计算为二维码
const domQrCode = ref()

const dataQrCode = ref({ requestId: '', status: 'empty', })
async function updateQrCode(value: string, requestId: string): Promise<void>
{
  console.log('update qr code', value, requestId)
  if(value == null || value.trim() === '')
  {
    dataQrCode.value = { requestId, status: 'empty', }
    return
  }

  try
  {
    await QRCode.toCanvas(domQrCode.value, value, {
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#12264fFF', // 骐驎
        light: '#ebeee8FF', // 皦玉
      },
      // mode: 'alphanumeric',
    })
    if(dataQrCode.value.requestId !== requestId)
      return
    dataQrCode.value = { requestId, status: 'loaded', }
  }
  catch (any)
  {
    if(dataQrCode.value.requestId !== requestId)
      return
    dataQrCode.value = { requestId, status: 'failed', error: any, }
  }
}
watch(() => props.link, (newValue, oldValue) => {
  const requestId = Math.random() + '~' + Math.random()

  dataQrCode.value = { requestId, status: 'loading', }
  debounce('update-qr-code', () => {
    updateQrCode(newValue, requestId).finally(() => {})
  }, 500)()
})
onMounted(() => {
  updateQrCode(props.link, dataQrCode.value.requestId).finally(() => {})
})


</script>
