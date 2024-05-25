import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { YoutubeService } from './youtube.service';

@Controller('/youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  @Get('/')
  async detailVideo(@Req() request: Request): Promise<any> {
    const videoId = request['query']['v'] ?? '';

    return (await this.youtubeService.detailVideo(videoId)).json();
  }

  @Get('/new')
  async videoSuggest(@Req() request: Request): Promise<any> {
    return (await this.youtubeService.videoSuggest(request)).json();
  }

  @Get('/search')
  async search(@Query('q') q: string): Promise<any> {
    return (await this.youtubeService.search(q)).json();
  }
  @Get('/suggest-by-video-id')
  async videoRelated(@Query('video-id') q: string): Promise<any> {
    return (await this.youtubeService.videoRelated(q)).json();
  }

  @Get('/suggest')
  async suggestKeyword(@Query('keyword') keyword: string): Promise<any> {
    return (await this.youtubeService.suggestKeyword(keyword)).json();
  }
}
