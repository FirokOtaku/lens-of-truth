
export abstract class CloudflareEnvWorkerInstance
{
    abstract fetch(url: URL | string, init: RequestInit): Promise<Response>
}

export interface CloudflareEnvWithDnsService extends Env
{
    dns: CloudflareEnvWorkerInstance
}
