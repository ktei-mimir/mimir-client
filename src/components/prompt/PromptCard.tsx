import { memo, useCallback } from 'react'
import classNames from 'classnames'
import { Prompt } from '@/api/promptApi'
import { Link, useNavigate } from 'react-router-dom'
import { FaArrowRight, FaEdit } from 'react-icons/fa'

type Props = {
  className?: string
  prompt: Prompt
}

const PromptCard = (props: Props) => {
  const { prompt, className } = props
  const MAX_TITLE_DISPLAY_LENGTH = 65
  const navigate = useNavigate()
  const handleClick = useCallback(() => {
    navigate(`/prompt/${prompt.id}`)
  }, [navigate, prompt.id])
  return (
    <div
      className={classNames(
        'group max-w-sm border border-gray-200 bg-white p-6 shadow hover:cursor-pointer dark:border-gray-700 dark:bg-slate-700',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex flex-row">
        <h5 className="mb-2 h-24 w-full overflow-auto text-lg font-medium tracking-tight text-gray-900 dark:text-white">
          {prompt.title.slice(0, MAX_TITLE_DISPLAY_LENGTH) +
            (prompt.title.length > MAX_TITLE_DISPLAY_LENGTH ? '...' : '')}
        </h5>
        <Link to={`/prompt/${prompt.id}`}>
          <FaEdit className="cursor-pointer text-xl group-hover:inline dark:text-gray-500 md:hidden" />
        </Link>
      </div>
      <Link
        to={`/prompt/${prompt.id}`}
        className="inline-flex items-center bg-gray-900 px-3 py-2 text-center
        text-sm text-white hover:bg-black focus:outline-none
        dark:bg-gray-500 dark:hover:bg-gray-600"
      >
        Use template
        <FaArrowRight className="ml-2" />
      </Link>
    </div>
  )
}

export default memo(PromptCard)
