import {CloudflareEnvWorkerInstance} from './cloudflare-env-worker-instance'

const DefaultDnsChoice = 'google-public-dns'
const useOuterDns = true

/**
 * 查询指定的主机名对应的 IP
 * */
export async function queryHostnameIp(setHostname: Set<string>, serviceDns: CloudflareEnvWorkerInstance): Promise<Record<string, string>>
{
    const ret: Record<string, string> = {}

    for(const hostname of setHostname)
    {
        let jsonResult: Record<string, any>
        if(useOuterDns)
        {
            const result = await fetch(`https://dns.firok.space/dns-query?name=${hostname}`, {
                method: 'GET',
            })
            jsonResult = await result.json() as object
        }
        else
        {
            const result = await serviceDns.fetch(`https://dns.firok.space/dns-query?name=${hostname}`, {
                method: 'GET',
            })
            jsonResult = await result.json() as object
        }

        const data = jsonResult.data[DefaultDnsChoice]
        if(data.status !== 'fulfilled' || data.value == null)
            throw '请求出错, 无法查询指定域名真实 IP: ' + hostname

        const jsonDnsValue = data.value['Answer']
        if(data.value.Status !== 0 || !Array.isArray(jsonDnsValue) || jsonDnsValue.length <= 0)
        {
            // throw '请求出错, 该域名无真实 IP 数据: ' + hostname
            continue // 暂时不抛出异常
        }

        ret[hostname] = jsonDnsValue[0].data
    }

    return ret
}
