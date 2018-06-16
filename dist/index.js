"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const Router = require("koa-router");
const Koabody = require("koa-body");
const app = new Koa();
const router = new Router();
let flavor = {
    sweet: 0,
    salty: 0,
    spicy: 0
};
router.get("/", async (ctx, next) => {
    ctx.body = "Hello World!";
    console.log(`GET: ${JSON.stringify(ctx.request.query)}`);
});
router.post("/", async (ctx, next) => {
    console.log(`POST: ${JSON.stringify(ctx.request.query === {} ? ctx.request.query : ctx.request.body)}`);
    try {
        let element = (function () {
            if (typeof ctx.request.query.flavor === "undefined") {
                return ctx.request.body.flavor;
            }
            return ctx.request.query.flavor;
        })();
        flavor[element]++;
        ctx.response.status = 200;
        ctx.body = JSON.stringify({
            statistics: Object.assign({}, flavor),
            code: 200
        });
    }
    catch (e) {
        ctx.response.status = 400;
        ctx.body = JSON.stringify({
            message: e.message,
            code: 400
        }, null, 2);
    }
});
app.use(Koabody());
app.use(router.routes()).listen(8080);
//# sourceMappingURL=index.js.map