import type { ReactNode } from 'react';

const STICKERS = {
  snap: 'snap-it', ready: 'ready-to-post', tag: 'price-tag', hanger: 'hanger-sweater', bolt: 'lightning',
  thrift: 'thrift-find', phone: 'phone-flash', worn: 'worn-in-10-sec', sweater: 'yellow-sweater',
} as const;

export type StickerName = keyof typeof STICKERS;

/** A decorative sticker (public/stickers/, drawn by tools/gen_backdrop.py); position and animation in globals.css `.stk-<name>`. */
export function Sticker({ name }: { name: StickerName }) {
  // eslint-disable-next-line @next/next/no-img-element -- tiny static SVG, no optimisation needed
  return <span className={`stk stk-${name}`} aria-hidden="true"><img src={`/stickers/${STICKERS[name]}.svg`} alt="" /></span>;
}

/** Wraps a button or heading so a sticker can hang on its corner and react to its hover/focus. */
export function WithSticker({ name, children, className = '' }: { name: StickerName; children: ReactNode; className?: string }) {
  return <span className={`stk-host ${className}`}>{children}<Sticker name={name} /></span>;
}
