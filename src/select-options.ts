import {readonly} from 'vue'

export const ListTarget = readonly([
    {
        label: '自动处理',
        value: 'auto',
    },
    {
        label: 'C****',
        value: 'clash',
    },
    {
        label: 'V****',
        value: 'v2ray',
    },
])
export const ListNamingMethod = readonly([
    {
        label: '名称追加后缀',
        value: 'suffix',
    },
    {
        label: '名称追加前缀',
        value: 'prefix',
    },
    {
        label: '名称不做处理',
        value: 'origin',
    },
])
