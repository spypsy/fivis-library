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

export type VolumeResponseData = {
  title: string;
  subtitle: string;
  authors: string[];
  publishedDate: Date;
  description: string;
  industryIdentifiers: IndustryIdentifier[];
  readingModes: {
    text: boolean;
    image: boolean;
  };
  imageLinks?: ImageLinks;
  pageCount: number;
  printType: 'BOOK' | 'MAGAZINE';
  categories: string[];
  averageRating: number;
  ratingsCount: number;
  maturityRating: string;
  allowAnonLogging: boolean;
  contentVersion: string;
  language: string;
  previewLink: string;
  infoLink: string;
  canonicalVolumeLink: string;
};

export type ImageLinks = {
  smallThumbnail: string;
  thumbnail: string;
};

export type IndustryIdentifier = {
  type: string;
  identifier: string;
};

export type BookData = {
  id: string;
  isbn: string;
  title?: string;
  subtitle?: string;
  authors?: string[];
  publishedDate?: Date;
  description?: string;
  pageCount?: number;
  printType?: 'BOOK' | 'MAGAZINE';
  categories?: string[];
  language?: string;
  imageLinks?: ImageLinks;
};

export type UserEntryData = {
  rating: number;
  comment: string;
  location: string; // TODO: decide on format later
  category?: string;
  subcategory?: string;
};
