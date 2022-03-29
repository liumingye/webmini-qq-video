import { is } from "./utils";
import { adblock, video } from "./modules";

const ipcRenderer = (window as any).utils.ipcRenderer;

const applyScript = () => {
  console.log("applyScript - vqq");
  const location = window.location;
  const simpleHref = location.hostname + location.pathname;

  // 脚本开始
  adblock.start();
  // 普通视频页：自动最大化播放器
  if (is.video(simpleHref)) {
    video.start();
  }
};

window.addEventListener(
  "DOMContentLoaded",
  () => {
    applyScript();
    ipcRenderer.on("load-commit", () => {
      applyScript();
    });
  },
  { once: true, passive: true }
);
