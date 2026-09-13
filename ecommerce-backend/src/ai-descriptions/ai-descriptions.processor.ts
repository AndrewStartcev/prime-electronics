import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { AiDescriptionsService } from './ai-descriptions.service';

@Processor('ai-descriptions')
export class AiDescriptionsProcessor {
  constructor(private readonly service: AiDescriptionsService) {}

  @Process({ name: 'generate-product', concurrency: 2 })
  async handleGenerate(job: Job<{ productId: string; batchId: string }>) {
    const { productId, batchId } = job.data;
    try {
      await this.service.generateProductDraft(productId, batchId);
      await this.service.finishBatchItem(batchId, true);
      return { success: true };
    } catch (error) {
      await this.service.markDraftError(productId, batchId, error);
      await this.service.finishBatchItem(batchId, false);
      throw error;
    }
  }
}
