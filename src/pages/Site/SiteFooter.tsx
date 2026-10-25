import { BrandLogo } from '../../components/BrandLogo/BrandLogo'
import { bbbBrand } from '../../foundations/brands'
import { sitePath } from '../Gallery/useGalleryLocation'

export const repositoryUrl = 'https://github.com/BeepBoopBit/bbb-design'

export function SiteFooter() {
  return <footer className="site-footer">
    <div><a href={sitePath('home')} aria-label="BBB home"><BrandLogo brand={bbbBrand} decorative /></a>
      <span>Care in every detail.</span></div>
    <nav aria-label="Footer navigation">
      <a href={sitePath('getting-started')}>Get started</a>
      <a href={repositoryUrl}>GitHub</a>
      <a href={`${repositoryUrl}/blob/main/LICENSE`}>MIT license</a>
    </nav>
  </footer>
}
