import { Role } from '@/api/messageApi'
import { TerminalIcon, UserIcon } from '@/components/common/icons'
import classnames from 'classnames'
import { memo, useEffect } from 'react'
import Spinner from '@/components/common/Spinner'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import DOMPurify from 'isomorphic-dompurify'

type MessageProps = {
  text?: string
  role: Role
}

function renderText(text: string, role: Role) {
  if (role === 'user') return text
  return (
    <div
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(text)) }}
    ></div>
  )
}

const ChatMessage = (props: MessageProps) => {
  const isUser = props.role === 'user'
  useEffect(() => {
    hljs.highlightAll()
  }, [props.text])
  return (
    <div className="md:w-3xl mx-auto flex-1 pt-4 text-gray-700 md:max-w-3xl">
      <div className="flex flex-row">
        <div className="collapse max-w-0 md:visible md:max-w-lg">
          {isUser ? <UserIcon /> : <TerminalIcon />}
        </div>
        <div
          className={classnames(
            'ml-2 flex-1 overflow-x-auto whitespace-pre-wrap rounded-md border border-gray-100 p-3 text-base shadow-sm',
            {
              'bg-white': isUser
            },
            {
              'bg-gray-100': !isUser
            }
          )}
        >
          {props.text ? renderText(props.text, props.role) : <Spinner />}
        </div>
      </div>
    </div>
  )
}

export default memo(ChatMessage)
