
export function replaceHost(url: URL, host: string): URL
{
    const urlOrigin = url
    const urlNew = new URL(urlOrigin)
    urlNew.host = host
    return urlNew
}
