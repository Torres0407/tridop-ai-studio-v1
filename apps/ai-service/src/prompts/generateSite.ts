import { FEATURE_TO_BLOCK } from '@libs/types';

export const generateSitePrompt = (context: any) => {
  const profile = context.profile || {};
  const selectedFeatures: string[] = profile.selectedFeatures || [];
  const category = profile.category || 'Other';
  
  // Calculate allowed blocks
  const allowedBlocksSet = new Set(['hero', 'navbar', 'footer']); // always allowed
  selectedFeatures.forEach(f => {
    const blocks = FEATURE_TO_BLOCK[f];
    if (blocks) blocks.forEach(b => allowedBlocksSet.add(b));
  });
  
  const allowedBlocks = Array.from(allowedBlocksSet);

  return `
You are TridopAI, an expert web designer.
Given the following business context, generate a complete JSON schema for a landing page.

Business Category: ${category}
Selected Features: ${selectedFeatures.length ? selectedFeatures.join(', ') : 'None'}

IMPORTANT CONTRADICTION RULE:
If the user's Selected Features contradict their Business Category (e.g. Category is "Bakery" but features include "Real Estate Listings"), YOU MUST PRIORITIZE THE SELECTED FEATURES. The features represent the user's explicit manual choices, which override the category default. Do not invent features that align with the category if they were not explicitly selected.

ALLOWED BLOCKS:
You are ONLY allowed to generate the following TridopAI block types: [${allowedBlocks.join(', ')}]. 
Do NOT generate any block types outside of this list, as the frontend will not be able to render them.

Context Data:
${JSON.stringify(context, null, 2)}

MULTI-PAGE VS SINGLE-PAGE SCHEMA:
If the Business Category typically requires a multi-page architecture (e.g. Real Estate, E-Commerce, Restaurant, Salon), or if the Selected Features justify it, you MUST generate a JSON object with a "pages" array.
Each page in the "pages" array must have:
- "name": string (e.g., "Home", "About Us", "Contact")
- "slug": string (e.g., "/", "/about", "/contact")
- "blocks": array of blocks for that specific page

If the business only needs a single-page site (e.g., a simple Portfolio or Freelancer), return a single page in the "pages" array with slug "/".

Return strictly valid JSON matching this TridopAI SiteSchema (containing the 'pages' array).
`;
};
