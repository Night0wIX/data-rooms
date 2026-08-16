import { Expose } from "class-transformer";

export class SharedResourceResponseDto {
  @Expose()
  resourceType!: string;

  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  role!: string;
}
