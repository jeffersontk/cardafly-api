import { Body, Controller, Post } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('nutrition')
@Controller('nutrition')
export class NutritionController {
  constructor(private service: NutritionService) {}

  @Post('compute')
  compute(@Body() body: { items: { name: string; grams: number }[] }) {
    return this.service.compute(body.items || []);
  }
}
