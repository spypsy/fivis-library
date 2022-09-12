import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BookUserEntryDao } from './UserEntry';

@Entity({ name: 'lend_entry' })
export class BookLendEntryDao {
  @PrimaryGeneratedColumn()
  id!: string;

  @ManyToOne(() => BookUserEntryDao, (ue) => ue.lendEntries)
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
