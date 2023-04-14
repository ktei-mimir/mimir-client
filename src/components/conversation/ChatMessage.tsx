import { Role } from '@/api/messageApi'
import { TerminalIcon, UserIcon } from '@/components/common/icons'
import classnames from 'classnames'
import { memo } from 'react'
import Spinner from '@/components/common/Spinner'

type MessageProps = {
  text?: string
  role: Role
}

const ChatMessage = (props: MessageProps) => {
  const isUser = props.role === 'user'
  return (
    <div className="md:w-3xl mx-auto max-w-3xl flex-1 pt-4 text-gray-700">
      <div className="flex flex-row">
        <div>{isUser ? <UserIcon /> : <TerminalIcon />}</div>
        <div
          className={classnames(
            'ml-2 flex-1 whitespace-pre-wrap rounded-md border border-gray-100 p-3 text-base shadow-sm',
            {
              'bg-white': isUser
            },
            {
              'bg-gray-100': !isUser
            }
          )}
        >
          {props.text ? props.text : <Spinner />}
        </div>
      </div>
    </div>
  )
}

export default memo(ChatMessage)
