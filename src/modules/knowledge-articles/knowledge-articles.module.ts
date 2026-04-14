import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AbilityModule } from '@/common/ability/ability.module';
import { TasksModule } from '@/modules/tasks/tasks.module';
import { knowledgeArticlesAbilityDefinitions } from '@/modules/knowledge-articles/ability/knowledge-articles.ability';
import { KnowledgeArticlesController } from '@/modules/knowledge-articles/controller/knowledge-articles.controller';
import { KnowledgeArticlesService } from '@/modules/knowledge-articles/service/knowledge-articles.service';
import { KnowledgeArticlesRepository } from '@/modules/knowledge-articles/repository/knowledge-articles.repository';

@Module({
  imports: [
    DatabaseModule,
    TasksModule,
    AbilityModule.forModule(knowledgeArticlesAbilityDefinitions),
  ],
  controllers: [KnowledgeArticlesController],
  providers: [KnowledgeArticlesService, KnowledgeArticlesRepository],
})
export class KnowledgeArticlesModule {}
