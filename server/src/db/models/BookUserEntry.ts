import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BookDao } from './Book';
import { BookLendEntryDao } from './LendEntry';
import { TagDao } from './Tag';
import { UserDao } from './User';

@Entity({ name: 'user_entry' })
export class BookUserEntryDao {
  @PrimaryGeneratedColumn()
  id!: string;

  @ManyToOne(() => UserDao, u => u.bookEntries)
  @JoinColumn()
  user: UserDao;

  @ManyToOne(() => BookDao, b => b.userEntries, { cascade: true })
  @JoinColumn()
  book: BookDao;

  @Column({ nullable: true })
  publisher?: string;

  @Column({ nullable: true })
  subtitle?: string;

  @ManyToMany(() => TagDao, tag => tag.books, { cascade: true, onDelete: 'CASCADE' })
  @JoinTable()
  tags?: TagDao[];

  @Column()
  addedAt: Date;

  @Column({ nullable: true })
  rating?: number;

  @Column({ nullable: true })
  isFinished?: boolean;

  @Column({ nullable: true })
  finishedAt?: Date;

  @Column('text', { nullable: true })
  comment?: string;

  @Column({ nullable: true })
  originalPublishedYear?: number;

  @Column({ nullable: true })
  originalLanguage?: string;

  @Column('text', { nullable: true })
  location?: string; // TODO: decide on format later

  @OneToMany(() => BookLendEntryDao, le => le.userEntry, { nullable: true, cascade: true, onDelete: 'CASCADE' })
  lendEntries?: BookLendEntryDao[];

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  subcategory?: string;
}
