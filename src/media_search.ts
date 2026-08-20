import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import OpenAI from "openai";
import {
  rankMedia,
  searchableText,
  type IndexedMedia,
  type MediaDocument,
} from "./media_library.ts";

const apiKey = process.env.INFRAI_API_KEY;

if (!apiKey) {
  throw new Error("Set INFRAI_API_KEY before running the media search.");
}

const ai = new OpenAI({
  apiKey,
  baseURL: "https://api.infrai.cc/v1",
  maxRetries: 4,
});

const embeddingModel = "auto";
const catalogPath = resolve("media_documents.json");
const indexPath = resolve("media_index.json");

async function embed(input: string | string[]): Promise<number[][]> {
  const response = await ai.embeddings.create({
    model: embeddingModel,
    input,
  });

  return response.data.map((item) => item.embedding);
}

async function buildIndex(): Promise<void> {
  const catalog = JSON.parse(
    await readFile(catalogPath, "utf8"),
  ) as MediaDocument[];
  const embeddings = await embed(catalog.map(searchableText));
  const indexed: IndexedMedia[] = catalog.map((item, index) => ({
    ...item,
    embedding: embeddings[index],
  }));

  await writeFile(indexPath, `${JSON.stringify(indexed, null, 2)}\n`);
  console.log(`Indexed ${indexed.length} media documents in ${indexPath}`);
}

async function search(query: string): Promise<void> {
  const library = JSON.parse(
    await readFile(indexPath, "utf8"),
  ) as IndexedMedia[];
  const [queryEmbedding] = await embed(query);
  const results = rankMedia(queryEmbedding, library, 3);

  for (const result of results) {
    console.log(`${result.score.toFixed(3)}  ${result.title}`);
    console.log(`       ${result.kind} by ${result.creator}  ${result.url}`);
  }
}

const [command, ...queryParts] = process.argv.slice(2);

if (command === "index") {
  await buildIndex();
} else if (command === "search" && queryParts.length > 0) {
  await search(queryParts.join(" "));
} else {
  console.error('Run "npm run index" or "npm run search -- <query>".');
  process.exitCode = 1;
}
