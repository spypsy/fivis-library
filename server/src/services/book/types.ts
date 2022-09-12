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
  authors: string[];
  publishedDate: Date;
  description: string;
  industryIdentifiers: IndustryIdentifier[];
  readingModes: {
    text: boolean;
    image: boolean;
  };
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

export type IndustryIdentifier = {
  type: string;
  identifier: string;
};

export type BookData = {
  title?: string;
  authors?: string[];
  publishedDate?: Date;
  description?: string;
  pageCount?: number;
  printType?: 'BOOK' | 'MAGAZINE';
  categories?: string[];
  error?: string;
};
