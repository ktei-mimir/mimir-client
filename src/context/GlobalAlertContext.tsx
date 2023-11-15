import { contextFactory } from '@/helpers/contextFactory'
import { ReactNode, useCallback, useMemo, useState } from 'react'
import GlobalAlert from '@/components/common/GlobalAlert'

type GlobalAlertValues = {
  error?: string
  notification?: string
}
type GlobalSpinnerActions = {
  setError: (error?: string) => void
  setNotification: (message?: string) => void
}

const [useGlobalAlertContext, GlobalAlertContext] =
  contextFactory<GlobalAlertValues>()
const [useGlobalAlertActionsContext, GlobalAlertActionsContext] =
  contextFactory<GlobalSpinnerActions>()
export { useGlobalAlertContext, useGlobalAlertActionsContext }

type Props = {
  children?: ReactNode
}

import produce from 'immer'

function updateError(state: GlobalAlertValues, error?: string) {
  return produce(state, draft => {
    draft.error = error
  })
}

function updateNotification(state: GlobalAlertValues, message?: string) {
  return produce(state, draft => {
    draft.notification = message
  })
}

const GlobalAlertContextProvider = (props: Props) => {
  const { children } = props
  const [state, setState] = useState<GlobalAlertValues>({})

  const setError = useCallback(
    (error?: string) => setState(updateError(state, error)),
    [state]
  )
  const setNotification = useCallback(
    (message?: string) => setState(updateNotification(state, message)),
    [state]
  )
  const values = useMemo(() => state ?? {}, [state])
  const actions = useMemo(
    () => ({
      setError,
      setNotification
    }),
    [setError, setNotification]
  )
  return (
    <GlobalAlertContext.Provider value={values ?? {}}>
      <GlobalAlertActionsContext.Provider value={actions}>
        <GlobalAlert />
        {children}
      </GlobalAlertActionsContext.Provider>
    </GlobalAlertContext.Provider>
  )
}

export default GlobalAlertContextProvider
