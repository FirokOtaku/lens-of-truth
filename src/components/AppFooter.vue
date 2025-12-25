<style scoped>

</style>

<template>
  <n-flex justify="center" align="center">
    <div class="flex-dynamic"></div>
    <div class="flex-fixed">

      <span style="color: dimgray; margin-right: 0.75rem">
        LoT v{{ appVersion }}, based on NaiveUI
      </span>

      <n-tooltip>
        <template #trigger>
          <n-a href="https://github.com/FirokOtaku/lens-of-truth"
               target="_blank"
          >
            <n-icon size="1rem"
                    class="btn-icon">
              <Code16Regular/>
            </n-icon>
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
    </div>
  </n-flex>
</template>

<script setup lang="ts">
import {appVersion} from '../meta'
import {Code16Regular} from '@vicons/fluent'
</script>
