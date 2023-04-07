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
    <div className="max-w-3xl md:w-3xl mx-auto flex-1 pt-2">
      <div className="flex flex-row">
        <div>{isUser ? <UserIcon /> : <TerminalIcon />}</div>
        <div
          className={classnames('ml-2 p-2 rounded-md flex-1 bg-gray-100', {
            'bg-white border border-gray-100': isUser
          })}
        >
          {props.text}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
