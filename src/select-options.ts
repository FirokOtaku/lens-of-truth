import {readonly} from 'vue'
import type {NamingMethod} from '../server/response-util.ts'
import type {UserAgentMethod} from '../server/request-util.ts'

export interface SelectOption<TypeEntity>
{
    label: string
    value: TypeEntity
}

export const ListUserAgent = readonly<SelectOption<UserAgentMethod>[]>([
    {
        label: '自动',
        value: 'auto',
    },
    {
        label: 'YAML (C***)',
        // render: () => 'YAML',
        value: 'clash',
    },
    {
        label: 'Conf (S***)',
        // render: () => 'Conf',
        value: 'surge',
    },
    {
        label: 'Conf (S********)',
        value: 'surfboard',
    },
    {
        label: 'Base64 (V***)',
        // render: () => 'Base 64',
        value: 'v2ray',
    },
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
