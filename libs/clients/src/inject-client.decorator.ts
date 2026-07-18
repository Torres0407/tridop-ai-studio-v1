// ─── libs/clients/src/inject-client.decorator.ts ────────────────────────────
// Small utility decorator so each client can inject its ClientProxy by token
// without importing Inject from @nestjs/common in every file.

import { Inject } from '@nestjs/common';

export const InjectClient = (token: string) => Inject(token);
