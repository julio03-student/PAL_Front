const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")
const httpProxy = require("http-proxy")

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

// Crear un proxy para redirigir las solicitudes a la API
const proxy = httpProxy.createProxyServer({
  target: "http://localhost:8081",
  changeOrigin: true,
  pathRewrite: { "^/api": "/api" },
})

// Manejar errores del proxy
proxy.on("error", (err, req, res) => {
  console.error("Proxy error:", err)
  res.writeHead(500, {
    "Content-Type": "text/plain",
  })
  res.end("Proxy error: " + err.message)
})

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname } = parsedUrl

    // Redirigir solicitudes a la API
    if (pathname.startsWith("/api/")) {
      proxy.web(req, res, { target: "http://localhost:8081" })
    } else {
      handle(req, res, parsedUrl)
    }
  }).listen(3000, (err) => {
    if (err) throw err
    console.log("> Ready on http://localhost:3000")
  })
})
