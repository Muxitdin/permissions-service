export function logEvent(event: string, data: Record<string, any>) {
    console.log(JSON.stringify({ event, timestamp: new Date().toISOString(), ...data }));
}