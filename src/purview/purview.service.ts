import {
Injectable,
NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Purview } from './purview.entity';

import { User } from '../users/user.entity';

import { Video } from '../videos/video.entity';

@Injectable()
export class PurviewService {

constructor(

@InjectRepository(Purview)
private purviewRepo: Repository<Purview>,

@InjectRepository(User)
private userRepo: Repository<User>,

@InjectRepository(Video)
private videoRepo: Repository<Video>,


) {}

async addCreator(
userId:number,
creatorId:number,
){

const existing =
  await this.purviewRepo.findOne({
    where:{
      userId,
      creatorId,
    }
  });

if(existing){
  return {
    message:'Already in Purview'
  };
}

const item =
  this.purviewRepo.create({
    userId,
    creatorId,
  });

await this.purviewRepo.save(item);

return {
  success:true
};


}

async getCreators(userId:number){

const records =
  await this.purviewRepo.find({
    where:{ userId }
  });

const ids =
  records.map(x => x.creatorId);

if(!ids.length){
  return [];
}

return this.userRepo.findByIds(ids);

}

async getFeed(userId:number){

const records =
  await this.purviewRepo.find({
    where:{ userId }
  });

const ids =
  records.map(x => x.creatorId);

if(!ids.length){
  return [];
}

return this.videoRepo.find({
  where:
    ids.map(id => ({
      creatorId:id
    })),
  relations:['creator'],
  order:{
    createdAt:'DESC'
  }
});

}
}
