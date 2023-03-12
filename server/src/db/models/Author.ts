import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookDao } from './Book';

@Entity({ name: 'author' })
export class AuthorDao {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  name: string;

  @ManyToMany(() => BookDao, (b) => b.authors)
  books?: BookDao[];
}
