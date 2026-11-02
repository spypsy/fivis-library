import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { UserDao } from './User';

@Entity({ name: 'library_share' })
@Unique(['owner', 'sharedWith'])
export class LibraryShareDao {
  @PrimaryGeneratedColumn()
  id!: string;

  @ManyToOne(() => UserDao)
  @JoinColumn()
  owner!: UserDao;

  @ManyToOne(() => UserDao)
  @JoinColumn()
  sharedWith!: UserDao;

  @CreateDateColumn()
  createdAt!: Date;
}
