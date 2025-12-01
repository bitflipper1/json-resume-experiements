import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const modelsToTest = [
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307',
  'claude-3-5-sonnet-20240620',
  'claude-3-5-sonnet-20241022'
];

console.log('Testing model availability on your API key...\n');

for (const model of modelsToTest) {
  try {
    const message = await client.messages.create({
      model: model,
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'Say test'
      }]
    });
    console.log(`✅ ${model} - AVAILABLE`);
  } catch (error) {
    if (error.status === 404) {
      console.log(`❌ ${model} - NOT AVAILABLE (404)`);
    } else if (error.status === 400) {
      console.log(`⚠️  ${model} - EXISTS but config error`);
    } else {
      console.log(`❌ ${model} - ERROR: ${error.status}`);
    }
  }
}

console.log('\n--- Token Estimate ---\n');
console.log('Sample resume: ~2000 characters = ~500 input tokens');
console.log('Full JSON output: ~3000-4000 output tokens needed');
console.log('Recommendation: Use max_tokens: 4096 minimum');
