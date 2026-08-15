import { Injectable } from "@nestjs/common";
import type { AuthenticatedUser } from "@/modules/auth/auth.types.js";
import { UserRepository } from "./user.repository.js";
import { plainToInstance } from "class-transformer";
import { UserResponseDto } from "./dto/user-response.dto.js";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  upsertFromAuthenticatedUser(authenticatedUser: AuthenticatedUser) {
    return this.userRepository.upsertFromAuthenticatedUser(authenticatedUser);
  }

  async getUserById(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findUserById(userId);

    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
  }
}
