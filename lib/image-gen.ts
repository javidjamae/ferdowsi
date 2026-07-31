interface GenerateOptions {
  prompt: string;
  slug: string;
}

// Pluggable hero-image seam. OFF by default: with IMAGE_PROVIDER unset the
// pipeline publishes posts without a cover, which keeps the scaffold free to
// run end to end. The contract for any provider: take a prompt + slug,
// return a public image URL (or null for "no image").
//
// To wire a provider (Leonardo, Replicate, fal.ai, DALL-E, anything):
//   1. Set IMAGE_PROVIDER=custom and your provider's API key in .env
//   2. Implement the call below: create the generation, poll until ready,
//      return a URL your blog can hot-link or that you re-host.
export async function generateImage({ prompt, slug }: GenerateOptions): Promise<string | null> {
  const provider = process.env.IMAGE_PROVIDER || 'none';
  if (provider === 'none') return null;

  if (provider === 'custom') {
    // Implement your provider here. The shape, using Leonardo as the example:
    //   const gen = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {...})
    //   const url = await pollUntilReady(gen.id)
    //   return url
    void prompt;
    void slug;
    throw new Error('IMAGE_PROVIDER=custom: implement your provider call in lib/image-gen.ts.');
  }

  throw new Error(`Unknown IMAGE_PROVIDER "${provider}". Use "none" or "custom".`);
}
