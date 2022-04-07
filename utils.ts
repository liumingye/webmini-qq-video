import type { PluginApiParameters } from "webmini-types";

/**
 * 获取腾讯视频分p 暂时只能获取前100个
 * @param application
 * @param net
 * @param cid
 * @param vid
 */
export const getPartOfQQ = (
  application: PluginApiParameters["application"],
  net: PluginApiParameters["net"],
  cid: string,
  vid: string
): void => {
  net
    .fetch(
      "https://pbaccess.video.qq.com/trpc.universal_backend_service.page_server_rpc.PageServer/GetPageData?video_appid=3000010&vplatform=2",
      {
        method: "POST",
        body: JSON.stringify({
          page_params: {
            page_type: "detail_operation",
            page_id: "vsite_episode_list",
            id_type: "1",
            cid,
            vid,
            lid: "0",
            page_size: "100",
            page_context: "",
          },
          has_cache: 1,
        }),
        headers: {
          "content-type": "application/json",
          referer: "https://v.qq.com/",
        },
      }
    )
    .then((res) => {
      res.json().then((res: any) => {
        // console.log(res.data.module_list_datas);
        if (
          typeof res.data.module_list_datas[0].module_datas[0][
            "item_data_lists"
          ]["item_datas"] === "undefined"
        ) {
          return;
        }

        const data: {
          url: string;
          currentPartId: number;
          parts: { title: string; id: string }[];
        } = {
          url: `https://v.qq.com/x/cover/${cid}/%id.html`,
          currentPartId: 0,
          parts: [],
        };

        res.data.module_list_datas[0].module_datas[0]["item_data_lists"][
          "item_datas"
        ].forEach((item: any, index: number) => {
          // console.log(item);
          data.parts.push({
            title: item.item_params.play_title,
            id: item.item_params.vid,
          });
          if (item.item_params.vid === vid) {
            data.currentPartId = index;
          }
        });

        application.selectPartWindow?.send("update-part", data);

        if (data.parts.length > 1) {
          application.mainWindow?.send(
            "setAppState",
            "disablePartButton",
            false
          );
        } else {
          application.mainWindow?.send(
            "setAppState",
            "disablePartButton",
            true
          );
        }
      });
    });
};
