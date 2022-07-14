import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DebioConversionService {
  private readonly logger: Logger = new Logger(DebioConversionService.name);
  constructor(
    private readonly gCloudSecretManagerService: GCloudSecretManagerService,
  ) {}

  async getExchange() {
    try {
      const res = await axios.get(
        `${process.env.REDIS_STORE_URL}/cache`,
        {
          auth: {
            username: process.env.REDIS_STORE_USERNAME,
            password: process.env.REDIS_STORE_PASSWORD,
          },
        },
      );

      return res.data;
    } catch (error) {
      await this.logger.log(`API conversion": ${error.message}`);
    }
  }
}
