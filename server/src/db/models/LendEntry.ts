import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookUserEntryDao } from './BookUserEntry';

@Entity({ name: 'lend_entry' })
export class BookLendEntryDao {
  @PrimaryGeneratedColumn()
  id!: string;

  @ManyToOne(() => BookUserEntryDao, (ue) => ue.lendEntries)
  @JoinColumn()
  userEntry: BookUserEntryDao;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  dateLent: Date;

  @Column()
  dateOwed: Date;

  // TODO: reminders
}
