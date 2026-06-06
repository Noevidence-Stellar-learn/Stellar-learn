import { forwardRef } from 'react'

type Variant = 'purple' | 'gold' | 'ghost'

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  /** small size */
  sm?: boolean
  /** full width */
  block?: boolean
}

const VARIANT_CLASS: Record<Variant, string> = {
  purple: '',
  gold: 'pixel-btn--gold',
  ghost: 'pixel-btn--ghost',
}

/**
 * PixelButton — the chunky 3D pixel button system from the design.
 * Purple (primary), gold (CTA), and ghost (secondary) variants.
 */
export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(function PixelButton(
  { variant = 'purple', sm, block, className = '', children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={[
        'pixel-btn',
        VARIANT_CLASS[variant],
        sm ? 'pixel-btn--sm' : '',
        block ? 'pixel-btn--block' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
})
