import test from 'node:test';
import assert from 'node:assert';
import { classifyCategory, preFilterArticles, deduplicateArticles } from '../aggregator.js';

test('classifyCategory heuristics', () => {
  // hardware-gpus
  assert.strictEqual(classifyCategory('NVIDIA announces Blackwell B200 GPU', ''), 'hardware-gpus');
  assert.strictEqual(classifyCategory('TPU v5p hardware updates', ''), 'hardware-gpus');

  // mlops-devops
  assert.strictEqual(classifyCategory('Configuring Kubernetes for MLOps', ''), 'mlops-devops');
  assert.strictEqual(classifyCategory('Docker container orchestration', ''), 'mlops-devops');

  // dev-tools
  assert.strictEqual(classifyCategory('Vite 5 release notes', ''), 'dev-tools');
  assert.strictEqual(classifyCategory('Using Rust for compiler design', ''), 'dev-tools');

  // ai-models & big-tech
  assert.strictEqual(classifyCategory('Google releases Gemini 2.5 Flash', ''), 'ai-models');
  assert.strictEqual(classifyCategory('OpenAI releases new GPT-5 model', ''), 'ai-models');
  assert.strictEqual(classifyCategory('Google Search engine updates', ''), 'big-tech');
});

test('preFilterArticles filters out memes and fluff', () => {
  const input = [
    { title: 'Serious OpenAI update', url: 'https://foo.com', contentSnippet: 'OpenAI updates API' },
    { title: 'Check out this funny cat video', url: 'https://cat.com', contentSnippet: 'cat joke video' },
    { title: 'Show HN: check out my gaming channel', url: 'https://game.com', contentSnippet: 'Check it out' },
    { title: 'Show HN: Open Source Rust compiler', url: 'https://rust.com', contentSnippet: 'Cool compiler' }
  ];

  const filtered = preFilterArticles(input);
  assert.strictEqual(filtered.length, 2);
  assert.strictEqual(filtered[0].title, 'Serious OpenAI update');
  assert.strictEqual(filtered[1].title, 'Show HN: Open Source Rust compiler');
});

test('deduplicateArticles deduplicates by URL and normalized title', () => {
  const input = [
    { title: 'Google Gemini 2.5', url: 'https://gemini.com' },
    { title: 'Google Gemini 2.5!!!', url: 'https://gemini-alt.com' }, // normalized title is same
    { title: 'Other title', url: 'https://gemini.com' }, // url is same
    { title: 'Unique Title', url: 'https://unique.com' }
  ];

  const deduped = deduplicateArticles(input);
  assert.strictEqual(deduped.length, 2);
  assert.strictEqual(deduped[0].title, 'Google Gemini 2.5');
  assert.strictEqual(deduped[1].title, 'Unique Title');
});
