
export abstract class AbstractLink
{
    url: URL
    protected constructor(textUrl: string) {
        this.url = new URL(textUrl)
    }

    /**
     * 将此实例中的 host 替换为指定的 host
     * */
    replaceHost(host: string): URL
    {
        const urlOrigin = this.url
        const urlNew = new URL(urlOrigin)
        urlNew.host = host
        return urlNew
    }
}
