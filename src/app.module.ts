import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntities } from './common';
import { EscrowAccounts } from './common/escrow/models/deposit.entity';
import { IndexerModule } from './indexer/indexer.module';
import { EthereumListenerModule } from './listeners/ethereum-listener/ethereum-listener.module';
import { SubstrateListenerModule } from './listeners/substrate-listener/substrate-listener.module';
import { SchedulersModule } from './schedulers/schedulers.module';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Module({
  imports: [
    ScheduleModule.forRoot(),
    GCloudSecretManagerModule.withConfig(process.env.PARENT),
    TypeOrmModule.forRootAsync({
      inject: [GCloudSecretManagerService],
      useFactory: async (
        gCloudSecretManagerService: GCloudSecretManagerService,
      ) => {
        return {
          type: 'postgres',
          host: process.env.POSTGRES_HOST,
          port: 5432,
          username: process.env.POSTGRES_USERNAME,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.DB_POSTGRES,
          entities: [EscrowAccounts],
          autoLoadEntities: true,
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      name: 'dbLocation',
      inject: [GCloudSecretManagerService],
      useFactory: async (
        gCloudSecretManagerService: GCloudSecretManagerService,
      ) => {
        return {
          type: 'postgres',
          host: process.env.POSTGRES_HOST,
          port: 5432,
          username: process.env.POSTGRES_USERNAME,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.DB_LOCATIONS,
          entities: [...LocationEntities],
          autoLoadEntities: true,
        };
      },
    }),
    IndexerModule,
    SchedulersModule,
    SubstrateListenerModule,
    EthereumListenerModule,
    MailerModule,
  ],
})
export class AppModule {}
