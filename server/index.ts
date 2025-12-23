import {CloudflareEnvWithDnsService, CloudflareEnvWorkerInstance} from './cloudflare-env-worker-instance'
import {dealWithV2raySubscription} from './v2ray-subscription'
import {buildHeaderAppend, buildResponse, NamingMethod} from './response-util'
import {getRequestParams} from './request-util'
import {dealWithClashSubscription} from './clash-subscription'

export default {
	async fetch(request, env, ctx): Promise<Response>
    {
        // console.log('incoming | request', request, 'env', env, 'ctx', ctx)

        let ua: string | null = null
        const requestHeaders: Headers = request.headers
        if(requestHeaders.has('User-Agent'))
            ua = requestHeaders.get('User-Agent')
        else if(requestHeaders.has('user-agent'))
            ua = requestHeaders.get('user-agent')

        const isClashClient = ua?.includes('clash')

        const serviceDns: CloudflareEnvWorkerInstance = env.dns

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
                const params = await getRequestParams(url, request, method)

                // 要读取的订阅链接
                let link: string
                READ_PARAMS: try
                {
                    if(typeof params['link-b64'] === 'string' && params['link-b64'].trim().length > 0)
                    {
                        const linkB64 = params['link-b64'].trim()
                        link = atob(linkB64)
                        break READ_PARAMS
                    }
                    else if(typeof params['link'] === 'string' && params['link'].trim().length > 0)
                    {
                        link = params['link'].trim()
                        break READ_PARAMS
                    }

                    throw '参数模式错误'
                }
                catch (any)
                {
                    return buildResponse({
                        msg: '参数错误',
                        error: any,
                    }, 400)
                }

                const useRealDns: boolean = params['real'] == null || params['real'] === 'true' // 是否将订阅内容中所有域名转换为真实 IP
                const methodNaming: NamingMethod = params['naming'] == null ? 'suffix' : params['naming'] // 命名方式

                let headersAppend: Record<string, any>

                // 加载订阅内容
                let dataLink: string
                try
                {
                    const headers = new Headers()
                    if(ua != null) // 使用原始 UA 字符串作为查询参数
                        headers.append('User-Agent', ua)

                    const resultLink = await fetch(link, { method: 'GET', headers, })
                    dataLink = await resultLink.text()

                    // dataLink = yamlContent // todo 测试用

                    headersAppend = buildHeaderAppend(resultLink, methodNaming)
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
                    return buildResponse(dataLink, 200, headersAppend)
                }

                // 客户端要求使用真实 DNS, 开始根据不同情况处理订阅内容
                if(isClashClient)
                {
                    return await dealWithClashSubscription(dataLink, serviceDns, headersAppend)
                }
                else // v2ray
                {
                    return await dealWithV2raySubscription(dataLink, serviceDns)
                }

            default:
                return buildResponse({
                    msg: 'not service interface'
                }, 404)
        }
	},
// } satisfies ExportedHandler<Env>;
} satisfies ExportedHandler<CloudflareEnvWithDnsService>;
