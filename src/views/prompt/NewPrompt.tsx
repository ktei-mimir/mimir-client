import { memo } from 'react'
import Container from '@/components/common/Container'

const NewPrompt = () => {
  return (
    <Container>
      <div className="flex justify-center">
        <form className="mb-4 w-full rounded bg-white px-8 pb-8 pt-6 shadow-md sm:max-w-xl sm:self-center">
          <div className="mb-4">
            <label
              className="mb-2 block text-sm font-bold text-gray-700"
              htmlFor="promptTitle"
            >
              Prompt title
            </label>
            <input
              className="focus:shadow-outline mb-3 w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
              id="promptTitle"
              placeholder="e.g. Explain code snippet"
            />
            {/*<p className="text-xs italic text-red-500">*/}
            {/*  Please choose a password.*/}
            {/*</p>*/}
          </div>
          <div className="mb-6">
            <label
              className="mb-2 block text-sm font-bold text-gray-700"
              htmlFor="promptText"
            >
              Prompt text
            </label>
            <textarea
              id="promptText"
              className="focus:shadow-outline h-96 w-full resize-y appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
              placeholder="e.g. Explain this code snippet...

======= BEGIN CODE SNIPPET =======
#{INPUT}
======= END CODE SNIPPET =======
              "
            ></textarea>
          </div>
          <div className="flex items-center justify-between">
            <button
              className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
              type="button"
            >
              Create
            </button>
            <a
              className="inline-block align-baseline text-sm font-bold text-blue-500 hover:text-blue-800"
              href="#"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </Container>
  )
}

export default memo(NewPrompt)
