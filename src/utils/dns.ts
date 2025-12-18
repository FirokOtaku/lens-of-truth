import axios from 'axios'

const DefaultDnsChoice = 'google-public-dns'

/**
 * 查询指定的主机名对应的 IP
 * */
export async function queryHostnameIp(setHostname: Set<string>): Promise<Record<string, string>>
{
    const ret: Record<string, string> = {}

    for(const hostname of setHostname)
    {
        const result = await axios({
            url: 'https://dns.firok.space/dns-query',
            method: 'get',
            params: {
                name: hostname,
            },
        })

        const data = result.data.data[DefaultDnsChoice]
        if(data.status !== 'fulfilled' || data.value == null)
            throw '请求出错, 无法查询指定域名真实 IP: ' + hostname

        const jsonDnsValue = data.value['Answer']
        if(!Array.isArray(jsonDnsValue) || jsonDnsValue.length <= 0)
            throw '请求出错, 该域名无真实 IP 数据: ' + hostname

        ret[hostname] = jsonDnsValue[0].data
    }

    return ret
}
