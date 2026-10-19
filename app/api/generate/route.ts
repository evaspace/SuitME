import { NextResponse } from 'next/server';

const MODEL = 'gemini-3.1-flash-image';
const MAX_IMAGE_BASE64_LENGTH = 8 * 1024 * 1024;

interface ImageInput {
  dataUrl?: unknown;
  label: string;
}

function parseListingDraft(textParts: string[]) {
  for (const text of textParts) {
    const json = text.match(/\{[\s\S]*\}/)?.[0];
    if (!json) continue;
    try {
      const value = JSON.parse(json) as Record<string, unknown>;
      return {
        listingTitle: typeof value.listingTitle === 'string' ? value.listingTitle.slice(0, 120) : '',
        listingDescription: typeof value.listingDescription === 'string' ? value.listingDescription.slice(0, 2000) : '',
        listingTags: typeof value.listingTags === 'string' ? value.listingTags.slice(0, 300) : '',
      };
    } catch {
      continue;
    }
  }
  return { listingTitle: '', listingDescription: '', listingTags: '' };
}

function parseImage(input: ImageInput) {
  if (typeof input.dataUrl !== 'string') throw new Error(`${input.label} photo is missing.`);
  if (input.dataUrl.length > MAX_IMAGE_BASE64_LENGTH) throw new Error(`${input.label} photo is too large after processing. Choose a smaller image.`);
  const match = input.dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([\s\S]+)$/);
  if (!match) throw new Error(`${input.label} photo must be a JPG, PNG, or WEBP image.`);
  return { mimeType: match[1], data: match[2] };
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[DressMe Gemini] API key is not configured', { requestId });
    return NextResponse.json({ error: 'Gemini is not configured on this server. Add GEMINI_API_KEY to .env.local and restart the app.' }, { status: 503 });
  }

  try {
    const body = await request.json() as {
      garment?: ImageInput;
      modelReference?: ImageInput;
      poseLabel?: unknown;
      style?: unknown;
    };
    const garment = parseImage({ dataUrl: body.garment?.dataUrl, label: 'Garment' });
    const modelReference = parseImage({ dataUrl: body.modelReference?.dataUrl, label: 'Model reference' });
    const poseLabel = typeof body.poseLabel === 'string' ? body.poseLabel.slice(0, 80) : 'the reference pose';
    const style = typeof body.style === 'string' ? body.style.slice(0, 40) : 'casual';

    console.info('[DressMe Gemini] generation started', { requestId, model: MODEL, style });
    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            { text: `Create one photorealistic virtual try-on image. Use the garment photo as the exact clothing item to put on the person in the model reference photo. Preserve the garment's cut, color, fabric, pattern, and visible details. Preserve the person's identity, body proportions, skin tone, and ${poseLabel} pose. Style the scene as ${style}. Show a clean full-body fashion listing photo with a simple neutral background. Do not add text, labels, accessories, extra people, or change the clothing item. Return the finished image. Also return a short listing draft in a separate text part as exactly one JSON object with string fields listingTitle, listingDescription, and listingTags. Use only details clearly visible in the garment photo. Never invent a brand, material, size, or condition. Keep title concise, description brief, and tags comma-separated. Do not place listing text in the image.` },
            { inlineData: garment },
            { inlineData: modelReference },
          ],
        }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(120_000),
    });

    if (!upstream.ok) {
      const providerBody = await upstream.json().catch(() => null) as { error?: { message?: string; status?: string } } | null;
      const providerStatus = providerBody?.error?.status ?? 'UNKNOWN';
      console.error('[DressMe Gemini] provider request failed', { requestId, httpStatus: upstream.status, providerStatus });
      const message = upstream.status === 401 || upstream.status === 403
        ? 'Gemini rejected the API key. Check that it is valid and has Gemini API access.'
        : upstream.status === 429
          ? 'Gemini is temporarily rate-limited or the account quota is exhausted. Try again later.'
          : upstream.status >= 500
            ? 'Gemini is temporarily unavailable. Try again in a moment.'
            : 'Gemini could not generate this try-on. Check the selected photos and try again.';
      return NextResponse.json({ error: message, requestId }, { status: 502 });
    }

    const result = await upstream.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string; inlineData?: { mimeType?: string; data?: string } }> }; finishReason?: string }>;
      promptFeedback?: { blockReason?: string };
    };
    const parts = result.candidates?.flatMap((candidate) => candidate.content?.parts ?? []) ?? [];
    const image = parts.find((part) => part.inlineData?.data)?.inlineData;
    if (!image?.data || !image.mimeType?.startsWith('image/')) {
      console.error('[DressMe Gemini] response contained no image', { requestId, finishReason: result.candidates?.[0]?.finishReason, blockReason: result.promptFeedback?.blockReason });
      return NextResponse.json({ error: 'Gemini did not return an image for this request. Try different photos or adjust the model reference.' , requestId }, { status: 502 });
    }

    console.info('[DressMe Gemini] generation completed', { requestId, mimeType: image.mimeType, outputLength: image.data.length });
    return NextResponse.json({
      imageDataUrl: `data:${image.mimeType};base64,${image.data}`,
      listing: parseListingDraft(parts.map((part) => part.text ?? '').filter(Boolean)),
      requestId,
    });
  } catch (cause) {
    if (cause instanceof SyntaxError) return NextResponse.json({ error: 'The generation request was invalid.' }, { status: 400 });
    const message = cause instanceof Error ? cause.message : 'Unknown server error';
    const timedOut = cause instanceof Error && cause.name === 'TimeoutError';
    console.error('[DressMe Gemini] request crashed', { requestId, error: message });
    return NextResponse.json({ error: timedOut ? 'Image generation took too long. Try again.' : message, requestId }, { status: timedOut ? 504 : 400 });
  }
}
