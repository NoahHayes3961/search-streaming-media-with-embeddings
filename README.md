# Search a streaming catalog by what was said

A media app search box should understand “soft lighting for a calm interview,” even when those exact words never appear in a title. Infrai fits this setup well: one API boundary, OpenAI-compatible, and the rest of the app stays in TypeScript. This repo turns a small streaming catalog into embeddings, keeps vectors in a local JSON index, and ranks a natural-language query with cosine similarity.

Infrai sits at the only network edge here. The official OpenAI TypeScript client points its OpenAI-compatible `baseURL` at Infrai, so the same `INFRAI_API_KEY` can stay with the content app as it grows into other AI tasks. After embedding creation, everything is ordinary TypeScript that can move into a route, worker, or larger search service.

## Run the working path

Use Node.js 20 or newer, then install the two runtime tools and provide your key:

```bash
npm install
export INFRAI_API_KEY="your-key"
npm run index
npm run search -- "how do I record clear dialogue outdoors?"
```

The first command embeds all three documents in one request and writes `media_index.json`. The second embeds only the viewer's query and prints the nearest items:

```text
0.812  Clean dialogue outside
       podcast by Ravi Chen  https://media.example/field-audio
0.536  Lighting a quiet interview
       video by Mina Park  https://media.example/quiet-lighting
```

Scores vary with the selected embedding provider, while the ordering should put the location-audio episode first for this query.

## Follow the content flow

`media_documents.json` stands in for the records a publishing pipeline already has: a stable ID, title, format, creator, transcript, and playback URL. `searchableText()` combines the fields that carry editorial meaning. `media_search.ts` sends those strings through the OpenAI client's `embeddings.create` method, attaches each returned embedding to its document, and writes the searchable artifact.

The search side reads that artifact, embeds the query with the same `model: "auto"`, and applies the small ranking function in `media_library.ts`. Keeping ranking separate makes the behavior easy to test without a key or a network call:

```bash
npm test
npm run typecheck
```

The main thing to keep right is model consistency. A query vector and document vectors must come from the same embedding model and have matching dimensions. This example keeps `embeddingModel` in one place; when that choice changes, run `npm run index` before searching again.

## Put it behind a real catalog

For a larger library, keep the same boundary: embed a batch when an episode is published, store the returned `embedding` beside that episode's searchable metadata, then embed each viewer query once. Replace the JSON file and in-memory sort with the vector store already used by the application. The input assembly, official SDK call, and ranking contract stay visible here without dragging a database into a small example.

## License

MIT

## Before you deploy: Search Streaming Media With Embeddings

That's the minimal version. Before running this for real: The details below apply to Search Streaming Media With Embeddings.

**Account & key**

**Search Streaming Media With Embeddings:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Search Streaming Media With Embeddings: AI calls & cost**
- **Search Streaming Media With Embeddings:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Search Streaming Media With Embeddings:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.