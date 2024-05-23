import { Injectable } from '@nestjs/common';
import { SuccessResponse } from '../Responses/success.response';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import ytdl =require('ytdl-core');

@Injectable()
export class YoutubeService {
  constructor() {}

  async videoSuggest(req: Request): Promise<any> {
    console.log(req.headers);
    const url: string =
      'https://www.youtube.com/feed/trending?bp=4gINGgt5dG1hX2NoYXJ0cw%3D%3D&gl=VN&hl=vi';
    const f = await fetch(url, {
      method: 'GET',
      headers: req.headers,
    });
    const body = await f.text();
    const myRe = new RegExp(/var ytInitialData = (.*?);</, 'i');
    const myArray = myRe.exec(body);
    let list: any[] = [];
    if (myArray == null) {
      list.push({
        video_oid: '',
        last_oid: '',
        video_id: 'quq2za8Rhc4',
        thumbnail:
          'https://i.ytimg.com/vi/oWW5TLrrbNo/hqdefault_live.jpg?sqp=-oaymwEcCPYBEIoBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLChUPJHLEMHhQGGOWPKql_GvI_EzQ',
        title: 'Ripple - Stuck | DnB | NCS - Copyright Free Music',
        time_text: '1 ngày trước',
        view_count_text: '1000',
        chanel_name: 'dangtinh',
        chanel_url: 'https://www.youtube.com/@NoCopyrightSounds',
        published_time: '',
      });
    } else {
      list = this.listSuggestInScript(JSON.parse(myArray[1]));
    }

    return new SuccessResponse({
      reels: [],
      list: list,
      token: JSON.parse(myArray[1]),
    });
  }

  listSuggestInScript(json: any): any[] {
    try {
      const list =
        json.contents.twoColumnBrowseResultsRenderer.tabs[1].tabRenderer.content
          .sectionListRenderer.contents;
      let result = [];
      list.forEach((item: any) => {
        const listContents =
          item.itemSectionRenderer.contents[0].shelfRenderer.content
            .expandedShelfContentsRenderer.items;
        listContents.forEach((itemVideo: any) => {
          itemVideo = itemVideo.videoRenderer;
          result.push({
            video_id: itemVideo.videoId,
            thumbnail: itemVideo.thumbnail.thumbnails[itemVideo.thumbnail.thumbnails.length -1].url,
            title: itemVideo.title.runs[0].text,
            view_count_text: itemVideo.viewCountText.simpleText,
            chanel_name: itemVideo.longBylineText.runs[0].text,
            chanel_url:
              itemVideo.longBylineText.runs[0].navigationEndpoint.browseEndpoint
                .canonicalBaseUrl,
          });
        });
      });
      return result;
    } catch (e) {
      console.error(e.message);
      return [];
    }

    return [];
  }

  async detailVideo(videoId: string): Promise<any> {
    const info = await ytdl.getInfo(
      'http://www.youtube.com/watch?v=' + videoId,
    );
    console.log(info);
    return new SuccessResponse(info);
  }
}
