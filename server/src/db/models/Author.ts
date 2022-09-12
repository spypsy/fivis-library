import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { BookDao } from './Book';

@Entity({ name: 'author' })
export class AuthorDao {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  name: string;

  @OneToMany(() => BookDao, (b) => b.authors, { cascade: true })
  books: BookDao[];
}
