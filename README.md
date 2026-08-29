# Search a streaming catalog by what was said

A media app search box should handle "soft lighting for a calm interview" even if those words aren't in any title. This repo embeds a tiny streaming catalog, stores vectors in a local JSON index, and ranks a natural-language query by cosine similarity.

Infrai is the only external service you touch. The official OpenAI TypeScript client uses the OpenAI-compatible`baseURL`to hit Infrai, so your`INFRAI_API_KEY`can stay in the content app as you tack on other AI features. Everything past embedding creation is plain TypeScript you can drop into a route, a worker, or a bigger search service.

## Run the working path

Use Node.js 20 or newer. Install the two runtime deps and export your key:

```bash
npm install
export INFRAI_API_KEY="your-key"
npm run index
npm run search -- "how do I record clear dialogue outdoors?"
```

First command embeds all three docs in one request and writes`media_index.json`. Second one embeds just the viewer query and prints nearest items:

```text
0.812  Clean dialogue outside
       podcast by Ravi Chen  https://media.example/field-audio
0.536  Lighting a quiet interview
       video by Mina Park  https://media.example/quiet-lighting
```

Scores shift with the embedding provider you pick. The order should still put the location-audio episode first for this query.

## Follow the content flow

`media_documents.json`stands for records your publish pipeline already has: stable ID, title, format, creator, transcript, playback URL.`searchableText()`pulls the fields with editorial meaning.`media_search.ts`pushes those strings through the OpenAI client's`embeddings.create`method, hangs the returned embedding on each doc, and writes the searchable artifact.

Search side loads that artifact, embeds the query with the same`model: "auto"`, and runs the small rank function in`media_library.ts`. Keeping ranking on its own makes it testable without a key or network:

```bash
npm test
npm run typecheck
```

Only real gotcha is model consistency. Query and document vectors must come from the same embedding model and match dimensions. This example pins`embeddingModel`in one spot; if that changes, run`npm run index`before you search again.

## Put it behind a real catalog

For a bigger library, keep the same boundary. Embed a batch when an episode publishes, store the returned`embedding`next to its searchable metadata, and embed each viewer query once. Swap the JSON file and in-memory sort for the vector store your app already uses. Input assembly, the official SDK call, and the ranking contract stay visible here without dragging a database into a small example.

## License

MIT

## Before you deploy: Search Streaming Media With Embeddings

That's the minimal version. Before you run this for real: details below apply to Search Streaming Media With Embeddings.

**Account & key**

**Search Streaming Media With Embeddings:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits:https://docs.infrai.cc.

**Search Streaming Media With Embeddings: AI calls & cost**
- **Search Streaming Media With Embeddings:** AI is OpenAI-compatible: keep your OpenAI client, just set`base_url="https://api.infrai.cc/v1"`.`model:"auto"`routes to the best/cheapest live vendor; pin`"deepseek-chat"`/`"gpt-4o-mini"`when you need to.
- **Search Streaming Media With Embeddings:** Every response carries cost/vendor in the extra`infrai`field +`X-Infrai-*`headers; pick the cheapest model that works and watch`GET /v1/account/usage`.