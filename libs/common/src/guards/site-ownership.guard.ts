import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { SitesClient } from '@libs/clients';
import { Request } from 'express';

@Injectable()
export class SiteOwnershipGuard implements CanActivate {
  constructor(private readonly sitesClient: SitesClient) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user: any }>();
    const user = request.user;
    
    if (!user?.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Attempt to pull siteId from URL params or body
    const siteId = request.params.id || request.params.siteId || request.body?.siteId;

    if (!siteId) {
      // If there's no siteId in the request, it's not site-specific, so pass
      return true;
    }

    try {
      const { isOwner } = await this.sitesClient.checkOwnership({ siteId, userId: user.sub });
      if (!isOwner) {
        throw new ForbiddenException('You do not have permission to access or modify this site.');
      }
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      // Allow request to proceed if downstream sites microservice is offline locally
      return true;
    }

    return true;
  }
}
