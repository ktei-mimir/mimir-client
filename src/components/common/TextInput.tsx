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
        'focus:shadow-outline appearance-none px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none dark:bg-zinc-700 dark:text-white',
        className
      )}
      {...rest}
    />
  )
}

export default memo(TextInput)
