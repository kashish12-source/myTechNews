import { aggregateNews } from '../server/aggregator.js';

console.log('--- CLI News Aggregation Triggered ---');
console.log('Timestamp:', new Date().toLocaleString());

try {
  const data = await aggregateNews();
  console.log('Success! Aggregated', data.articles.length, 'articles.');
  process.exit(0);
} catch (err) {
  console.error('CLI aggregation failed:', err.message);
  process.exit(1);
}
