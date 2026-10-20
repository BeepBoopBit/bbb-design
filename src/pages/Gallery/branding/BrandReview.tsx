import { useEffect, useState } from 'react'
import { validateBrand } from '../../../foundations/brandValidation'
import { checkBrandContrast } from '../../../foundations/brandContrast'
import type { BrandContrastCheck } from '../../../foundations/brandContrast'
import type { BrandPreset } from '../../../foundations/brands'
import { Accordion } from '../../../components/Accordion/Accordion'

export type BrandReviewResult = { brand: BrandPreset; checks: BrandContrastCheck[]; ready: boolean }
export function BrandReview({ brand, onReview }: { brand: BrandPreset; onReview: (result: BrandReviewResult) => void }) {
  const [result, setResult] = useState<BrandReviewResult>()
  const checks = result?.brand === brand ? result.checks : []
  const issues = validateBrand(brand)
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const checks = checkBrandContrast(brand)
      const next = { brand, checks, ready: checks.length > 0 && checks.every(check => check.pass) }
      setResult(next)
      onReview(next)
    })
    return () => cancelAnimationFrame(frame)
  }, [brand, onReview])
  const failed = checks.filter(check => !check.pass)
  return <div className="brand-review">
    <p role="status">{issues.length ? `${issues.length} configuration issue${issues.length === 1 ? '' : 's'} to resolve.` :
      !checks.length ? 'Checking both color modes…' : failed.length ? `${failed.length} contrast pairing${failed.length === 1 ? '' : 's'} need attention.` : `${checks.length} contrast checks pass across light and dark.`}</p>
    {issues.length > 0 && <ul>{issues.map(issue => <li key={`${issue.path}-${issue.message}`}><code>{issue.path}</code>: {issue.message}</li>)}</ul>}
    {failed.length > 0 && <ul>{failed.map(check => <li key={`${check.mode}-${check.label}`}>{check.mode} · {check.label}: {check.ratio === null ? 'An opaque canvas is needed.' : `${check.ratio.toFixed(2)}:1; needs ${check.minimum}:1.`}</li>)}</ul>}
    <Accordion items={[{ id: 'checks', title: 'Review all contrast checks', content: <div className="brand-review__checks">
      {checks.map(check => <div key={`${check.mode}-${check.label}`}><span>{check.mode} · {check.label}</span><span>{check.ratio?.toFixed(2) ?? 'Unknown'}:1 · {check.pass ? 'Pass' : 'Review'}</span></div>)}
      <p>These checks cover text, action states, selection, feedback, and focus. Also review actual screens, keyboard focus, text zoom, and assistive technology.</p>
    </div> }]} />
  </div>
}
