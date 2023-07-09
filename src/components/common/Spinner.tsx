import classnames from 'classnames'
import { DetailedHTMLProps, HTMLAttributes } from 'react'

const Spinner = (
  props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
) => {
  const { className, ...rest } = props
  return (
    <div
      className={classnames(
        'inline-block h-6 w-6 animate-spin rounded-full border-[3px] border-current border-t-transparent text-slate-500',
        className
      )}
      role="status"
      aria-label="loading"
      {...rest}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default Spinner
