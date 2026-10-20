import { readFileSync } from 'node:fs'

// Catalog size is data, not a behavior contract. Keep interaction checks independent
// of additions while still verifying filtering and category counts against the catalog.
const catalog = readFileSync(new URL('../src/pages/Gallery/galleryItems.ts', import.meta.url), 'utf8')
const categories = [...catalog.matchAll(/category:\s*['"](foundations|components|patterns)['"]/g)].map(match => match[1])
export const galleryCounts = {
  all: categories.length,
  foundations: categories.filter(category => category === 'foundations').length,
  components: categories.filter(category => category === 'components').length,
  patterns: categories.filter(category => category === 'patterns').length,
}
