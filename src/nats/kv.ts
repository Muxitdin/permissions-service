import { connect, KV, NatsConnection } from "nats";
let nc: NatsConnection;
let kv: KV;
export async function initKV() {
    nc = await connect({ servers: process.env.NATS_URL });
    const js = nc.jetstream();
    kv = await js.views.kv("permissions_cache");
}
export async function getCachedPermissions(apiKey: string): Promise<any[] | null> {
    try {
        const entry = await kv.get(apiKey);
        if (!entry) return null;
        return JSON.parse(entry.value.toString());
    } catch {
        return null;
    }
}
export async function setCachedPermissions(apiKey: string, permissions: any[]) {
    await kv.put(apiKey, Buffer.from(JSON.stringify(permissions)));
}
