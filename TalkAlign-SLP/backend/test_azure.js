const { AzureOpenAI } = require('openai');
require('dotenv').config();

async function testAzure() {
  const client = new AzureOpenAI({
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiKey: process.env.AZURE_OPENAI_KEY,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION.replace(/"/g, ''),
  });

  try {
    const completion = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT.replace(/"/g, ''),
      messages: [{ role: 'user', content: 'Say Hello in one word' }],
      max_tokens: 5
    });
    console.log('Azure Response:', completion.choices[0].message.content);
  } catch (error) {
    console.error('Azure Error:', error.message);
  }
}
testAzure();
