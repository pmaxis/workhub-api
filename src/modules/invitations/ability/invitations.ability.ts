import { createCrudAbilityDefinitions } from '@/common/ability/createCrudAbilityDefinitions';

const { permissions: INVITATION_PERMISSIONS, definitions: invitationsAbilityDefinitions } =
  createCrudAbilityDefinitions('invitations', 'Invitation');

export { INVITATION_PERMISSIONS, invitationsAbilityDefinitions };
