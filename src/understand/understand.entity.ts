import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Understand {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  videoId: number;

} 

