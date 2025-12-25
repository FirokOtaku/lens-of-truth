<template>
  <n-config-provider :theme="darkTheme" class="full">

    <n-message-provider>
      <App />
    </n-message-provider>

  </n-config-provider>
</template>

<script>
import { defineComponent } from 'vue'
import { darkTheme } from 'naive-ui'
import App from '@/App.vue'

export default defineComponent({
  components: {App},
  setup() {
    return {
      darkTheme
    }
  }
})
</script>
