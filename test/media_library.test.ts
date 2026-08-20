import assert from "node:assert/strict";
import test from "node:test";
import { rankMedia, type IndexedMedia } from "../src/media_library.ts";

const library: IndexedMedia[] = [
  {
    id: "lighting",
    title: "Interview lighting",
    kind: "video",
    creator: "Mina",
    transcript: "Soft light for a studio conversation.",
    url: "https://media.example/lighting",
    embedding: [1, 0],
  },
  {
    id: "audio",
    title: "Outdoor dialogue",
    kind: "podcast",
    creator: "Ravi",
    transcript: "Recording speech in the wind.",
    url: "https://media.example/audio",
    embedding: [0, 1],
  },
];

test("ranks the closest media document first", () => {
  const [first] = rankMedia([0.9, 0.1], library, 1);

  assert.equal(first.id, "lighting");
  assert.ok(first.score > 0.9);
});
