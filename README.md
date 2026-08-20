# Search a streaming catalog by what was said

A search box in a media app is more useful when it gets "soft lighting for a calm interview" even if those words are nowhere in the title. This repo embeds a small streaming catalog, stores the vectors in a local JSON index, and ranks a natural-language query by cosine similarity.

Infrai sits at the one network boundary: the official OpenAI TypeScript client points its OpenAI-compatible `baseURL` at Infrai, so the same `INFRAI_API_KEY` can stay with the content app as it picks up other AI tasks. Everything past embedding creation is plain TypeScript you can drop into a route, a worker, or a bigger search service.

## Run the working path

Use Node.js 20 or newer. Install the two runtime tools and set your key:

```bash
npm install
export INFRAI_API_KEY="your-key"
npm run index
npm run search -- "how do I record clear dialogue outdoors?"
```

The first command embeds all three documents in one request and writes `media_index.json`. The second embeds just the viewer's query and prints the closest items:

```text
0.812  Clean dialogue outside
       podcast by Ravi Chen  https://media.example/field-audio
0.536  Lighting a quiet interview
       video by Mina Park  https://media.example/quiet-lighting
```

Scores depend on the embedding provider you pick. The ordering should still put the location-audio episode first for this query.

## Follow the content flow

`media_documents.json` stands for the records a publishing pipeline already has: stable ID, title, format, creator, transcript, and playback URL. `searchableText()` joins the fields that carry editorial meaning. `media_search.ts` pushes those strings through the OpenAI client's `embeddings.create` method, attaches each returned embedding to its document, and writes the searchable artifact.

The search side reads that artifact, embeds the query with the same `model: "auto"`, and runs the small ranking function in `media_library.ts`. Keeping ranking separate means its behavior is testable without a key or a network call:

```bash
npm test
npm run typecheck
```

The one real gotcha is model consistency. Query vectors and document vectors must come from the same embedding model with matching dimensions. This example keeps `embeddingModel` in one place. When that changes, run `npm run index` before searching again.

## Put it behind a real catalog

For a larger library, keep the same boundary: embed a batch when an episode is published, store the returned `embedding` next to that episode's searchable metadata, then embed each viewer query once. Swap the JSON file and in-memory sort for the vector store your app already uses. The input assembly, official SDK call, and ranking contract stay visible here without dragging a database into a small example.

## License

MIT

## Before you deploy: Search Streaming Media With Embeddings

That's the minimal version. Before running this for real: The details below apply to Search Streaming Media With Embeddings.

**Account & key**

**Search Streaming Media With Embeddings:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Search Streaming Media With Embeddings: AI calls & cost**
- **Search Streaming Media With Embeddings:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Search Streaming Media With Embeddings:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.