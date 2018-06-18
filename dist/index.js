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
let ips;
function loadConfig() {
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
}
function loadIps() {
    try {
        ips = JSON.parse(fs.readFileSync("./ips.json", "utf-8"));
    }
    catch (e) {
        console.log(e);
        ips = new Array();
    }
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
    console.log(`POST: ${JSON.stringify(ctx.request.query === {} ? ctx.request.query : ctx.request.body)} from ${ctx.request.ip}`);
    loadIps();
    if (ipExist(ctx.request.ip)) {
        ctx.response.status = 200;
        ctx.response.body = 'FAILED';
        return;
    }
    fs.writeFileSync("./ips.json", JSON.stringify(ips), "utf-8");
    try {
        let element = (function () {
            if (typeof ctx.request.query.flavor === "undefined") {
                return ctx.request.body.flavor;
            }
            return ctx.request.query.flavor;
        })();
        loadConfig();
        if (/sweet/g.test(element))
            flavor["sweet"]++;
        if (/salty/g.test(element))
            flavor["salty"]++;
        if (/spicy/g.test(element))
            flavor["spicy"]++;
        ctx.response.status = 200;
        ctx.body = 'SUCCESS';
    }
    catch (e) {
        ctx.response.status = 400;
        ctx.body = JSON.stringify({
            message: e.message,
            code: 400
        }, null, 2);
    }
    finally {
        fs.writeFileSync("./config.json", JSON.stringify(flavor, null, 2), "utf-8");
    }
});
function ipExist(ip) {
    if (ips.indexOf(ip) == -1) {
        ips.push(ip);
        return false;
    }
    else {
        return true;
    }
}
loadIps();
loadConfig();
app.use(Koabody());
app.use(router.routes()).listen(8080);
//# sourceMappingURL=index.js.map