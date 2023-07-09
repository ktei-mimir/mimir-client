import { Link } from 'react-router-dom'

function NewConversationLink(props: { text: string }) {
  return (
    <li>
      <Link
        to="/conversation"
        className="flex items-center p-2 font-medium
        text-white
        transition-colors hover:bg-slate-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>

        <span className="ml-3 max-h-5 flex-1 overflow-hidden text-ellipsis break-all">
          {props.text}
        </span>
      </Link>
    </li>
  )
}

export default NewConversationLink
