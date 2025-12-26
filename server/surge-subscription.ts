import {CloudflareEnvWorkerInstance} from './cloudflare-env-worker-instance'
import {buildResponse} from './response-util'
import {queryHostnameIp} from './dns'

export type SurgeSubscriptionLineType =
    /**
     * 模块定义行
     * */
    'define' |
    /**
     * 空行
     * */
    'empty' |
    /**
     * 注释行
     * */
    'comment' |
    /**
     * 未解析的文本行
     * */
    'text' |
    /**
     * 代理内容行
     * */
    'proxy'

export interface SurgeSubscriptionLine
{
    type: SurgeSubscriptionLineType
    /**
     * 原始内容
     * */
    textRaw: string
}

export interface SurgeSubscriptionLineProxy extends SurgeSubscriptionLine
{
    nameWithProtocol: string,
    server: string
    port: number
    listExtraKvp: string[]
}

export interface SurgeSubscriptionModule
{
    name: string
    listLine: SurgeSubscriptionLine[]
}

export interface SurgeSubscriptionContent
{
    listModule: SurgeSubscriptionModule[]
    mapModule: Record<string, SurgeSubscriptionModule>
}

function readSurgeSubscriptionContent(text: string): SurgeSubscriptionContent
{
    let currentModule: SurgeSubscriptionModule = {
        name: '',
        listLine: [],
    }
    const listModule: SurgeSubscriptionModule[] = [
        currentModule,
    ]
    const mapModule: Record<string, SurgeSubscriptionModule> = {}
    mapModule[''] = currentModule

    const listTextLine = text.split('\n')
    for(let textLine of listTextLine)
    {
        let objLine: SurgeSubscriptionLine
        const textLineTrim = textLine.trim()
        if(textLineTrim.length === 0) // 空行
        {
            objLine = { type: 'empty', textRaw: '', }
        }
        else if(textLineTrim.startsWith('#')) // 注释行
        {
            objLine = { type: 'comment', textRaw: textLine, }
        }
        else if(textLineTrim.startsWith('[') && textLineTrim.endsWith(']')) // 模块定义
        {
            // 切换模块
            const nameModule = textLineTrim.substring(1, textLineTrim.length - 1)
            currentModule = {
                name: nameModule,
                listLine: [],
            }
            mapModule[nameModule] = currentModule
            listModule.push(currentModule)

            objLine = { type: 'define', textRaw: textLine, }
        }
        else if(currentModule.name === 'Proxy') // 代理内容
        {
            const listPart = textLineTrim.split(',')
            if(listPart.length < 3 || !listPart[0].includes('='))
                throw '无法处理的数据格式'

            const nameProtocol = listPart[0]
            const server = listPart[1]
            const port = parseInt(listPart[2])
            const listExtraKvp = listPart.length > 3 ? listPart.slice(3) : []
            objLine = {
                type: 'proxy', textRaw: textLine,

                nameWithProtocol: nameProtocol,
                server,
                port,
                listExtraKvp,
            } as SurgeSubscriptionLineProxy
        }
        else // 原始文本
        {
            objLine = { type: 'text', textRaw: textLine, }
        }

        currentModule.listLine.push(objLine)
    }

    return { listModule, mapModule, }
}

export function buildSurgeSubscriptionText(
    content: SurgeSubscriptionContent,
): string
{
    const { listModule, mapModule, } = content
    let ret: string = ''

    for(const module of listModule)
    {
        const nameModule = module.name

        for(const line of module.listLine)
        {
            switch (line.type)
            {
                case 'define':
                case 'comment':
                case 'text':
                    ret += line.textRaw + '\n'
                    break
                case 'empty':
                    ret += '\n'
                    break

                case 'proxy':
                    const lineProxy = line as SurgeSubscriptionLineProxy
                    let text = `${lineProxy.nameWithProtocol},${lineProxy.server},${lineProxy.port}`
                    for(const kvp of lineProxy.listExtraKvp)
                    {
                        text += `,${kvp}`
                    }
                    ret += text + '\n'
                    break
            }
        }
    }

    return ret
}

export async function dealWithSurgeSubscription(
    dataLink: string,
    serviceDns: CloudflareEnvWorkerInstance,
    headersAppend: Record<string, any>,
): Promise<Response>
{
    // 读取并处理订阅内容
    const content = readSurgeSubscriptionContent(dataLink)

    const moduleProxy = content.mapModule['Proxy']
    const setHostname = new Set<string>()
    if(moduleProxy != null)
    {
        for(const line of moduleProxy.listLine)
        {
            if(line.type !== 'proxy')
                continue

            const hostname = (line as SurgeSubscriptionLineProxy).server
            setHostname.add(hostname)
        }
    }

    if(setHostname.size > 0) // 转换 IP
    {
        let mapHostnameToIp: Record<string, string> = await queryHostnameIp(setHostname, serviceDns)
        for(const line of moduleProxy.listLine)
        {
            if(line.type !== 'proxy')
                continue
            let hostnameOrigin: string = (line as SurgeSubscriptionLineProxy).server
            const hostnameToIp = mapHostnameToIp[hostnameOrigin]
            if(hostnameToIp == null)
                continue
            (line as SurgeSubscriptionLineProxy).server = hostnameToIp
        }
    }

    const text = buildSurgeSubscriptionText(content)

    return buildResponse(
        text,
        200,
        headersAppend,
    )
}
