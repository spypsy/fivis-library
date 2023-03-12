import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
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
