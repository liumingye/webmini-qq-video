import path from "path";
import type {
  WebContents,
  PluginMinimalData,
  PluginApiParameters,
  UrlChangeData,
  Replace,
} from "webmini-types";
import { getPartOfQQ } from "./utils";

export class extension implements PluginMinimalData {
  constructor(public api: PluginApiParameters) {}

  webNav = {
    search: {
      placeholder: "关键词",
      link: "https://m.v.qq.com/search.html?act=0&keyWord=%s",
    },
  };

  preloads = [path.resolve(__dirname, "./preload/index.js")];

  urlInclude = ["v.qq.com", "film.qq.com"];

  themeColor = {
    light: {
      bg: "#fff",
    },
    dark: {
      bg: "#111c2e",
    },
  };

  windowType = {
    mini: [/(m\.|)v\.qq\.com(.*?)(\/cover|\/play)/],
  };

  userAgent = {
    desktop: [/^v.qq.com/],
    mobile: [/^(.*?\.|)m.v.qq.com/, "m.film.qq.com"],
  };

  onUrlChanged(data: UrlChangeData, webContents: WebContents) {
    const { url } = data;

    this.api.application.mainWindow?.send(
      "setAppState",
      "disableDanmakuButton",
      true
    );
    this.api.application.mainWindow?.send("setAppState", "autoHideBar", false);

    // https://v.qq.com/x/cover/pld2wqk8kq044nv/r0035yfoa2m.html
    // https://m.v.qq.com/x/m/play?cid=u496ep9wpw4rkno&vid=
    // https://m.v.qq.com/cover/m/mzc00200jtxd9ap.html?vid=d0042iplesm
    // https://m.v.qq.com/x/play.html?cid=od1kjfd56e3s7n7
    const cidArr = /(cid=|\/)([A-Za-z0-9]{15})/.exec(url.pathname + url.search);

    if (cidArr) {
      const vidArr = /(vid=|\/)([A-Za-z0-9]{11})(\.|$|&)/.exec(
        url.pathname + url.search
      );
      const cid = cidArr[2];
      const vid = vidArr ? vidArr[2] : "";
      if (url.hostname === "m.v.qq.com") {
        // webContents.goBack();
        let _url = `https://v.qq.com/x/cover/${cid}`;
        if (vid !== "") {
          _url += `/${vid}`;
        }
        _url += `.html`;

        webContents.once("did-stop-loading", () => {
          webContents.loadURL(_url);
        });

        webContents.goBack();
      } else if (url.hostname === "v.qq.com") {
        getPartOfQQ(this.api.application, this.api.net, cid, vid);
      }
      this.api.application.mainWindow?.send("setAppState", "autoHideBar", true);
      return;
    }

    this.api.application.mainWindow?.send(
      "setAppState",
      "disablePartButton",
      true
    );
    this.api.application.selectPartWindow?.send("update-part", null);
  }
}

// 兼容旧版
export const plugin = {
  name: "webmini-qq-video",
  urlInclude: ["v.qq.com", "film.qq.com"],
  preloads: [path.resolve(__dirname, "./preload/index.js")],
  load: ({ addHook, addData, application, webContents, net }) => {
    addData("webNav", (presetBase) => {
      presetBase.search = {
        placeholder: "关键词",
        link: "https://m.v.qq.com/search.html?act=0&keyWord=%s",
      };
    });
    addData("themeColor", (presetBase) => {
      presetBase.light = {
        bg: "#fff",
      };
      presetBase.dark = {
        bg: "#111c2e",
      };
    });
    addData("windowType", (presetBase) => {
      presetBase.mini = [/(m\.|)v\.qq\.com(.*?)(\/cover|\/play)/];
    });
    addData("userAgent", (presetBase) => {
      presetBase.desktop = [/^v.qq.com/];
      presetBase.mobile = [/^(.*?\.|)m.v.qq.com/, "m.film.qq.com"];
    });
    addHook("updateUrl", {
      after: ({ url }: { url: URL }) => {
        application.mainWindow?.send(
          "setAppState",
          "disableDanmakuButton",
          true
        );
        application.mainWindow?.send("setAppState", "autoHideBar", false);

        // https://v.qq.com/x/cover/pld2wqk8kq044nv/r0035yfoa2m.html
        // https://m.v.qq.com/x/m/play?cid=u496ep9wpw4rkno&vid=
        // https://m.v.qq.com/cover/m/mzc00200jtxd9ap.html?vid=d0042iplesm
        // https://m.v.qq.com/x/play.html?cid=od1kjfd56e3s7n7
        const cidArr = /(cid=|\/)([A-Za-z0-9]{15})/.exec(
          url.pathname + url.search
        );

        if (cidArr) {
          const vidArr = /(vid=|\/)([A-Za-z0-9]{11})(\.|$|&)/.exec(
            url.pathname + url.search
          );
          const cid = cidArr[2];
          const vid = vidArr ? vidArr[2] : "";
          if (url.hostname === "m.v.qq.com") {
            // webContents.goBack();
            let _url = `https://v.qq.com/x/cover/${cid}`;
            if (vid !== "") {
              _url += `/${vid}`;
            }
            _url += `.html`;

            webContents.once("did-stop-loading", () => {
              webContents.loadURL(_url);
            });

            webContents.goBack();
          }
          application.mainWindow?.send("setAppState", "autoHideBar", true);
        }

        application.mainWindow?.send("setAppState", "disablePartButton", true);
        application.selectPartWindow?.send("update-part", null);
      },
    });
  },
  unload: () => {
    //
  },
};
