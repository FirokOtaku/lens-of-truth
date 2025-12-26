
export function replaceHost(url: URL, host: string): URL
{
    const urlNew = new URL(url)
    urlNew.host = host
    return urlNew
}
