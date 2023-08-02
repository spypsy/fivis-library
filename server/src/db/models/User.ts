import * as bcrypt from 'bcrypt';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { BookDao } from './Book';
import { BookUserEntryDao } from './BookUserEntry';

export enum UserType {
  ADMIN,
  READER,
}

@Entity({ name: 'user' })
export class UserDao {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  email?: string;

  @OneToMany(() => BookUserEntryDao, ue => ue.user, { cascade: true })
  bookEntries?: BookUserEntryDao[];

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  userType?: UserType;

  // @Column({ type: 'blob' })
  // password?: Buffer;
  @Column()
  password: string;

  // @Column({ type: 'blob' })
  // salt?: Buffer;

  async validatePassword(unencryptedPassword: string) {
    return bcrypt.compare(unencryptedPassword, this.password);
  }
}
