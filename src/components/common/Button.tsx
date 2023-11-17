import { ButtonHTMLAttributes, memo, ReactNode } from 'react'
import { FaSpinner } from 'react-icons/fa'
import classNames from 'classnames'

type Props = {
  children?: ReactNode
  className?: string
  isLoading?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>

const Button = (props: Props) => {
  const { children, className, isLoading, ...rest } = props
  return (
    <button
      className={classNames(
        'bg-gray-900 px-4 py-2 font-medium text-white ' +
          'hover:enabled:bg-black disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-500 dark:hover:enabled:bg-gray-600',
        { 'inline-flex items-center': isLoading },
        className
      )}
      type="submit"
      {...rest}
      disabled={isLoading === true}
    >
      {isLoading ? <FaSpinner className="mr-2 animate-spin" /> : null}
      {children}
    </button>
  )
}

export default memo(Button)
