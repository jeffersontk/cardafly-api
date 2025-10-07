import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const UserId = createParamDecorator((_d, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.user?.userId as string | undefined;
});
