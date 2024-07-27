// Cloudflare Worker (worker.js)
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname.slice(1)

  if (path === '') {
    // Serve the admin interface
    return fetch('https://your-cloudflare-pages-url/index.html')
  }

  if (path === 'api/addLink') {
    // Handle adding new links
    if (request.method === 'POST') {
      const { fullUrl, description } = await request.json()
      const shortCode = generateShortCode()
      await LINKS.put(shortCode, JSON.stringify({ fullUrl, description }))
      return new Response(JSON.stringify({ shortLink: `https://${url.hostname}/${shortCode}` }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }

  // Check if the path is a short link and redirect
  const linkData = await LINKS.get(path)
  if (linkData) {
    const { fullUrl } = JSON.parse(linkData)
    return Response.redirect(fullUrl, 301)
  }

  return new Response('Not Found', { status: 404 })
}

function generateShortCode() {
  // Implement your short code generation logic here
  // For example, you could use a combination of timestamp and random characters
  return Math.random().toString(36).substring(2, 8)
}
