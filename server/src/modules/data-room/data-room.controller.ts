import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "@/modules/auth/auth.types.js";
import { ROUTES } from "@/shared/constants/index.js";
import { DataRoomService } from "./data-room.service.js";
import { DataRoomResponseDto } from "./dto/data-room-response.dto.js";
import { CreateDataRoomDto } from "./dto/create-data-room.dto.js";
import { UpdateDataRoomDto } from "./dto/update-data-room.dto.js";

@Controller(ROUTES.dataRooms.root)
export class DataRoomController {
  constructor(private readonly dataRoomService: DataRoomService) {}

  @Post()
  createDataRoom(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Body() createDataRoomDto: CreateDataRoomDto,
  ): Promise<DataRoomResponseDto> {
    return this.dataRoomService.createDataRoom(authenticatedUser.id, createDataRoomDto);
  }

  @Get()
  listDataRooms(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<DataRoomResponseDto[]> {
    return this.dataRoomService.listDataRoomsForOwner(authenticatedUser.id);
  }

  @Get(ROUTES.dataRooms.byId)
  getDataRoom(
    @Param("dataRoomId") dataRoomId: string,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<DataRoomResponseDto> {
    return this.dataRoomService.getDataRoomById(dataRoomId, authenticatedUser.id);
  }

  @Patch(ROUTES.dataRooms.byId)
  updateDataRoom(
    @Param("dataRoomId") dataRoomId: string,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Body() updateDataRoomDto: UpdateDataRoomDto,
  ): Promise<DataRoomResponseDto> {
    return this.dataRoomService.updateDataRoom(dataRoomId, authenticatedUser.id, updateDataRoomDto);
  }

  // TODO: add delete logic until folder module completed
}
