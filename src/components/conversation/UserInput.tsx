const UserInput = () => {
  return (
    <div
      className="md:bg-vert-light-gradient dark:md:bg-vert-dark-gradient absolute bottom-0 left-0 flex 
      w-full justify-center border-t 
      bg-white pt-2 dark:border-white/20 dark:bg-gray-800 md:border-t-0 md:border-transparent md:dark:border-transparent"
    >
      <form className="stretch ml-2 flex w-full flex-row gap-3 last:mb-2 md:mx-4 md:max-w-5xl">
        <label htmlFor="chat" className="sr-only">
          Your question...
        </label>
        <div className="flex w-full items-center py-2 md:px-3">
          <textarea
            id="chat"
            rows={1}
            style={{ minHeight: '2.625rem' }}
            className="mx-4 block w-full resize-none rounded-lg border border-gray-300 bg-white p-2.5 text-sm
              text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 
              dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 
              dark:focus:border-blue-500 dark:focus:ring-blue-500 md:max-h-36 md:resize-y"
            placeholder="Your question..."
          ></textarea>
          <button
            type="button"
            className="inline-flex cursor-pointer justify-center rounded-full p-2 text-blue-600
              hover:bg-blue-100 dark:text-blue-500  dark:hover:bg-gray-600"
          >
            <svg
              aria-hidden="true"
              className="h-6 w-6 rotate-90"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
            </svg>
            <span className="sr-only">Send message</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserInput
