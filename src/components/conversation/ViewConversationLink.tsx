import { NavLink } from 'react-router-dom'
import classnames from 'classnames'
import { memo } from 'react'
import useAppState from '@/store/appStateStore'

function ViewConversationLink(props: { text: string; conversationId: string }) {
  // const conversationId = window.location.href.split('/').pop()
  const { selectedConversationId } = useAppState()
  return (
    <li>
      <NavLink
        to={`/conversation/${props.conversationId}`}
        className={isActive =>
          classnames(
            'flex items-center rounded-lg p-2 text-white hover:bg-indigo-400',
            {
              'bg-indigo-400':
                isActive && selectedConversationId === props.conversationId
            }
          )
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 -2 24 24"
          strokeWidth={1}
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
          />
        </svg>

        <span className="ml-3 flex-1 text-ellipsis">{props.text}</span>
      </NavLink>
    </li>
  )
}

export default memo(ViewConversationLink)
