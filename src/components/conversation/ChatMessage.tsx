import { Role } from '@/api/messageApi'
import Spinner from '@/components/common/Spinner'
import { TerminalIcon, UserIcon } from '@/components/common/icons'
import classnames from 'classnames'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import DOMPurify from 'isomorphic-dompurify'
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
    hljs.highlightAll()
  }, [props.text])

  const { streamId, onPause } = props

  const handlePauseClick = useCallback(() => {
    if (streamId) {
      onPause?.(streamId)
    }
  }, [onPause, streamId])

  return (
    <div className="sm:w-3xl mx-auto flex-1 pt-4 font-extralight text-gray-200 sm:max-w-3xl">
      <div className="flex flex-row">
        <div className="collapse max-w-0 sm:visible sm:max-w-lg">
          {isUser ? <UserIcon /> : <TerminalIcon />}
        </div>
        <div
          className={classnames(
            'ml-2 flex-1 overflow-x-auto whitespace-pre-wrap p-3 text-base shadow-sm',
            {
              'bg-zinc-700': isUser,
              'bg-slate-700': !isUser
            }
          )}
        >
          <div className="flex-col">
            {props.text ? renderText(props.text, props.role) : null}
            {props.isStreaming ? (
              <div className="mt-2 flex w-full justify-center">
                <div className="flex flex-row">
                  <Spinner className="self-center" />
                  <button
                    className="ml-2 rounded bg-zinc-400 px-4 py-1 font-semibold text-gray-800 shadow hover:bg-zinc-500"
                    onClick={handlePauseClick}
                  >
                    Pause
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
