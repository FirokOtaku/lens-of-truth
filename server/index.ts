import textBase64 from '../src/demo'
import {readSubscribeContent, SubscribeContent} from './factory'
import {queryHostnameIp} from './dns'
import {CloudflareEnvWithDnsService, CloudflareEnvWorkerInstance} from './cloudflare-env-worker-instance'

function buildResponse(body: object | string, statusCode: number): Response
{
    //
    // text/plain; charset=UTF-8

    const headers = new Headers()
    headers.append('Access-Control-Allow-Origin', '*')
    headers.append('Cache-Control', 'private, no-cache')

    let bodyContent: string
    switch (typeof body)
    {
        case 'string':
            bodyContent = body
            headers.append('Content-Type', 'text/plain')
            break
        case 'object':
            bodyContent = JSON.stringify({
                ...(body ?? {}),
                code: statusCode,
            })
            headers.append('Content-Type', 'application/json')
            break
    }

    return new Response(bodyContent, {
        status: statusCode,
        headers,
    })
}

async function getParams(url: URL, request: Request, method: 'get' | 'post'): Promise<Record<string, any>>
{
    let params: Record<string, any> = {}

    switch (method)
    {
        case 'get':
        {
            params = {}
            for(const key of url.searchParams.keys())
            {
                params[key] = url.searchParams.get(key)
            }
            break
        }
        case 'post':
        {
            params = await request.json()
            break
        }
    }

    return params
}

export default {
	async fetch(request, env, ctx): Promise<Response>
    {
        console.log('incoming | request', request, 'env', env, 'ctx', ctx)

		const url = new URL(request.url)
        const pathname = url.pathname
        const method = request.method.toLocaleLowerCase()
        if(method !== 'get' && method !== 'post')
            return buildResponse({
                msg: 'method not allowed',
            }, 405)
        // env.dns.fetch()

        switch (pathname)
        {
            case '/api/reveal/':
            case '/api/reveal':
                const params = await getParams(url, request, method)

                const link: string | null = params['link'] // 要读取的订阅链接
                if(typeof link !== 'string' || link.trim().length === 0)
                    return buildResponse({
                        msg: '参数错误',
                        data: params,
                    }, 400)

                const useRealDns: boolean = params['real'] == null || params['real'] === 'true' // 是否将订阅内容中所有域名转换为真实 IP

                // 加载订阅内容
                let dataLink: string
                try
                {
                    const resultLink = await fetch(link, { method: 'GET'})
                    dataLink = await resultLink.text()
                }
                catch (any)
                {
                    return buildResponse({
                        msg: '链接无法访问, 请确认链接是否正确',
                    }, 424)
                }

                // 如果客户端没有特殊要求, 直接返回订阅内容
                if(!useRealDns)
                {
                    return buildResponse(dataLink, 200)
                }

                // 读取并处理订阅内容
                let subscribeContent: SubscribeContent
                let setLinkHostname: Set<string>
                try
                {
                    subscribeContent = readSubscribeContent(textBase64, 'auto', 'auto')
                    setLinkHostname = new Set<string>()
                    for(const link of subscribeContent.listLink)
                    {
                        setLinkHostname.add(link.url.hostname)
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
                    const serviceDns: CloudflareEnvWorkerInstance = env.dns
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
                for(const link of subscribeContent.listLink)
                {
                    const urlOrigin = link.url
                    const hostnameOrigin = urlOrigin.hostname
                    const hostnameToIp = mapHostnameToIp[hostnameOrigin]
                    const urlReplaceHost = link.replaceHost(hostnameToIp)
                    listUrlRelaceHost.push(urlReplaceHost)
                }

                // const charLineSeparator = '\r\n'
                const charLineSeparator = '\n'
                let content = ``
                for(const url of listUrlRelaceHost)
                {
                    const textUrl = url.toString()
                    switch(subscribeContent.formatLink)
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

                switch(subscribeContent.formatSubscription)
                {
                    case 'base64':
                        content = btoa(content)
                        break

                    case 'plain':
                    default:
                        break // do nothing
                }

                return buildResponse(content, 200)

            default:
                return buildResponse({
                    msg: 'not service interface'
                }, 404)
        }
	},
// } satisfies ExportedHandler<Env>;
} satisfies ExportedHandler<CloudflareEnvWithDnsService>;
