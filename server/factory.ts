import {AbstractLink} from './abstract-link'
import {SsLink} from './ss-link'
import {VmessLink} from './vmess-link'
import {SsrLink} from './ssr-link'

export function readLink(textUrlPlain: string): AbstractLink | null
{
    const url = new URL(textUrlPlain)
    const protocol = url.protocol
    switch (protocol)
    {
        case 'ss':
            return new SsLink(textUrlPlain)
        case 'ssr':
            return new SsrLink(textUrlPlain)
        case 'vmess':
            return new VmessLink(textUrlPlain)
        default:
            return null
    }
}

/**
 * 订阅内容格式
 * */
export type SubscriptionFormat =
    /**
     * 自动识别
     * */
    'auto' |
    /**
     * 原始内容
     * */
    'plain' |
    /**
     * 经过 base64 编码的内容
     * */
    'base64'

/**
 * 链接格式
 * */
export type LinkFormat =
    /**
     * 自动识别
     * */
    'auto' |

    /**
     * 链接是原始内容
     * */
    'plain' |
    /**
     * 除去 protocol, 其余部分都是 base64 编码
     * */
    'content-b64' |
    /**
     * 完整的 base64 编码
     * */
    'full-b64'

export interface SubscribeContent
{
    formatSubscription: SubscriptionFormat

    listLink: AbstractLink[]
    formatLink: LinkFormat
}

/**
 * 读取完整订阅内容
 * @param {string} textSubscription 要读取的订阅内容
 * @param {SubscriptionFormat} formatSubscription 订阅内容格式
 * @param {LinkFormat} formatLink 订阅链接格式
 * */
export function readSubscribeContent(
    textSubscription: string,
    formatSubscription: SubscriptionFormat = 'auto',
    formatLink: LinkFormat = 'auto'
): SubscribeContent
{
    let dataSubscription: string

    if(formatSubscription === 'auto')
    {
        // 识别是否是 base64
        try
        {
            dataSubscription = atob(textSubscription)
            formatSubscription = 'base64'
        }
        catch (any)
        {
            dataSubscription = textSubscription
            formatSubscription = 'plain'
        }
    }
    else
    {
        switch (formatSubscription)
        {
            case 'base64':
                dataSubscription = atob(textSubscription)
                break
            case 'plain':
                dataSubscription = textSubscription
                break
        }
    }

    const listLink: AbstractLink[] = []
    const listTextLine: string[] = dataSubscription.split('\n')
    for(let step = 0; step < listTextLine.length; step++)
    {
        let textLine = listTextLine[step]!.trim()
        if(textLine.length <= 0)
            continue

        CHECK_AUTO_FORMAT: if(formatLink === 'auto')
        {
            // 检测是不是完整 base64
            try
            {
                textLine = atob(textLine)
                formatLink = 'plain'
                break CHECK_AUTO_FORMAT
            }
            catch (any)
            {}

            // 检测 protocol 之外部分是 base64
            try
            {
                const urlTemp = new URL(textLine)
                if(urlTemp.username !== '' || urlTemp.password !== '' || urlTemp.port !== '' || urlTemp.search !== '' || urlTemp.pathname !== '')
                    throw 'not-content-b64'

                const indexProtocol = textLine.indexOf('//')
                if(indexProtocol < 0)
                    throw 'not-content-b64'
                const textLineContent = textLine.substring(indexProtocol + 2)
                const dataLineContent = atob(textLineContent)

                textLine = urlTemp.protocol + '//' + dataLineContent

                formatLink = 'plain'
                break CHECK_AUTO_FORMAT
            }
            catch (any)
            {}

            // 检测是不是 plain
            const urlTemp = new URL(textLine)
            if(urlTemp.username === '' || urlTemp.pathname !== '')
                throw '无法识别的链接格式 (错误参数): ' + textLine

            const indexProtocol = textLine.indexOf('//')
            if(indexProtocol < 0)
                throw '无法识别的链接格式 (无法检测协议): ' + textLine

            formatLink = 'plain'
        }

        let dataLine: string
        switch (formatLink)
        {
            case 'plain':
                dataLine = textLine
                break
            case 'content-b64':
                const indexProtocol = textLine.indexOf('//')
                const textLineContent = textLine.substring(indexProtocol + 2)
                dataLine = textLine.substring(0, indexProtocol + 2) + atob(textLineContent)
                break
            case 'full-b64':
                dataLine = atob(textLine)
                break
        }

        const urlLine = new URL(dataLine)
        switch (urlLine.protocol)
        {
            case 'ss:':
                listLink.push(new SsLink(dataLine))
                break
            case 'ssr:':
                listLink.push(new SsrLink(dataLine))
                break
            case 'vmess:':
                listLink.push(new VmessLink(dataLine))
                break
            default:
                throw '无法识别的链接格式 (不支持的协议): ' + urlLine
        }
    }

    return {
        formatSubscription,
        formatLink,
        listLink,
    }
}
