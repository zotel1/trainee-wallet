import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type RoleName = 'USER' | 'ADMIN';

export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
