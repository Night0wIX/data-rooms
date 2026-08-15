import { Expose } from "class-transformer";

export class BreadcrumbItemDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;
}
