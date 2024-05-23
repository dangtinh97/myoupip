import { Controller, Get } from '@nestjs/common';
import { YoutubeService } from './youtube.service';

@Controller('/youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  @Get('/new')
  async videoSuggest(): Promise<any> {
    return (await this.youtubeService.videoSuggest()).json();
  }
}
