import Spinner from '@/components/common/Spinner'
import React, { memo, useState } from 'react'

type UserInputProps = {
  onSubmit?: (message: string) => void
  isBusy?: boolean
}

const UserInput = (props: UserInputProps) => {
  const [form, setForm] = useState({
    message: ''
  })

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm(_form => ({
      ..._form,
      [e.target.name]: e.target.value
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey || e.ctrlKey) {
        e.preventDefault()
        e.currentTarget.value += '\n'
      } else {
        e.preventDefault()
        submit()
      }
    }
  }

  // Validate the form and start create quote mutation
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    submit()
  }

  const submit = () => {
    if (props.isBusy) return
    const { message } = form
    if (!message) {
      return
    }
    props.onSubmit?.(message)
    setForm({ message: '' })
  }

  return (
    <div
      className="sm:bg-vert-light-gradient absolute bottom-0 left-0 flex
      w-full justify-center border-t border-gray-100 bg-white
      pt-2
      dark:border-zinc-700 dark:bg-zinc-800 sm:border-t-0 sm:border-transparent"
    >
      <form
        className="stretch ml-2 flex w-full flex-row gap-3 last:mb-2 sm:mx-4 sm:max-w-5xl"
        onSubmit={handleSubmit}
      >
        <label htmlFor="chat" className="sr-only">
          Your question...
        </label>
        <div className="flex w-full items-center py-2 sm:px-3">
          <textarea
            id="chat"
            rows={1}
            name="message"
            style={{ minHeight: '2.625rem' }}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            value={form.message}
            className="mx-4 block w-full resize-none p-2.5 text-base
              text-gray-700 placeholder-gray-400
              shadow
              dark:bg-zinc-700 dark:text-white
              dark:outline-none sm:max-h-36 sm:resize-y"
            placeholder="Your question..."
          ></textarea>
          {props.isBusy ? <Spinner /> : null}
          {props.isBusy ? null : (
            <button
              type="submit"
              className="group inline-flex cursor-pointer justify-center rounded-full p-2 transition-colors
               hover:bg-gray-950 dark:text-slate-700 dark:hover:bg-slate-700"
            >
              <svg
                aria-hidden="true"
                className="h-6 w-6 rotate-90 text-gray-950 group-hover:text-white dark:text-zinc-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
              </svg>
              <span className="sr-only">Send message</span>
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default memo(UserInput)
