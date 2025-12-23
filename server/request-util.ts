
export async function getRequestParams(url: URL, request: Request, method: 'get' | 'post'): Promise<Record<string, any>>
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
