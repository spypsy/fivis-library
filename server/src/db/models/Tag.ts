import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { BookUserEntryDao } from './BookUserEntry';

@Entity({ name: 'tag' })
export class TagDao {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  name: string;

  @ManyToMany(() => BookUserEntryDao, book => book.tags)
  books: BookUserEntryDao[];
}
