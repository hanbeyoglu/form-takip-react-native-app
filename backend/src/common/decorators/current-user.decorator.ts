import { createParamDecorator, ExecutionContext } from "@nestjs/common";

type JwtUser = {
  sub: string;
  phoneNumber: string;
};

export const CurrentUser = createParamDecorator(
  (data: keyof JwtUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtUser }>();
    if (!request.user) {
      return null;
    }
    return data ? request.user[data] : request.user;
  }
);
