
import 'lib-opal/lib/util.css'
import './main.css'
import { darkTheme } from 'naive-ui'

import { createApp } from 'vue'
import AppTheme from './AppTheme.vue'

const app = createApp(AppTheme)

app.mount('#app')
