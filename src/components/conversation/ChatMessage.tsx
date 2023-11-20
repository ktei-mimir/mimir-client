import { Role } from '@/api/messageApi'
import Spinner from '@/components/common/Spinner'
import classnames from 'classnames'
import hljs from 'highlight.js'
import DOMPurify from 'isomorphic-dompurify'
import { FaRegCircleUser } from 'react-icons/fa6'
import { FaTerminal } from 'react-icons/fa'
import { marked } from 'marked'
import { memo, useCallback, useEffect } from 'react'

type MessageProps = {
  text?: string
  role: Role
  streamId?: string
  isStreaming: boolean
  onPause?: (streamId: string) => void
}

function renderText(text: string, role: Role) {
  if (role === 'user') return text
  if (text.includes('```')) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(text)) }}
      ></div>
    )
  }
  return text
}

const ChatMessage = (props: MessageProps) => {
  const isUser = props.role === 'user'

  useEffect(() => {
    hljs.configure({
      ignoreUnescapedHTML: true
    })
  }, [])

  useEffect(() => {
    document.querySelectorAll('pre code').forEach(el => {
      if ((el as HTMLElement).dataset.highlighted) return
      hljs.highlightElement(el as HTMLElement)
    })
  }, [props.text])

  const { streamId, onPause } = props

  const handlePauseClick = useCallback(() => {
    if (streamId) {
      onPause?.(streamId)
    }
  }, [onPause, streamId])

  return (
    <div className="sm:w-3xl mx-auto flex-1 pt-4 font-extralight sm:max-w-3xl">
      <div className="flex flex-row">
        <div className="collapse max-w-0 text-gray-900 dark:text-gray-200 sm:visible sm:max-w-lg">
          {isUser ? (
            <FaRegCircleUser className="h-6 w-6 text-gray-400 dark:text-zinc-200" />
          ) : (
            <FaTerminal className="h-6 w-6 text-gray-400 dark:text-zinc-200" />
          )}
        </div>
        <div
          className={classnames(
            'flex-1 overflow-x-auto whitespace-pre-wrap p-3 text-base text-gray-700 shadow-sm dark:text-gray-200 sm:ml-2',
            {
              'shadow-sm dark:bg-zinc-700': isUser,
              'bg-gray-100 shadow-sm dark:bg-slate-700': !isUser
            }
          )}
        >
          <div className="flex-col">
            {props.text ? renderText(props.text, props.role) : null}
            {props.streamId && !props.isStreaming ? (
              <div className="flex w-full justify-center">
                <Spinner className="self-center" />
              </div>
            ) : null}
            {props.isStreaming ? (
              <div className="mt-2 flex w-full justify-center">
                <div className="flex flex-row">
                  <Spinner className="self-center" />
                  <button
                    className="ml-2 rounded bg-gray-100 px-4 py-1 font-semibold text-gray-800 shadow hover:bg-zinc-300"
                    onClick={handlePauseClick}
                  >
                    Stop
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(ChatMessage)
