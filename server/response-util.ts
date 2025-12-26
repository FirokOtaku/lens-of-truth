import type {UserAgentMethod} from './request-util.ts'
import {appVersion} from './server-meta.ts'

const DefaultNamingSuffix = encodeURIComponent(' - LoT 🪞')
const DefaultNamingPrefix = encodeURIComponent('🪞 LoT - ')

export type NamingMethod =
/**
 * 默认处理方式. 会在订阅名追加 LoT 后缀
 * */
    'suffix' |

    /**
     * 在订阅名追加 LoT 前缀
     * */
    'prefix' |

    /**
     * 使用原始订阅名
     * */
    'origin'


export function buildHeaderAppend(
    response: Response,
    methodNaming: NamingMethod,
    ua: UserAgentMethod,
): Record<string, any>
{
    const headersAppend: Record<string, any> = {}

    const responseHeaders = response.headers
    // 响应头描述 https://doc.clashforwindows.app/urlscheme/
    headersAppend['Content-Disposition'] =
        responseHeaders.get('Content-Disposition') ??
        responseHeaders.get('content-disposition') ??
        undefined
    headersAppend['Profile-Update-Interval'] =
        responseHeaders.get('Profile-Update-Interval') ??
        responseHeaders.get('profile-update-interval') ??
        undefined
    headersAppend['Profile-Web-Page-Url'] =
        responseHeaders.get('Profile-Web-Page-Url') ??
        responseHeaders.get('profile-web-page-url') ??
        undefined
    headersAppend['Subscription-Userinfo'] =
        responseHeaders.get('Subscription-Userinfo') ??
        responseHeaders.get('subscription-userinfo') ??
        undefined

    // 处理响应头里面的 Content-Disposition
    PARSE_NAME: try
    {
        const valueOrigin: string | null = headersAppend['Content-Disposition']
        if(valueOrigin == null)
            break PARSE_NAME

        let filenameOrigin: string | null = null

        if(valueOrigin.startsWith('attachment;'))
        {
            const parts: string[] = valueOrigin.split(';')
            if(parts.length > 1)
            {
                // 转换键值对
                const map: Record<string, string> = {}
                for(let step = 1; step < parts.length; step++)
                {
                    const part: string = parts[step] as string // filename=xxxx
                    const indexCharEqual = part.indexOf('=')
                    if(indexCharEqual <= 0)
                        continue
                    const kvpKey = part.substring(0, indexCharEqual).trim() // filename
                    const kvpValue = part.substring(indexCharEqual + 1).trim() // xxxx
                    map[kvpKey] = kvpValue
                }

                if(map['filename*'] != null)
                    filenameOrigin = map['filename*']
                else if(map['filename'] != null)
                    filenameOrigin = map['filename']

                if(filenameOrigin != null)
                {
                    const indexDoubleCharQuote = filenameOrigin.indexOf("''")
                    if(indexDoubleCharQuote >= 0)
                    {
                        filenameOrigin = filenameOrigin.substring(indexDoubleCharQuote + 2)
                    }

                    const indexCharQuote = filenameOrigin.indexOf('"')
                    const indexLastCharQuote = filenameOrigin.lastIndexOf('"')
                    if(indexCharQuote >= 0)
                    {
                        if(indexCharQuote === indexLastCharQuote) // UTF-8"12345
                        {
                            filenameOrigin = filenameOrigin.substring(indexCharQuote + 1)
                        }
                        else // "12345"
                        {
                            filenameOrigin = filenameOrigin.substring(indexCharQuote + 1, indexLastCharQuote)
                        }
                    }
                    else // 原始响应头数据不包含引号
                    {
                        // 不需要做处理了
                    }
                }

                // 处理 surge 和 surfboard 特殊情况
                if((ua === 'surge' || ua === 'surfboard') && filenameOrigin != null && filenameOrigin.endsWith('.conf'))
                {
                    filenameOrigin = filenameOrigin.substring(0, filenameOrigin.length - 5)
                }
            }
        }

        let filename: string | null = null

        if(filenameOrigin != null)
        {
            switch (methodNaming)
            {
                case 'prefix':
                    filename = DefaultNamingPrefix + filenameOrigin
                    break

                case 'suffix':
                    filename = filenameOrigin + DefaultNamingSuffix
                    break

                case 'origin':
                default:
                    filename = filenameOrigin
                    break PARSE_NAME
            }
        }

        // 处理 surge 和 surfboard 特殊情况
        if((ua === 'surge' || ua === 'surfboard') && filename != null)
        {
            filename = filename + '.conf'
        }

        if(filename != null)
        {
            headersAppend['Content-Disposition'] = `attachment; filename*=UTF8''${filename}`
        }
    }
    catch (any)
    {
        // 这个过程发生的错误直接忽略就行
    }

    return headersAppend
}

export function buildResponse(
    body: object | string,
    statusCode: number,
    headersAppend: Record<string, any> | null = null,
): Response
{
    const headersToResponse = new Headers()
    headersToResponse.append('Access-Control-Allow-Origin', '*')
    headersToResponse.append('Cache-Control', 'private, no-cache')

    if(headersAppend != null)
    {
        for(const key of Object.keys(headersAppend))
        {
            headersToResponse.append(key, headersAppend[key])
        }
    }
    headersToResponse.append('X-Refraction-Service', `Lens of Truth`)
    headersToResponse.append('X-Refraction-Version', appVersion)

    let bodyContent: string
    switch (typeof body)
    {
        case 'string':
            bodyContent = body
            headersToResponse.append('Content-Type', 'text/plain')
            break
        case 'object':
            bodyContent = JSON.stringify({
                ...(body ?? {}),
                code: statusCode,
            })
            headersToResponse.append('Content-Type', 'application/json')
            break
    }

    return new Response(bodyContent, {
        status: statusCode,
        headers: headersToResponse,
    })
}
