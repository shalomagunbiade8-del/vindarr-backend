import {
Entity,
PrimaryGeneratedColumn,
Column,
CreateDateColumn,
} from 'typeorm';

@Entity()
export class Purview {

@PrimaryGeneratedColumn()
id: number;

@Column()
userId: number;

@Column()
creatorId: number;

@CreateDateColumn()
createdAt: Date;
}
