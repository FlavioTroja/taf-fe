export interface News {
  id: string;
  version: number;
  title: string;
  content: string;
  author: string;
  publicationDate: string;
  tags: string[];
  municipalityId: string;
}

export type PartialNews = Partial<News>;
