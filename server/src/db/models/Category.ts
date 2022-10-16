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

@Entity({ name: 'category' })
export class CategoryDao {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('simple-array', { nullable: true })
  subcategories?: string[];
}
