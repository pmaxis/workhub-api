import { Action, PermissionDefinition } from '@/common/ability/ability.types';

export const KNOWLEDGE_ARTICLE_PERMISSIONS = {
  CREATE: 'knowledge_articles.create',
  READ: 'knowledge_articles.read',
  UPDATE: 'knowledge_articles.update',
  DELETE: 'knowledge_articles.delete',
} as const;

export const knowledgeArticlesAbilityDefinitions: PermissionDefinition[] = [
  {
    permission: KNOWLEDGE_ARTICLE_PERMISSIONS.CREATE,
    define: (can) => can(Action.Create, 'KnowledgeArticle'),
  },
  {
    permission: KNOWLEDGE_ARTICLE_PERMISSIONS.READ,
    define: (can, user) => {
      can(Action.Read, 'KnowledgeArticle', { userId: user.userId });
    },
  },
  {
    permission: KNOWLEDGE_ARTICLE_PERMISSIONS.UPDATE,
    define: (can, user) => {
      can(Action.Read, 'KnowledgeArticle', { userId: user.userId });
      can(Action.Update, 'KnowledgeArticle', { userId: user.userId });
    },
  },
  {
    permission: KNOWLEDGE_ARTICLE_PERMISSIONS.DELETE,
    define: (can, user) => {
      can(Action.Read, 'KnowledgeArticle', { userId: user.userId });
      can(Action.Delete, 'KnowledgeArticle', { userId: user.userId });
    },
  },
];
