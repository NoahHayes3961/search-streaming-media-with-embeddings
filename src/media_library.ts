export type MediaDocument = {
  id: string;
  title: string;
  kind: "video" | "podcast";
  creator: string;
  transcript: string;
  url: string;
};

export type IndexedMedia = MediaDocument & {
  embedding: number[];
};

export type SearchResult = MediaDocument & {
  score: number;
};

export function searchableText(item: MediaDocument): string {
  return [item.title, item.kind, item.creator, item.transcript].join("\n");
}

export function cosineSimilarity(left: number[], right: number[]): number {
  if (left.length === 0 || left.length !== right.length) {
    throw new Error("Embeddings must be non-empty and have matching dimensions.");
  }

  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] ** 2;
    rightMagnitude += right[index] ** 2;
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    throw new Error("Embeddings must have non-zero magnitude.");
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

export function rankMedia(
  queryEmbedding: number[],
  library: IndexedMedia[],
  limit: number,
): SearchResult[] {
  return library
    .map(({ embedding, ...item }) => ({
      ...item,
      score: cosineSimilarity(queryEmbedding, embedding),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}
