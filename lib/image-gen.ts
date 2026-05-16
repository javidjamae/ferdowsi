import { supabaseAdmin } from './supabase';

interface GenerateOptions {
  prompt: string;
  slug: string;
}

// Pluggable image generator. The scaffold ships with Leonardo.
// Swap the implementation to use Replicate, fal.ai, OpenAI, etc.
// The contract: take a prompt + slug, return a public URL.
export async function generateImage({
  prompt,
  slug,
}: GenerateOptions): Promise<string> {
  if (!process.env.LEONARDO_API_KEY) {
    throw new Error('LEONARDO_API_KEY not set. See .env.example.');
  }

  // STUB: Replace with the actual Leonardo API call. The scaffold leaves
  // this as a stub so you can pick your image provider. The shape is:
  //
  //   1. POST to Leonardo /generations with the prompt
  //   2. Poll the generation status until ready
  //   3. Download the resulting image bytes
  //   4. Upload to Supabase Storage under /blog/<slug>.jpg
  //   5. Return the public URL
  //
  // Pseudocode:
  //   const gen = await leonardo.create({ prompt, ... });
  //   const url = await leonardo.poll(gen.id);
  //   const bytes = await fetch(url).then((r) => r.arrayBuffer());
  //   await supabaseAdmin.storage.from('blog').upload(`${slug}.jpg`, bytes);
  //   return supabaseAdmin.storage.from('blog').getPublicUrl(`${slug}.jpg`).data.publicUrl;

  void prompt;
  void slug;
  void supabaseAdmin;
  throw new Error('image-gen stub — implement the provider call. See lib/image-gen.ts.');
}
