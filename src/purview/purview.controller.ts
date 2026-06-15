import {
Controller,
Post,
Get,
Param,
Req,
UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { PurviewService } from './purview.service';

@Controller('purview')
export class PurviewController {

constructor(
private readonly purviewService:
PurviewService,
){}

@UseGuards(AuthGuard('jwt'))
@Post(':creatorId')
addCreator(
@Param('creatorId') creatorId:string,
@Req() req,
){
return this.purviewService.addCreator(
req.user.userId,
Number(creatorId),
);
}

@UseGuards(AuthGuard('jwt'))
@Get('my-creators')
getCreators(
@Req() req,
){
return this.purviewService.getCreators(
req.user.userId,
);
}

@UseGuards(AuthGuard('jwt'))
@Get('feed')
getFeed(
@Req() req,
){
return this.purviewService.getFeed(
req.user.userId,
);
}
}
