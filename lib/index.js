/**
 * dsh-model-picker-brand —— 宿主侧。
 *
 * 本插件的全部作用都在浏览器半边（装饰模型选择器的标签渲染）。宿主侧只留
 * 一条状态路由，用来确认「宿主确实加载了本插件」——客户端效果无法从服务端
 * 观测，没有这条路由就没法自证。
 *
 * 零内核改动：不碰 @deepseek-ai/dsh-client-ui-model-selection 的任何字节，
 * 只往官方插槽 conversation.input.model.label 注册一个装饰器。
 *
 * 回退：停用本插件 → 插槽装饰器消失 → 选择器回到原来的纯文本模型名。
 *
 * @module dsh-model-picker-brand
 */

export const name = 'model-picker-brand'

/** 状态路由路径。 */
const STATUS_ROUTE = '/dsh-model-picker-brand/status'

/**
 * 挂载宿主侧。
 *
 * @param {object} ctx - 插件上下文。
 */
export function apply(ctx) {
  /** 宿主加载本插件的时刻，用于确认「热重载后确实换了一代」。 */
  const loadedAt = new Date().toISOString()

  ctx.inject(['webServer'], (webCtx) => {
    /**
     * 状态查询。
     *
     * @param {object} req - 请求。
     * @param {object} res - 响应。
     */
    const statusHandler = async (req, res) => {
      if (req.method !== 'GET') {
        res.writeHead(405, { allow: 'GET' })
        res.end()
        return
      }
      const body = JSON.stringify({
        ok: true,
        plugin: 'dsh-model-picker-brand',
        slot: 'conversation.input.model.label',
        priority: -10,
        loadedAt,
      })
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
      res.end(body)
    }

    webCtx.effect(
      () =>
        webCtx.webServer.register({
          kind: 'exact',
          path: STATUS_ROUTE,
          handler: statusHandler,
        }),
      `model-picker-brand: GET ${STATUS_ROUTE}`,
    )
  })
}
