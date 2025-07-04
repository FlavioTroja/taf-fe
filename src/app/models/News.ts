export interface News {
  id: string;
  version: number;
  title: string;
  content: string;
  author: string;
  photos: string[];
  cover: string;
  publicationDate: string;
  tags: string[];
  municipalityId: string;
}

export type PartialNews = Partial<News>;

export function createNewsPayload(payload: any) {
  const newsDTO = {
    title: payload.title || null,
    author: payload.author || null,
    publicationDate: payload.publicationDate || null,
    cover: payload.cover || null,
    photos: payload.photos || null,
    tags: payload.tags || null,
    content: payload.content || null,
    municipalityId: payload.municipalityId || null,
  };

  return newsDTO
}
