import { Injectable } from '@nestjs/common';
import { SuccessResponse } from '../Responses/success.response';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ytdl = require('ytdl-core');

@Injectable()
export class YoutubeService {
  constructor() {}

  async videoSuggest(): Promise<any> {
    return new SuccessResponse({
      reels: [],
      list: [
        {
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
        },
      ],
      token: '',
    });
  }

  async detailVideo(videoId: string): Promise<any> {
    const info = await ytdl.getInfo(
      'http://www.youtube.com/watch?v=' + videoId,
    );
    console.log(info);
    return new SuccessResponse(info);
  }
}
