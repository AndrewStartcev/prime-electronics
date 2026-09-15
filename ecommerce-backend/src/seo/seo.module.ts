import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';
import { SeoTagTileService } from './seo-tag-tile.service';

@Module({
  imports: [SharedModule],
  controllers: [SeoController],
  providers: [SeoService, SeoTagTileService],
  exports: [SeoService, SeoTagTileService],
})
export class SeoModule {}
