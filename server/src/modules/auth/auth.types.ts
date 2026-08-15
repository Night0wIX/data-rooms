export type AuthenticatedUser = {
  id: string;
  email: string;
};

export type AuthenticatedRequest = {
  headers: { authorization?: string };
  user: AuthenticatedUser;
};

export type SupabaseJwtPayload = {
  sub: string;
  email: string;
};
