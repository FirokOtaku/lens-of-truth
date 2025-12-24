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
    width: 95%;
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
        <app-title style="position: absolute; top: 0; left: 0;"/>
        <qr-code style="position: absolute; top: 0; left: 0;"/>
      </n-flex>
    </div>

    <n-flex class="flex-fixed full-width " justify="center" align="center" vertical>

      <div class="content-area">
        <n-input v-model="valueInputUrl"
                 placeholder="输入链接" />
      </div>

      <div class="content-area flex-horizontal" style="gap: 0.5rem">
        <div class="flex-dynamic">
          <n-select class="full-width"
                    :options="ListTarget"
                    v-model:value="valueInputTarget"/>
        </div>

        <n-button class="flex-fixed"
                  type="info" ghost>
          <n-icon size="1rem" class="btn-icon">
            <QrCode20Regular class="btn-icon"/>
          </n-icon>
          二维码
        </n-button>

        <n-tooltip placement="bottom">
          <template #trigger>
            <n-button type="info" ghost>
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

        <n-tooltip placement="bottom" v-if="valueInputTarget !== 'auto'">
          <template #trigger>
            <n-button type="primary" ghost>
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

        <div class="flex-dynamic"></div>

        <n-icon size="1rem" color="lightgrey">
          <Settings16Regular/>
        </n-icon>

        <div class="flex-fixed" style="width: 120px">
          <n-select size="tiny"
                    v-model:value="valueInputNamingMethod"
                    :options="ListNamingMethod"
                    :consistent-menu-width="false"
          />
        </div>

        <n-switch v-model:value="valueInputRealDns">
          <template #checked>
            使用真实 IP
          </template>
          <template #unchecked>
            不使用真实 IP
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
import {ref, onMounted, readonly} from 'vue'
import axios from 'axios'
import AppTitle from '@/components/AppTitle.vue'
import AppFooter from '@/components/AppFooter.vue'
import {ListTarget, ListNamingMethod} from './select-options'


const valueInputUrl = ref<any>('')
const valueInputTarget = ref<string>('auto')
const valueInputRealDns = ref<boolean>(true)
const valueInputNamingMethod = ref<string>('suffix')

onMounted(async () => {

  // window.axios = axios
})


</script>
