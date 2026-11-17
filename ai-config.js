/* AI 小实验室 · 网页版 AI 配置（部署到 GitHub Pages 等静态站点时使用）
   这个文件会和网页一起公开，任何人都能看到。

   两种用法，选一种：

   A. 不在这里写密钥（默认）。
      老师打开网页 → 点左下角「离线演示」→ 选 DeepSeek → 填密钥 → 保存。
      密钥只存在这台设备的浏览器里。每台要用真 AI 的设备都要填一次，
      或者用设置里的「复制配置链接」发给其他设备。

   B. 用中转服务（推荐全班使用时）。
      按 relay/README.md 部署中转服务，把真正的 DeepSeek 密钥放在中转服务里，
      然后在下面填 base（中转地址）和 key（你自己定的班级口令）。
      这样真正的密钥不会出现在网页里。

   不要把真正的 DeepSeek 密钥（sk-…）直接写进这个文件：仓库和网页都是公开的，密钥会被别人盗用。
*/
window.AILAB_CONFIG = {
  /* 打开网页时默认用哪种 AI：'deepseek'（有密钥时用 DeepSeek，没有就离线演示）或 'offline' */
  mode: 'deepseek',
  /* 改了上面的 mode 后把这个数字加 1，已经打开过网页的设备才会跟着换 */
  stamp: 1,
  deepseek: {
    base: 'https://api.deepseek.com',   /* 用中转服务时改成中转地址 */
    model: 'deepseek-flash',            /* 主模型（写作、作画） */
    quick: 'deepseek-flash',            /* 快速模型（识别、判断） */
    vision: '',                         /* 看图模型；留空 = 图片任务用离线演示 */
    key: ''                             /* 只在用中转服务时填班级口令；不要填 sk- 开头的真密钥 */
  }
};
