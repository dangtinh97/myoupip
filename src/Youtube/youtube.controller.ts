import { Controller, Get, Req } from '@nestjs/common';
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
  async videoSuggest(): Promise<any> {
    return (await this.youtubeService.videoSuggest()).json();
  }
}
