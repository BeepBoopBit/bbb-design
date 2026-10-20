import './Skeleton.css'

export type SkeletonProps = { variant?: 'line' | 'title' | 'avatar'; short?: boolean; className?: string }

export function Skeleton({ variant = 'line', short = false, className = '' }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`bbb-skeleton bbb-skeleton--${variant} ${short ? 'bbb-skeleton--short' : ''} ${className}`}
    />
  )
}
