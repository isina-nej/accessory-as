// ponytail: until product_images is populated, map the existing seeded product slugs to their bundled Figma assets.
const images: Record<string, string> = {
  "full-nagin-ring": "figma-new/prod-card.webp",
  "minimal-steel-ring": "product-02.webp",
  "gold-plated-ring": "product-03.webp",
  "full-nagin-necklace": "figma-landing/offers-anklet.webp",
  "minimal-chain-necklace": "figma-landing/offers-anklet.webp",
  "pearl-necklace": "product-06.webp",
  "full-nagin-bracelet": "product-07.webp",
  "cartier-bracelet": "product-08.webp",
  "bangle-bracelet": "product-09.webp",
  "double-nagin-earring": "figma-new/prod-card.webp",
  "hoop-earring": "figma-new/prod-card.webp",
  "pearl-drop-earring": "product-12.webp",
  "women-anklet": "figma-landing/offers-anklet.webp",
  "chain-anklet": "figma-landing/offers-anklet.webp",
  "minimal-anklet": "figma-landing/offers-anklet.webp",
  "half-set-nagin": "cat-half-set.webp",
  "half-set-pearl": "cat-half-set.webp",
  "full-set-nagin": "cat-full-set.webp",
  "full-set-gold": "cat-full-set.webp",
  "full-set-minimal": "cat-full-set.webp",
};

export function shopImage(slug: string): string | null {
  return images[slug] ? `/images/${images[slug]}` : null;
}
