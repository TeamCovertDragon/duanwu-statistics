import * as Koa from "koa";
import * as Router from "koa-router";
import * as Koabody from "koa-body";
import * as send from "koa-send";
import * as fs from "fs";

const app = new Koa();
const router = new Router();

let flavor: any, whiteList: any, visitList: any;

function loadConfig() {
  try {
    flavor = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
  } catch (e) {
    console.error("Can't read file ./config.json!");
    console.error(e.message);
    flavor = {
      sweet: 0,
      salty: 0,
      spicy: 0
    };
  }
}

function loadIPDefense() {
  try {
    whiteList = JSON.parse(fs.readFileSync("./whiteList.json", "utf-8"));
  } catch (e) {
    console.error(e.message);
    whiteList = {};
    fs.writeFileSync(
      "./whiteList.json",
      JSON.stringify(whiteList, null, 2),
      "utf-8"
    );
  }
  try {
    visitList = JSON.parse(fs.readFileSync("./visitList.json", "utf-8"));
  } catch (e) {
    console.error(e.message);
    visitList = {};
    fs.writeFileSync(
      "./visitList.json",
      JSON.stringify(visitList, null, 2),
      "utf-8"
    );
  }
}

function saveVisitList() {
  fs.writeFileSync(
    "./visitList.json",
    JSON.stringify(visitList, null, 2),
    "utf-8"
  );
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
  console.log(
    `POST: ${JSON.stringify(
      ctx.request.query === {} ? ctx.request.query : ctx.request.body
    )} from ${ctx.request.ip}`
  );

  loadIPDefense();

  if (
    whiteList[ctx.request.ip] === undefined &&
    visitList[ctx.request.ip] !== undefined
  ) {
    if (Date.now() - visitList[ctx.request.ip] <= 2000) {
      ctx.response.status = 429;
      ctx.body = JSON.stringify(
        {
          message: "429: Too Many Requests.",
          code: 429
        },
        null,
        2
      );
      return;
    }

    delete visitList[ctx.request.ip];
    saveVisitList();
  }

  // else
  try {
    let element: string = (function() {
      if (typeof ctx.request.query.flavor === "undefined") {
        return ctx.request.body.flavor;
      }
      return ctx.request.query.flavor;
    })();

    loadConfig();

    if (/sweet/g.test(element)) flavor["sweet"]++;
    if (/salty/g.test(element)) flavor["salty"]++;
    if (/spicy/g.test(element)) flavor["spicy"]++;

    // record visit
    if (whiteList[ctx.request.ip] === undefined) {
      visitList[ctx.request.ip] = Date.now();
      saveVisitList();
    }

    ctx.response.status = 200;
    ctx.body = JSON.stringify({
      statistics: { ...flavor },
      code: 200
    });
  } catch (e) {
    ctx.response.status = 400;
    ctx.body = JSON.stringify(
      {
        message: e.message,
        code: 400
      },
      null,
      2
    );
  } finally {
    fs.writeFileSync("./config.json", JSON.stringify(flavor, null, 2), "utf-8");
  }
});

loadConfig();
app.use(Koabody());
app.use(router.routes()).listen(8080);
