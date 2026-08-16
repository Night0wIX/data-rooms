import { BaseApiService } from "@/shared/services/base-api.service";
import type { CurrentUser } from "./auth.types";

class AuthService extends BaseApiService {
  constructor() {
    super("/users");
  }

  async getCurrentUser(): Promise<CurrentUser> {
    const { data } = await this.get<CurrentUser>(this.url("/me"));
    return data;
  }
}

export const authService = new AuthService();
