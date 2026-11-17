/* AI 小实验室 · DeepSeek 中转服务（Cloudflare Workers）
   作用：真正的 DeepSeek 密钥只放在这里，网页里只放“班级口令”。
   需要在 Worker 的「设置 → 变量和机密」里添加：
     DEEPSEEK_KEY   （机密）DeepSeek 的 API 密钥，sk- 开头
     CLASS_CODE     （机密）你自己定的班级口令，例如 lab-2026-5ban
     ALLOW_ORIGIN   （可选）只允许这个网址调用，例如 https://你的用户名.github.io
   网页端：ai-config.js 里把 deepseek.base 改成这个 Worker 的地址，deepseek.key 填班级口令。 */
export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const allow = env.ALLOW_ORIGIN || '*';
    const cors = {
      'Access-Control-Allow-Origin': allow === '*' ? '*' : allow,
      'Access-Control-Allow-Headers': 'authorization,content-type',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Vary': 'Origin'
    };
    const reply = (status, message) => new Response(JSON.stringify({ error: { message } }), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'POST' || !new URL(req.url).pathname.endsWith('/chat/completions')) return reply(404, 'not found');
    if (allow !== '*' && origin !== allow) return reply(403, 'origin not allowed');
    if (!env.DEEPSEEK_KEY || !env.CLASS_CODE) return reply(500, 'relay not configured');
    if ((req.headers.get('Authorization') || '') !== 'Bearer ' + env.CLASS_CODE) return reply(401, 'wrong class code');
    let body;
    try { body = await req.json(); } catch (e) { return reply(400, 'bad json'); }
    /* 只放行平台用到的字段，并限制模型，防止口令泄露后被拿去做别的事 */
    const models = (env.MODELS || 'deepseek-flash').split(',').map(s => s.trim());
    if (!models.includes(body.model)) return reply(400, 'model not allowed');
    const out = { model: body.model, messages: body.messages, stream: !!body.stream };
    if (body.max_tokens) out.max_tokens = Math.min(body.max_tokens, 8192);
    if (body.thinking) out.thinking = body.thinking;
    if (JSON.stringify(out.messages || '').length > 200000) return reply(413, 'too long');
    const r = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.DEEPSEEK_KEY },
      body: JSON.stringify(out)
    });
    const h = new Headers(cors);
    h.set('Content-Type', r.headers.get('Content-Type') || 'application/json');
    h.set('Cache-Control', 'no-store');
    return new Response(r.body, { status: r.status, headers: h });
  }
};
