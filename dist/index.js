"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const Router = require("koa-router");
const Koabody = require("koa-body");
const send = require("koa-send");
const fs = require("fs");
const app = new Koa();
const router = new Router();
let flavor;
try {
    flavor = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
}
catch (e) {
    console.error("Can't read file ./config.json!");
    console.error(e.message);
    flavor = {
        sweet: 0,
        salty: 0,
        spicy: 0
    };
}
router.get("/index.html", async (ctx, next) => {
    await send(ctx, ctx.path, { root: "./public" });
});
router.get("/:addr/:file", async (ctx, next) => {
    await send(ctx, ctx.path, { root: "./public" });
});
router.get("/", async (ctx, next) => {
    await send(ctx, "./public/index.html");
});
router.get("/result", async (ctx, next) => {
    ctx.body = JSON.stringify(flavor, null, 2);
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
    finally {
        // TODO: Save here
        fs.writeFileSync("./config.json", JSON.stringify(flavor, null, 2), "utf-8");
    }
});
app.use(Koabody());
app.use(router.routes()).listen(8080);
//# sourceMappingURL=index.js.map