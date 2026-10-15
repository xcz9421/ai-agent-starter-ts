export function log(event: string, payload: any) {
  const ts = new Date().toISOString();
  console.log(JSON.stringify({ ts, event, payload }));
}
