import { Injectable } from '@nestjs/common';
import { SuccessResponse } from '../Responses/success.response';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import ytdl = require('ytdl-core');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const _ = require('lodash');

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
      token: '',
    });
  }

  listSuggestInScript(json: any): any[] {
    try {
      const list =
        json.contents.twoColumnBrowseResultsRenderer.tabs[1].tabRenderer.content
          .sectionListRenderer.contents;
      const result = [];
      list.forEach((item: any) => {
        const listContents =
          item.itemSectionRenderer.contents[0].shelfRenderer.content
            .expandedShelfContentsRenderer.items;
        listContents.forEach((itemVideo: any) => {
          itemVideo = itemVideo.videoRenderer;
          result.push(this.transformerVideo(itemVideo));
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
    const info: any = await ytdl.getInfo(
      'http://www.youtube.com/watch?v=' + videoId,
    );
    let all = '';
    let audio = '';
    let video = '';
    info.formats.forEach((item: any) => {
      const itag = item.itag;
      if ([22, 18, 43].indexOf(itag) !== -1) {
        console.log(itag, item.url);
        all = item.url;
      }
      if ([244, 247, 302, 135, 136, 298].indexOf(itag) !== -1) {
        video = item.url;
      }
      if ([140, 171, 250].indexOf(itag) !== -1) {
        audio = item.url;
      }
    });
    const result = {
      all: all,
      video: video,
      audio: audio,
    };
    return new SuccessResponse(result);
  }

  async suggestKeyword(keyword: string): Promise<any> {
    const time = Math.round(new Date().getTime() / 1000);
    let url = `https://suggestqueries.google.com/complete/search?json=suggestCallBack&q=${keyword}&hl=vi&ds=yt&client=youtube&_=${time}`;
    const curl = await fetch(url, {
      headers: this.headerCurl(),
      method: 'GET',
    });
    const json = await curl.json();
    return new SuccessResponse({
      list: json[1],
    });
  }

  async search(q: string): Promise<any> {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&gl=VN`;
    const curl = await fetch(url, {
      method: 'GET',
      headers: this.headerCurl(),
    });
    console.log(url);
    const body = await curl.text();
    const myRe = new RegExp(/var ytInitialData = (.*?);</, 'i');
    const myArray = myRe.exec(body);
    const json = JSON.parse(myArray[1]);
    const contents = _.get(
      json,
      'contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents.0.itemSectionRenderer.contents',
      [],
    );

    const result = [];

    contents.forEach((item: any) => {
      if (Object.keys(item).indexOf('videoRenderer') === -1) {
        return;
      }
      let data = item['videoRenderer'];
      result.push(this.transformerVideo(data));
    });

    return new SuccessResponse({
      list: result,
    });
  }

  async videoRelated(videoId: string): Promise<any> {
    const url = `https://www.youtube.com/watch?v=${videoId}&gl=VN`;
    const curl = await fetch(url, {
      method: 'GET',
      headers: this.headerCurl(),
    });
    console.log(url);
    const body = await curl.text();
    const myRe = new RegExp(/var ytInitialData = (.*?);</, 'i');
    const myArray = myRe.exec(body);
    const json = JSON.parse(myArray[1]);
    const contents = _.get(
      json,
      'contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents.0.itemSectionRenderer.contents',
      [],
    );

    const result = [];

    contents.forEach((item: any) => {
      if (Object.keys(item).indexOf('videoRenderer') === -1) {
        return;
      }
      let data = item['videoRenderer'];
      result.push(this.transformerVideo(data));
    });

    return new SuccessResponse({
      list: result,
    });
  }

  private transformerVideo(data: any): any {
    const thumbnails = _.get(data, 'thumbnail.thumbnails');
    return {
      video_id: _.get(data, 'videoId'),
      thumbnail: thumbnails[thumbnails.length - 1].url,
      title: _.get(data, 'title.runs[0].text', ''),
      view_count_text: _.get(data, 'viewCountText.simpleText', ''),
      chanel_name: _.get(data, 'longBylineText.runs[0].text', ''),
      chanel_url: _.get(
        data,
        'longBylineText.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl',
        '',
      ),
    };
  }

  headerCurl(): any {
    return {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
      'accept-language': 'vi-VN,vi;q=0.9',
      cookie:
        'GPS=1; YSC=8O5Dqkbfe3I; VISITOR_INFO1_LIVE=ZTRgRstulEA; PREF=tz=Asia.Saigon',
    };
  }
}
