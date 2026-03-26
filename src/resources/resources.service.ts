import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Resource } from './resource.entity';

@Injectable()
export class ResourcesService {

  constructor(
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
  ) {}

  async create(data: Partial<Resource>) {
    const resource = this.resourceRepository.create(data);
    return this.resourceRepository.save(resource);
  }

  async findAll() {
    return this.resourceRepository.find();
  }

  async findByCoach(coachId: number) {

  return this.resourceRepository.find({
    where: { coachId: coachId }
  });

} 

}
