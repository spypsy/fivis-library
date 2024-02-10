import { languages } from 'countries-list';

export type LangEnum = keyof typeof languages;

export type Tag = {
  id?: string;
  name: string;
};

type BaseBookfields = {
  isbn: string;
  title: string;
  subtitle: string;
  authors: string[];
  publisher?: string;
  publishedDate: Date;
  description: string;
  pageCount: number;
  printType: 'BOOK' | 'MAGAZINE';
  language: LangEnum;
  categories: string[];
};

export type ImageLinks = {
  smallThumbnail: string;
  thumbnail: string;
};

export type IndustryIdentifier = {
  type: string;
  identifier: string;
};

export type BookData = Partial<BaseBookfields> & {
  id: string;
  imageLinks?: ImageLinks;
  originalPublishedYear?: number;
  originalLanguage?: LangEnum;
};

export type UserEntryData = {
  rating: number;
  comment: string;
  location: string; // TODO: decide on format later
  category?: string;
  subcategory?: string;
  originalPublishedYear?: number;
  originalLanguage?: LangEnum;
  tags: Tag[];
};

export type ResponseData = {
  kind: string;
  totalItems: number;
  items: ItemResponseData[];
};

export type ItemResponseData = {
  kind: string;
  id: string;
  etag: string;
  selfLink: string;
  volumeInfo: VolumeResponseData;
  saleInfo: {
    country: string;
    saleability: string;
    isEbook: boolean;
  };
  accessInfo: {
    country: string;
    viewability: string;
    embeddable: boolean;
    publicDomain: boolean;
    textToSpeechPermission: string;
    epub: {
      isAvailable: boolean;
    };
    pdf: {
      isAvailable: boolean;
    };
    webReaderLink: string;
    accessViewStatus: string;
    quoteSharingAllowed: boolean;
  };
  searchInfo: {
    textSnippet: string;
  };
};

export type VolumeResponseData = BaseBookfields & {
  industryIdentifiers: IndustryIdentifier[];
  readingModes: {
    text: boolean;
    image: boolean;
  };
  imageLinks?: ImageLinks;
  averageRating: number;
  ratingsCount: number;
  maturityRating: string;
  allowAnonLogging: boolean;
  contentVersion: string;
  previewLink: string;
  infoLink: string;
  canonicalVolumeLink: string;
};
