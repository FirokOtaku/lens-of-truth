<style>
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#app {
  background: linear-gradient(180deg,#536976,#292e49);
}

</style>
<style scoped>

.content-area
{
  width: 600px;
  @media screen and (max-width: 768px)
  {
    width: calc(100% - 1rem);
  }
  padding: 0 1rem;
}

.btn-icon
{
  margin-right: 0.25rem;
}
.horizontal-padding
{
  padding: 0 1rem;
}

</style>

<template>
  <n-flex class="full"
          justify="center"
          align="center"
          :vertical="true">
    <div class="flex-dynamic"></div>

    <div class="flex-fixed full-width">
      <n-flex align="center"
              justify="center"
              style="height: 12rem; position: relative; top: 0; left: 0;">
        <qr-code :active="uiShowQr"
                 :link="urlToUse"
                 style="position: absolute; top: 0; left: 0;"/>
        <app-title :active="!uiShowQr"
                   style="position: absolute; top: 0; left: 0;"/>
      </n-flex>
    </div>

    <n-flex class="flex-fixed full-width " justify="center" align="center" vertical>

      <div class="content-area">
        <n-input v-model:value="valueInputUrl"
                 placeholder="输入链接" />
      </div>

      <div class="content-area flex-horizontal" style="gap: 0.5rem">
        <div class="flex-dynamic">
          <n-select class="full-width"
                    :options="ListUserAgent"
                    :consistent-menu-width="false"
                    v-model:value="valueInputUserAgentMethod"/>
        </div>

        <n-tooltip placement="bottom">
          <template #trigger>
            <n-button type="info" ghost
                      @click="onClickCopy">
              <n-icon size="1rem" class="btn-icon">
                <Copy16Regular/>
              </n-icon>
              复制
            </n-button>
          </template>

          <div>
            将经过处理的链接复制到剪切板
          </div>
        </n-tooltip>

        <n-tooltip placement="bottom" v-if="valueInputUserAgentMethod !== 'auto' && valueInputUserAgentMethod !== 'v2ray'">
          <template #trigger>
            <n-button type="primary" ghost
                      @click="onClickImport">
              <n-icon size="1rem" class="btn-icon">
                <ArrowImport20Regular/>
              </n-icon>
              导入
            </n-button>
          </template>

          <div>
            将经过处理的链接导入到指定软件
          </div>
        </n-tooltip>

      </div>

      <n-flex class="content-area" align="center" style="gap: 0.5rem; ">

        <n-button class="flex-fixed"
                  type="info"
                  inline
                  :ghost="!uiShowQrHard"
                  @click="uiShowQrHard = !uiShowQrHard"
                  @mouseenter="uiShowQrSoft = true"
                  @mouseleave="uiShowQrSoft = false"
                  size="tiny"
        >
          <n-icon size="1rem" class="btn-icon">
            <QrCode20Regular class="btn-icon"/>
          </n-icon>
          二维码
        </n-button>

        <div class="flex-dynamic"></div>

        <n-icon size="0.75rem" color="lightgrey">
          <Settings16Regular/>
        </n-icon>

        <div class="flex-fixed" style="width: 110px">
          <n-select size="tiny"
                    v-model:value="valueInputNamingMethod"
                    :options="ListNamingMethod"
                    :consistent-menu-width="false"
          />
        </div>

        <n-switch class="flex-fixed" v-model:value="valueInputRealDns">
          <template #checked>
            安全 DNS
          </template>
          <template #unchecked>
            原始 host
          </template>
        </n-switch>

      </n-flex>

    </n-flex>

    <div class="flex-dynamic"></div>

    <div class="flex-fixed full-width"
         style="padding-right: 1.25rem; padding-bottom: 0.25rem">
      <app-footer/>
    </div>

  </n-flex>
</template>

<script setup lang="ts">

import {
  Copy16Regular,
  ArrowImport20Regular,
  QrCode20Regular,
  Code16Regular,
  Settings16Regular,
} from '@vicons/fluent'
import {ref, onMounted, readonly, computed} from 'vue'
import axios from 'axios'
import AppTitle from '@/components/AppTitle.vue'
import AppFooter from '@/components/AppFooter.vue'
import {ListUserAgent, ListNamingMethod} from './select-options'
import QrCode from '@/components/QrCode.vue'
import type {UserAgentMethod} from '../server/request-util.ts'
import type {NamingMethod} from '../server/response-util.ts'
import { useMessage } from 'naive-ui'

const message = useMessage()

const uiShowQrSoft = ref<boolean>(false)
const uiShowQrHard = ref<boolean>(false)
const uiShowQr = computed(() => uiShowQrSoft.value || uiShowQrHard.value)


const valueInputUrl = ref<string>('')
const valueInputUserAgentMethod = ref<UserAgentMethod>('auto')
const valueInputRealDns = ref<boolean>(true)
const valueInputNamingMethod = ref<NamingMethod>('suffix')

const urlToUse = computed(() => {
  const uaMethod: UserAgentMethod = valueInputUserAgentMethod.value
  const urlOrigin = valueInputUrl.value.trim()
  const real: boolean = valueInputRealDns.value
  const namingMethod: NamingMethod = valueInputNamingMethod.value

  if(urlOrigin === '')
    return ''

  const link = encodeURIComponent(urlOrigin)
  const serviceHost = window.location.host
  const serviceProtocol = window.location.protocol

  return `${serviceProtocol}//${serviceHost}/api/reveal?real=${real}&naming=${namingMethod}&ua=${uaMethod}&link=${link}`
})

async function onClickCopy()
{
  const link = urlToUse.value.trim()
  if(link === '')
  {
    message.error('请输入链接')
    return
  }

  await navigator.clipboard.writeText(link)
}
function onClickImport()
{
  const link: string = urlToUse.value.trim()
  const ua: UserAgentMethod = valueInputUserAgentMethod.value
  if(link === '')
  {
    message.error('请输入链接')
    return
  }
  if(ua === 'auto')
  {
    message.error('自动模式不支持导入')
    return
  }

  let linkCovered = ''
  switch (ua)
  {
    case 'clash':
      linkCovered = `clash://install-config?url=${encodeURIComponent(link)}`
      break
    case 'surge':
      linkCovered = `surge://install-config?url=${encodeURIComponent(link)}`
      break
    case 'v2ray': // todo
      linkCovered = `v2ray://${encodeURIComponent(link)}`
      break
  }

  const domLink = document.createElement('a')
  domLink.href = linkCovered
  domLink.target = '_blank'
  domLink.click()

  // window.open(link, '_blank')
}

onMounted(async () => {

  // window.axios = axios
})


</script>
