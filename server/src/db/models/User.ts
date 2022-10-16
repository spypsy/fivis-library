import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { BookDao } from './Book';
import { BookUserEntryDao } from './BookUserEntry';

export enum UserType {
  ADMIN,
  READER,
}

@Entity({ name: 'user' })
export class UserDao {
  @PrimaryGeneratedColumn()
  id?: string;

  @Column()
  firstName?: string;

  @Column()
  lastName?: string;

  @Column()
  email?: string;

  @OneToMany(() => BookUserEntryDao, (ue) => ue.user, { cascade: true })
  @JoinColumn()
  bookEntries?: BookUserEntryDao[];

  @Column({ unique: true })
  username: string;

  @Column()
  userType?: UserType;

  @Column({ type: 'blob' })
  password: Buffer;

  @Column({ type: 'blob' })
  salt: Buffer;
}
