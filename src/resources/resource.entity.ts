import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Resource {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  coachId: number;

  @Column()
  title: string;

  @Column()
  type: string;

  @Column()
  url: string;

} 

