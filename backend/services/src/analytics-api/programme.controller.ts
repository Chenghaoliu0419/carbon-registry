import {
  Controller,
  Get,
  Logger,
  Query,
  UseGuards,
  Request,
  Post,
  Body,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { StatList } from "carbon-services-lib";
import { ApiKeyJwtAuthGuard ,PoliciesGuardEx,Action,ChartStatList} from "carbon-services-lib";
import { AnalyticsAPIService } from "./analytics.api.service";
import { Stat } from "carbon-services-lib";
import { Programme } from "../shared/entities/programme.entity";
import { AggregateAPIService } from "./aggregate.api.service";

@ApiTags("Programme")
@ApiBearerAuth()
@Controller("programme")
export class ProgrammeController {
  constructor(
    private analyticsService: AnalyticsAPIService,
    private aggService: AggregateAPIService,
    private readonly logger: Logger
  ) {}

  @ApiBearerAuth()
  @UseGuards(
    ApiKeyJwtAuthGuard,
    PoliciesGuardEx(true, Action.Read, Stat, true, true)
  )
  // @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, User, true))
  @Post("dashboard")
  async programmesStaticDetails(@Body() query: StatList, @Request() req) {
    const companyId =
      req?.user?.companyId !== null ? req?.user?.companyId : null;
    console.log("user ---- > ", req?.user);
    return this.analyticsService.programmesStaticDetails(
      req.abilityCondition,
      query,
      companyId
    );
  }

  @ApiBearerAuth()
  @UseGuards(
    ApiKeyJwtAuthGuard,
    PoliciesGuardEx(true, Action.Read, Stat, true, true)
  )
  // @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, User, true))
  @Post("dashboardCharts")
  async programmesStaticChartDetails(
    @Body() query: ChartStatList,
    @Request() req
  ) {
    const companyId =
      req?.user?.companyId !== null ? req?.user?.companyId : null;
    return this.analyticsService.programmesStaticChartsDetails(
      req.abilityCondition,
      query,
      companyId
    );
  }

  @ApiBearerAuth()
  @UseGuards(
    ApiKeyJwtAuthGuard,
    PoliciesGuardEx(true, Action.Read, Stat, true, true)
  )
  @Post("agg")
  async aggQueries(
    @Body() query: StatList,
    @Request() req
  ) {
    const companyId =
      req?.user?.companyId !== null ? req?.user?.companyId : null;
    return this.aggService.getAggregateQuery(
      req.abilityCondition,
      query,
      companyId,
      req.user?.companyRole
    );
  }
}
