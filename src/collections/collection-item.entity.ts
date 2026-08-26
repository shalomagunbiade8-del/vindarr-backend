import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

import { Collection } from './collection.entity';
import { Saved } from '../saved/saved.entity';

@Entity('collection_items')
@Unique(
  ['collectionId', 'savedItemId'],
)
export class CollectionItem {

  @PrimaryGeneratedColumn()
  id: number;


  @Column()
  collectionId: number;


  @Column()
  savedItemId: number;


  @Column({
    type: 'int',
    default: 0,
  })
  position: number;


  @ManyToOne(
    () => Collection,
    collection =>
      collection.items,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'collectionId',
  })
  collection: Collection;


  @ManyToOne(
    () => Saved,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'savedItemId',
  })
  savedItem: Saved;

}