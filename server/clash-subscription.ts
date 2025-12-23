import {CloudflareEnvWorkerInstance} from './cloudflare-env-worker-instance'
import {buildResponse} from './response-util'
import YAML from 'yaml'
import {queryHostnameIp} from './dns'

export interface ProxyInfoItem
{
    name: string
    type: string
    server: string
    port: number
    cipher: string
    password: string
    udp: boolean
}

export interface ClashSubscriptionContentPartial
{
    proxies: ProxyInfoItem[]
}

export async function dealWithClashSubscription(
    dataLink: string,
    serviceDns: CloudflareEnvWorkerInstance,
    headersAppend: Record<string, any>,
): Promise<Response>
{
    // 读取并处理订阅内容
    let objYaml: ClashSubscriptionContentPartial
    const setLinkHostname = new Set<string>()
    try
    {
        objYaml = YAML.parse(dataLink)

        if(Array.isArray(objYaml.proxies) && objYaml.proxies.length > 0)
        {
            for(const proxyItem of objYaml.proxies)
            {
                const hostname = proxyItem.server
                setLinkHostname.add(hostname)
            }
        }
    }
    catch (any)
    {
        return buildResponse({
            msg: '无法处理的数据内容',
            error: any,
        }, 500)
    }

    let mapHostnameToIp: Record<string, string>
    try
    {
        mapHostnameToIp = await queryHostnameIp(setLinkHostname, serviceDns)
    }
    catch (any)
    {
        return buildResponse({
            msg: '查询真实 IP 出错',
            error: `${any}`,
        }, 500)
    }

    for(const proxyItem of objYaml.proxies)
    {
        const hostnameOrigin = proxyItem.server
        const hostnameToIp = mapHostnameToIp[hostnameOrigin]
        if(hostnameToIp == null)
            continue
        proxyItem.server = hostnameToIp
    }

    let content: string
    try
    {
        content = YAML.stringify(objYaml)
    }
    catch (any)
    {
        return buildResponse({
            msg: '无法序列化数据',
            error: any,
        }, 500)
    }

    return buildResponse(content, 200, headersAppend)
}
