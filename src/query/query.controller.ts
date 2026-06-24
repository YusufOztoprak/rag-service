import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './SearchService';

@Controller('query')
export class QueryController {
  constructor(private readonly searchService: SearchService) {}

  @Get('search')
  async search(@Query('q') q: string) {
    return this.searchService.search(q, 3);
  }
  @Get('ask')
  async ask(@Query('q') q: string) {
    const answer = await this.searchService.ask(q);
    return { question: q, answer };
  }
}
