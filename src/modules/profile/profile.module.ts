import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { ProfileController } from '@/modules/profile/controller/profile.controller';
import { ProfileService } from '@/modules/profile/service/profile.service';
import { ProfileRepository } from '@/modules/profile/repository/profile.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepository],
  exports: [ProfileService],
})
export class ProfileModule {}
