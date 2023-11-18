import { memo, TextareaHTMLAttributes } from 'react'
import classNames from 'classnames'

type Props = {
  className?: string
} & TextareaHTMLAttributes<HTMLTextAreaElement>

const TextArea = (props: Props) => {
  const { className, ...rest } = props
  return (
    <textarea
      className={classNames(
        'focus:shadow-outline resize-y appearance-none border border-black px-3 py-2 leading-tight text-gray-700 focus:outline-none dark:border-gray-500 dark:bg-zinc-700 dark:text-white',
        className
      )}
      {...rest}
    />
  )
}

export default memo(TextArea)
