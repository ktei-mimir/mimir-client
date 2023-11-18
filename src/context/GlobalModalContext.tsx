import { ReactNode, useCallback, useMemo } from 'react'
import { contextFactory } from '@/helpers/contextFactory'
// import HSOverlay from '@preline/overlay'

type Props = {
  children?: ReactNode
}

type GlobalModalActions = {
  showModal: () => void
}

const [useGlobalModalContext, GlobalModalContext] =
  contextFactory<GlobalModalActions>()

export { useGlobalModalContext }

const GlobalModalContextProvider = (props: Props) => {
  const { children } = props

  const showModal = useCallback(() => {
    // const target = document.getElementById('__mimir-global-modal__')
    // if (!target) return
    // const instance = HSOverlay.getInstance(
    //   document.getElementById('__mimir-global-modal__')!,
    //   true
    // )
    // console.log(instance)
    document.getElementById('__mimir-global-modal-trigger__')?.click()
    // const modal = new HSOverlay(
    //   document.querySelector('#__mimir-global-modal__')!
    // )
    // if (isOpen) {
    //   // element.open()
    //   // modal.open()
    // } else {
    //   // element.close()
    //   // await modal.close()
    // }
  }, [])

  const actions = useMemo(
    () => ({
      showModal
    }),
    [showModal]
  )

  return (
    <GlobalModalContext.Provider value={actions}>
      <button
        id="__mimir-global-modal-trigger__"
        type="button"
        className="hidden"
        data-hs-overlay="#__mimir-global-modal__"
      >
        Open modal
      </button>

      <div
        id="__mimir-global-modal__"
        className="hs-overlay fixed left-0 start-0 top-0 z-[99] hidden h-full w-full overflow-y-auto overflow-x-hidden"
      >
        <div className="m-3 opacity-0 transition-all hs-overlay-open:opacity-100 hs-overlay-open:duration-500 sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="flex flex-col rounded-xl border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-slate-700/[.7]">
            <div className="flex items-center justify-between border-b px-4 py-3 dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-white">
                Modal title
              </h3>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-transparent text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50 dark:text-white dark:hover:bg-gray-700 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                data-hs-overlay="#__mimir-global-modal__"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-4 w-4 flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <p className="mt-1 text-gray-800 dark:text-gray-400">
                This is a wider card with supporting text below as a natural
                lead-in to additional content.
              </p>
            </div>
            <div className="flex items-center justify-end gap-x-2 border-t px-4 py-3 dark:border-gray-700">
              <button
                type="button"
                className="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:bg-slate-900 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                data-hs-overlay="#__mimir-global-modal__"
              >
                Close
              </button>
              <a
                className="inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                href="#"
              >
                Save changes
              </a>
            </div>
          </div>
        </div>
      </div>
      {children}
    </GlobalModalContext.Provider>
  )
}

export default GlobalModalContextProvider
