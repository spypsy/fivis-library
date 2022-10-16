import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookDao } from './Book';
import { BookLendEntryDao } from './LendEntry';
import { UserDao } from './User';

@Entity({ name: 'user_entry' })
export class BookUserEntryDao {
  @PrimaryGeneratedColumn()
  id!: string;

  @ManyToOne(() => UserDao, (u) => u.bookEntries)
  user: UserDao;

  @ManyToOne(() => BookDao, (b) => b.userEntries)
  book: BookDao;

  @Column()
  addedAt: Date;

  @Column()
  rating: number;

  @Column()
  isFinished: boolean;

  @Column()
  finishedAt: Date;

  @Column('text')
  comment: string;

  @Column('text')
  location: string; // TODO: decide on format later

  @OneToMany(() => BookLendEntryDao, (le) => le.userEntry)
  @JoinColumn()
  lendEntries: BookLendEntryDao[];

  @Column()
  category?: string;

  @Column()
  subcategory?: string;
}
