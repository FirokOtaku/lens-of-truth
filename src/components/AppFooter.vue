<style scoped>
.info-icon
{
  margin-right: 0;
}
</style>

<template>
  <n-flex justify="center" align="center" style="font-size: small;">
    <div class="flex-dynamic"></div>

    <n-icon color="grey" class="info-icon"><Info16Regular/></n-icon>
    <n-tooltip>
      <template #trigger>
        <n-a style="margin-right: 0.25rem;">
          LoT v{{ appVersion }}
        </n-a>
      </template>

      <div style="font-size: small">
        LoT Service <br>
        designed and developed by Firok <br>
        based on NaiveUI, Vue3 <br>
        hosting on Cloudflare Worker <br>
        open source under Mulan PSL v2 license <br>
      </div>
    </n-tooltip>

    <n-icon color="grey" class="info-icon"><Code16Regular/></n-icon>
    <n-tooltip>
      <template #trigger>
        <n-a style="margin-right: 0.25rem;"
             href="https://github.com/FirokOtaku/lens-of-truth"
             target="_blank"
        >
          GitHub Repo
        </n-a>
      </template>

      <div>
        <div>
          在 GitHub 查看此项目源码
        </div>
        <div style="font-size: small">
          当然, 由于这是一个自用服务,<br>
          你不会找到任何介绍或文档
        </div>
      </div>
    </n-tooltip>
  </n-flex>
</template>

<script setup lang="ts">
import {appVersion} from '../meta'
import {Code16Regular, Info16Regular, } from '@vicons/fluent'
</script>
