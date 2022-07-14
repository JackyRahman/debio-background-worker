import { CacheModule, Module } from '@nestjs/common';
import { CachesService } from './caches.service';
import * as redisStore from 'cache-manager-redis-store';
import {
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';

require('dotenv').config(); // eslint-disable-line

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async (
      ) => {
        return {
          store: redisStore,
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
          auth_pass: process.env.REDIS_PASSWORD,
        };
      },
    }),
  ],
  providers: [CachesService],
  exports: [CachesService],
})
export class CachesModule {}

export * from './caches.service';
