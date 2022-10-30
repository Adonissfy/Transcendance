import { CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    return context.switchToHttp().getRequest().isAuthenticated();
  }
}