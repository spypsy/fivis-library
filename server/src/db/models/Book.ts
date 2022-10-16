import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { AuthorDao } from './Author';
import { BookUserEntryDao } from './BookUserEntry';

@Entity({ name: 'book' })
export class BookDao {
  @PrimaryColumn()
  isbn!: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle?: string;

  @ManyToMany(() => AuthorDao, (a) => a.books, { cascade: true })
  @JoinColumn()
  authors: AuthorDao[];

  @OneToMany(() => BookUserEntryDao, (ue) => ue.book, { cascade: true })
  @JoinColumn()
  userEntries?: BookUserEntryDao[];

  @Column()
  publishedDate: Date;

  @Column()
  pageCount: number;

  @Column()
  language: string;
}

const testData = {
  kind: 'books#volumes',
  totalItems: 1,
  items: [
    {
      kind: 'books#volume',
      id: 'G_hdPwAACAAJ',
      etag: 'Rw0wlzp/mFw',
      selfLink: 'https://www.googleapis.com/books/v1/volumes/G_hdPwAACAAJ',
      volumeInfo: {
        title: 'The Fellowship of the Ring',
        subtitle: 'Being the First Part of the Lord of the Rings',
        authors: ['J. R. R. Tolkien'],
        publishedDate: '1992',
        description:
          'A New York Times Bestseller Part One of The Lord of the Rings In a sleepy village in the Shire, young Frodo Baggins is faced with an immense task as his elderly cousin Bilbo entrusts the One Ring of Sauron to his care. Frodo must make a perilous journey across Middle-earth to the Cracks of Doom, there to destroy the all-powerful Ring and foil the Dark Lord in his evil purpose.',
        industryIdentifiers: [
          {
            type: 'ISBN_10',
            identifier: '039564738X',
          },
          {
            type: 'ISBN_13',
            identifier: '9780395647387',
          },
        ],
        readingModes: {
          text: false,
          image: false,
        },
        pageCount: 1193,
        printType: 'BOOK',
        categories: ['Fiction'],
        averageRating: 4,
        ratingsCount: 2425,
        maturityRating: 'NOT_MATURE',
        allowAnonLogging: false,
        contentVersion: 'preview-1.0.0',
        language: 'en',
        previewLink:
          'http://books.google.co.uk/books?id=G_hdPwAACAAJ&dq=isbn:9780395647387&hl=&cd=1&source=gbs_api',
        infoLink:
          'http://books.google.co.uk/books?id=G_hdPwAACAAJ&dq=isbn:9780395647387&hl=&source=gbs_api',
        canonicalVolumeLink:
          'https://books.google.com/books/about/The_Fellowship_of_the_Ring.html?hl=&id=G_hdPwAACAAJ',
      },
      saleInfo: {
        country: 'GB',
        saleability: 'NOT_FOR_SALE',
        isEbook: false,
      },
      accessInfo: {
        country: 'GB',
        viewability: 'NO_PAGES',
        embeddable: false,
        publicDomain: false,
        textToSpeechPermission: 'ALLOWED',
        epub: {
          isAvailable: false,
        },
        pdf: {
          isAvailable: false,
        },
        webReaderLink:
          'http://play.google.com/books/reader?id=G_hdPwAACAAJ&hl=&printsec=frontcover&source=gbs_api',
        accessViewStatus: 'NONE',
        quoteSharingAllowed: false,
      },
      searchInfo: {
        textSnippet:
          'A New York Times BestsellerPart One of The Lord of the RingsIn a sleepy village in the Shire, young Frodo Baggins is faced with an immense task as his elderly cousin Bilbo entrusts the One Ring of Sauron to his care.',
      },
    },
  ],
};
