import { Role } from '@/api/messageApi'
import { TerminalIcon, UserIcon } from '@/components/common/icons'
import classnames from 'classnames'

type MessageProps = {
  text: string
  role: Role
}

const ChatMessage = (props: MessageProps) => {
  const isUser = props.role === 'user'
  return (
    <div className="md:w-3xl mx-auto max-w-3xl flex-1 pt-2">
      <div className="flex flex-row">
        <div>{isUser ? <UserIcon /> : <TerminalIcon />}</div>
        <div
          className={classnames(
            'ml-2 flex-1 whitespace-pre-wrap rounded-md border border-gray-100 bg-gray-100 p-2',
            {
              'bg-white': isUser
            }
          )}
        >
          {props.text}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
