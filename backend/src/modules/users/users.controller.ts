import {
  Body,
  Controller,
  Get,
  Patch,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ProfileResponseDto } from "./dto/profile-response.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UsersService } from "./users.service";

@Controller("profile")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getProfile(
    @CurrentUser("sub") userId: string | null
  ): Promise<ProfileResponseDto> {
    if (!userId) {
      throw new UnauthorizedException("Missing user context");
    }
    const user = await this.usersService.findById(userId);
    return this.usersService.toProfileResponse(user);
  }

  @Patch()
  async updateProfile(
    @CurrentUser("sub") userId: string | null,
    @Body() updateProfileDto: UpdateProfileDto
  ): Promise<ProfileResponseDto> {
    if (!userId) {
      throw new UnauthorizedException("Missing user context");
    }
    const user = await this.usersService.updateProfile(userId, updateProfileDto);
    return this.usersService.toProfileResponse(user);
  }
}
