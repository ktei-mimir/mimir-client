import { InputHTMLAttributes, memo } from 'react'
import classNames from 'classnames'

type Props = {
  className?: string
} & InputHTMLAttributes<HTMLInputElement>

const TextInput = (props: Props) => {
  const { className, ...rest } = props
  return (
    <input
      className={classNames(
        'appearance-none border border-black px-3 py-2 leading-tight text-gray-700 focus:outline-none dark:border-gray-500 dark:bg-zinc-700 dark:text-white',
        className
      )}
      {...rest}
    />
  )
}

export default memo(TextInput)
