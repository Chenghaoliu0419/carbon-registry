import {
  Controller,
  Get,
  UseGuards,
  Request,
  Post,
  Body,
  Query,
  Req,
  HttpException,
  HttpStatus,
  Delete,
  Put,
} from "@nestjs/common";

import { User } from "../shared/entities/user.entity";
import { UserDto } from "../shared/dto/user.dto";
import { UserService,Action ,AppAbility,CaslAbilityFactory,CheckPolicies, PoliciesGuard, PoliciesGuardEx, Role} from "carbon-services-lib";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { QueryDto } from "carbon-services-lib";
import { UserUpdateDto } from "../shared/dto/user.update.dto";
import { PasswordUpdateDto } from "carbon-services-lib";
import { JwtAuthGuard } from "carbon-services-lib";
import { HelperService } from 'carbon-services-lib';
import { ApiKeyJwtAuthGuard } from "carbon-services-lib";

@ApiTags("User")
@ApiBearerAuth()
@Controller("user")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private caslAbilityFactory: CaslAbilityFactory,
    private helperService: HelperService
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(@Request() req) {
    return await this.userService.getUserProfileDetails(req.user.id);
  }

  @ApiBearerAuth('api_key')
  @ApiBearerAuth()
  @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability, body) =>
    ability.can(Action.Create, Object.assign(new User(), body))
  )
  @Post("add")
  addUser(@Body() user: UserDto, @Request() req) {
    if (user.role == Role.Root) {
      throw new HttpException(
        this.helperService.formatReqMessagesString("user.rootCreatesRoot", []),
        HttpStatus.FORBIDDEN
      );
    }
    global.baseUrl = `${req.protocol}://${req.get("Host")}`;
    return this.userService.create(
      user,
      req.user.companyId,
      req.user.companyRole
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, User))
  // @CheckPolicies((ability, body) => ability.can(Action.Update, Object.assign(new User(), body)))
  @Put("update")
  updateUser(@Body() user: UserUpdateDto, @Request() req) {
    global.baseUrl = `${req.protocol}://${req.get("Host")}`;
    return this.userService.update(user, req.abilityCondition);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, User, true))
  // @CheckPolicies((ability, body) => ability.can(Action.Update, Object.assign(new User(), body)))
  @Put("resetPassword")
  resetPassword(@Body() reset: PasswordUpdateDto, @Request() req) {
    return this.userService.resetPassword(
      req.user.id,
      reset,
      req.abilityCondition
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, User, true))
  // @CheckPolicies((ability, body) => ability.can(Action.Update, Object.assign(new User(), body)))
  @Put("regenerateApiKey")
  resetApiKey(@Query("email") email: string, @Request() req) {
    return this.userService.regenerateApiKey(email, req.abilityCondition);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, User, true))
  @Post("query")
  queryUser(@Body() query: QueryDto, @Request() req) {
    console.log(req.abilityCondition);
    return this.userService.query(query, req.abilityCondition);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Delete, User))
  @Delete("delete")
  deleteUser(@Query("userId") userId: number, @Request() req) {
    return this.userService.delete(userId, req.abilityCondition);
  }
}
