import {readV2raySubscribeContent, V2raySubscriptionContent} from './v2ray-factory'
import {buildResponse} from './response-util'
import {CloudflareEnvWorkerInstance} from './cloudflare-env-worker-instance'
import {queryHostnameIp} from './dns'
import {replaceHost} from './url-util'

export async function dealWithV2raySubscription(
    dataLink: string,
    serviceDns: CloudflareEnvWorkerInstance,
): Promise<Response>
{
    // 读取并处理订阅内容
    let subscriptionContent: V2raySubscriptionContent
    let setLinkHostname = new Set<string>()
    try
    {
        subscriptionContent = readV2raySubscribeContent(dataLink, 'auto', 'auto')
        for(const link of subscriptionContent.listLink)
        {
            setLinkHostname.add(link.hostname)
        }
    }
    catch(any)
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

    const listUrlRelaceHost: URL[] = []
    for(const urlOrigin of subscriptionContent.listLink)
    {
        const hostnameOrigin = urlOrigin.hostname
        const hostnameToIp = mapHostnameToIp[hostnameOrigin]
        if(hostnameToIp == null)
            continue
        const urlReplaceHost = replaceHost(urlOrigin, hostnameToIp)
        listUrlRelaceHost.push(urlReplaceHost)
    }

    // const charLineSeparator = '\r\n'
    const charLineSeparator = '\n'
    let content = ``
    for(const url of listUrlRelaceHost)
    {
        const textUrl = url.toString()
        switch(subscriptionContent.formatLink)
        {
            case 'content-b64':
                const indexUrlContent = textUrl.indexOf('//') + 2
                const textUrlContent = textUrl.substring(indexUrlContent)
                content += `${url.protocol}//${btoa(textUrlContent)}${charLineSeparator}`
                break
            case 'full-b64':
                const textContentB64 = btoa(textUrl)
                content += `${textContentB64}${charLineSeparator}`
                break

            case 'plain':
            default:
                content += `${textUrl}${charLineSeparator}`
                break
        }
    }

    switch(subscriptionContent.formatSubscription)
    {
        case 'base64':
            content = btoa(content)
            break

        case 'plain':
        default:
            break // do nothing
    }

    return buildResponse(content, 200)
}
