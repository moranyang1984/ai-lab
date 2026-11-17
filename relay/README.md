# 中转服务（可选，推荐全班使用时部署）

为什么需要：网页是公开的，写在网页里的东西谁都能看到。把 DeepSeek 密钥交给中转服务保管，网页里只放一个“班级口令”，口令泄露了换一个就行，密钥不受影响。

## 部署步骤（Cloudflare Workers，免费额度够一个学校用）

1. 注册并登录 Cloudflare，进入「Workers 和 Pages」→「创建」→「Worker」，起个名字，创建。
2. 点「编辑代码」，把 `worker.js` 的全部内容粘贴进去，替换原有代码，点「部署」。
3. 进入这个 Worker 的「设置」→「变量和机密」，添加：
   - `DEEPSEEK_KEY`（类型选“机密”）：DeepSeek 的 API 密钥。
   - `CLASS_CODE`（类型选“机密”）：自己定的班级口令，例如 `lab-2026-5ban`。
   - `ALLOW_ORIGIN`（可选）：只允许你的网页调用，例如 `https://你的用户名.github.io`（不带末尾斜杠和路径）。
4. 记下 Worker 的地址，例如 `https://ailab-relay.你的子域.workers.dev`。
5. 修改仓库根目录的 `ai-config.js`：

   ```js
   deepseek: {
     base: 'https://ailab-relay.你的子域.workers.dev',
     model: 'deepseek-flash',
     quick: 'deepseek-flash',
     vision: '',
     key: 'lab-2026-5ban'   // 班级口令，不是 sk- 密钥
   }
   ```

   同时把 `stamp` 加 1，提交。之后任何设备打开网页都直接是 DeepSeek 模式，不用逐台填密钥。

## 注意

- `*.workers.dev` 域名在中国大陆的校园网里经常打不开。在大陆使用时，请给 Worker 绑定一个自己的域名，或者把同样的逻辑部署到国内云厂商的云函数上（接口约定只有一条：`POST {地址}/chat/completions`，`Authorization: Bearer 班级口令`，原样转发给 DeepSeek 并换成真密钥）。
- 中转服务默认只放行 `deepseek-flash` 模型。要放行别的模型，添加变量 `MODELS`，用英文逗号分隔。
- 建议在 DeepSeek 开放平台给这个密钥所在的账户只充小额余额，并定期查看用量。
