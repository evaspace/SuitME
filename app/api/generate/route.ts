import { NextResponse } from 'next/server';

const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image';
const MAX_IMAGE_BASE64_LENGTH = 8 * 1024 * 1024;

const ENHANCE_STYLES: Record<string, string> = {
  editorial: 'high-fashion magazine editorial, soft directional studio light, seamless light grey backdrop',
  catalogue: 'clean e-commerce catalogue shot, even bright lighting, pure white background',
  streetwear: 'streetwear lookbook, natural daylight, blurred urban street background',
  luxury: 'luxury brand campaign, warm cinematic lighting, elegant minimal interior',
  natural: 'natural lifestyle photo, golden-hour daylight, softly blurred outdoor background',
};

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
    console.error('[SuitMe Gemini] API key is not configured', { requestId });
    return NextResponse.json({ error: 'Gemini is not configured on this server. Add GEMINI_API_KEY to .env.local and restart the app.' }, { status: 503 });
  }

  try {
    const body = await request.json() as {
      garment?: ImageInput;
      modelReference?: ImageInput;
      style?: unknown;
      mode?: unknown;
      enhanceStyle?: unknown;
    };
    const modelReference = parseImage({ dataUrl: body.modelReference?.dataUrl, label: 'Model reference' });
    const enhance = body.mode === 'enhance';
    const style = typeof body.style === 'string' ? body.style.slice(0, 40) : 'casual';
    let parts: Array<Record<string, unknown>>;
    if (enhance) {
      const look = ENHANCE_STYLES[String(body.enhanceStyle)] ?? ENHANCE_STYLES.editorial;
      parts = [
        { inlineData: modelReference },
        { text: `Retouch this photo into a professional fashion model shot: ${look}. It must stay the same person: keep the face, identity, body shape, skin tone, hair, exact pose, limb positions, camera angle and framing unchanged. Keep the clothing unchanged. You may improve lighting, background, skin retouch, grooming and overall photographic quality. Do not add text, logos, extra people or accessories. Return only the finished image.` },
      ];
    } else {
      const garment = parseImage({ dataUrl: body.garment?.dataUrl, label: 'Garment' });
      // Model photo first: Gemini treats the first image as the base to edit, which keeps the pose.
      parts = [
        { inlineData: modelReference },
        { inlineData: garment },
        { text: `Edit the first image (the model photo). Replace only the clothing the person wears with the garment shown in the second image. Everything else must stay pixel-identical to the first image: same person, face, body, exact pose, arm and leg positions, hands, head angle, camera angle, framing, crop, background and lighting. Do not re-pose, re-frame, zoom or regenerate the person. Preserve the garment's cut, color, fabric, pattern and visible details, and wear it in a ${style} way. Do not add text, labels, accessories or extra people. Return the edited image. Also return a short listing draft in a separate text part as exactly one JSON object with string fields listingTitle, listingDescription, and listingTags. Use only details clearly visible in the garment photo. Never invent a brand, material, size, or condition. Keep title concise, description brief, and tags comma-separated. Do not place listing text in the image.` },
      ];
    }

    console.info('[SuitMe Gemini] generation started', { requestId, model: MODEL, mode: enhance ? 'enhance' : 'tryon', style });
    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(120_000),
    });

    if (!upstream.ok) {
      const providerBody = await upstream.json().catch(() => null) as { error?: { message?: string; status?: string } } | null;
      const providerStatus = providerBody?.error?.status ?? 'UNKNOWN';
      console.error('[SuitMe Gemini] provider request failed', { requestId, httpStatus: upstream.status, providerStatus });
      const message = upstream.status === 401 || upstream.status === 403
        ? 'Gemini rejected the API key. Check that it is valid and has Gemini API access.'
        : upstream.status === 429
          ? 'Gemini quota exhausted for this image model (HTTP 429). The key is valid: the Google project has no quota left for it. Wait for the reset, enable billing on the Google project, or set GEMINI_IMAGE_MODEL to another image model.'
          : upstream.status >= 500
            ? 'Gemini is temporarily unavailable. Try again in a moment.'
            : 'Gemini could not generate this try-on. Check the selected photos and try again.';
      return NextResponse.json({ error: message, requestId }, { status: 502 });
    }

    const result = await upstream.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string; inlineData?: { mimeType?: string; data?: string } }> }; finishReason?: string }>;
      promptFeedback?: { blockReason?: string };
    };
    const outParts = result.candidates?.flatMap((candidate) => candidate.content?.parts ?? []) ?? [];
    const image = outParts.find((part) => part.inlineData?.data)?.inlineData;
    if (!image?.data || !image.mimeType?.startsWith('image/')) {
      console.error('[SuitMe Gemini] response contained no image', { requestId, finishReason: result.candidates?.[0]?.finishReason, blockReason: result.promptFeedback?.blockReason });
      return NextResponse.json({ error: 'Gemini did not return an image for this request. Try different photos or adjust the model reference.' , requestId }, { status: 502 });
    }

    console.info('[SuitMe Gemini] generation completed', { requestId, mimeType: image.mimeType, outputLength: image.data.length });
    return NextResponse.json({
      imageDataUrl: `data:${image.mimeType};base64,${image.data}`,
      listing: parseListingDraft(outParts.map((part) => part.text ?? '').filter(Boolean)),
      requestId,
    });
  } catch (cause) {
    if (cause instanceof SyntaxError) return NextResponse.json({ error: 'The generation request was invalid.' }, { status: 400 });
    const message = cause instanceof Error ? cause.message : 'Unknown server error';
    const timedOut = cause instanceof Error && cause.name === 'TimeoutError';
    console.error('[SuitMe Gemini] request crashed', { requestId, error: message });
    return NextResponse.json({ error: timedOut ? 'Image generation took too long. Try again.' : message, requestId }, { status: timedOut ? 504 : 400 });
  }
}
