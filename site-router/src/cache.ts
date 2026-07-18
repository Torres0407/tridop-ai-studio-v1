export async function handleCache(request: Request, domain: string): Promise<Response> {
  // Simplified edge caching logic
  return new Response(`Served content for ${domain} from site-router cache`, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=60'
    }
  });
}
