import { Controller, Get } from "@nestjs/common";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "@/modules/auth/auth.types.js";
import { ROUTES } from "@/shared/constants/routes.js";
import { UserService } from "./user.service.js";
import { UserResponseDto } from "./dto/user-response.dto.js";

@Controller(ROUTES.users.root)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(ROUTES.users.currentUser)
  getCurrentUser(@CurrentUser() authenticatedUser: AuthenticatedUser): Promise<UserResponseDto> {
    return this.userService.getUserById(authenticatedUser.id);
  }
}
