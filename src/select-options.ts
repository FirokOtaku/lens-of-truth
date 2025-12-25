import {readonly} from 'vue'
import type {NamingMethod} from '../server/response-util.ts'
import type {UserAgentMethod} from '../server/request-util.ts'

export interface SelectOption<TypeEntity>
{
    label: string
    value: TypeEntity
}

export const ListTarget = readonly<SelectOption<UserAgentMethod>[]>([
    {
        label: '自动处理',
        value: 'auto',
    },
    {
        label: 'C****',
        value: 'clash',
    },
    // {
    //     label: 'V****',
    //     value: 'v2ray',
    // },
])

export const ListNamingMethod = readonly<SelectOption<NamingMethod>[]>([
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
