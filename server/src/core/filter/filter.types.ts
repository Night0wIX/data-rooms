export type AppErrorResponse = {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
};
