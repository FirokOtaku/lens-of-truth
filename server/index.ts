import textBase64 from '../src/demo'
import {readSubscribeContent, SubscribeContent} from './factory'
import {queryHostnameIp} from './dns'
import {AbstractLink} from './abstract-link'

const ResponseHeaders = new Headers()
ResponseHeaders.append('Content-Type', 'application/json')
ResponseHeaders.append('Access-Control-Allow-Origin', '*')
function buildResponse(body: object | string, statusCode: number): Response
{
    let bodyContent: string
    switch (typeof body)
    {
        case 'string':
            bodyContent = body
            break
        case 'object':
            bodyContent = JSON.stringify({
                ...(body ?? {}),
                code: statusCode,
            })
            break
    }

    return new Response(bodyContent, {
        status: statusCode,
        headers: ResponseHeaders,
    })
}

async function getParams(url: URL, request: Request, method: 'get' | 'post'): Record<string, any>
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
                const params = getParams(url, request, method)

                const link: string | null = params['link'] // 要读取的订阅链接
                if(typeof link !== 'string' || link.trim().length === 0)
                    return buildResponse({
                        msg: '参数错误',
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
                    const serviceDns: object = env.dns
                    mapHostnameToIp = await queryHostnameIp(setLinkHostname, serviceDns)
                }
                catch (any)
                {
                    return buildResponse({
                        msg: '查询真实 IP 出错',
                        error: any,
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

                return buildResponse({}, 200)

            default:
                return buildResponse({
                    msg: 'not service interface'
                }, 404)
        }
	},
} satisfies ExportedHandler<Env>;
