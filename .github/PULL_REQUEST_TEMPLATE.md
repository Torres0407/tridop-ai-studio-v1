## Pull Request Checklist

Before requesting review, confirm ALL of the following:

### Database
- [ ] If this PR adds or changes database tables/collections — migrations are included and tested locally
- [ ] Migrations are scoped to the correct service schema only (identity.*, billing.*, etc.)

### Service boundaries
- [ ] The changed service only touches its own schema/database — no cross-schema queries
- [ ] If a service needs data from another service, it uses the RPC client in `libs/clients/`, not a direct DB call

### Communication
- [ ] All inter-service RPC calls go through `libs/clients/*Client` methods — no bare `ClientProxy.send()` calls
- [ ] All BullMQ event names are imported from `libs/common/events/eventNames.ts` — no inline strings

### Transport / HTTP
- [ ] Internal services (non-gateway) expose only `@MessagePattern` handlers — no stray `@Get`/`@Post`
- [ ] `api-gateway` is the only service with an HTTP listener

### Observability
- [ ] If a new service is added: `initTracing(serviceName)` is called first in `main.ts`
- [ ] Trace context is propagated through Redis RPC payloads and BullMQ job data

### Health
- [ ] `/health` endpoint responds with 200 (checks DB + Redis connections)
- [ ] `docker-compose up` starts the changed service cleanly alongside existing services

### Environment
- [ ] `.env` for the changed service contains only vars it actually needs (per §5 of the spec)
- [ ] No secrets committed; all secrets are in GitHub Environment secrets

### Services affected by this PR
<!-- List each service affected -->
- 

### Additional notes
<!-- Anything the reviewer should know -->
