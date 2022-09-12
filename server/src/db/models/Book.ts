import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { AuthorDao } from './Author';
import { BookUserEntryDao } from './UserEntry';

@Entity({ name: 'book' })
export class BookDao {
  @PrimaryColumn()
  isbn!: string;

  @Column()
  name: string;

  @ManyToMany(() => AuthorDao, (a) => a.books)
  @JoinColumn()
  authors: AuthorDao[];

  @OneToMany(() => BookUserEntryDao, (ue) => ue.book, { cascade: true })
  @JoinColumn()
  userEntries: BookUserEntryDao[];

  @Column()
  date: Date;
}
