export async function handleTrafficCap(siteId: string, kv: KVNamespace): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const key = `hits:${siteId}:${today}`;
  
  let current = parseInt(await kv.get(key) || '0', 10);
  current++;
  
  await kv.put(key, current.toString(), { expirationTtl: 86400 * 2 });
  
  // Soft cap threshold for free tier
  const SOFT_CAP = 10000;
  return current > SOFT_CAP;
}
