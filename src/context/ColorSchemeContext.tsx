import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { contextFactory } from '@/helpers/contextFactory'

type Props = {
  children?: ReactNode
}

type ColorMode = 'light' | 'dark'

type ColorSchemeValues = {
  colorMode?: ColorMode
}

type ColorSchemeActions = {
  setColorMode: (mode: ColorMode) => void
}

import produce from 'immer'

function changeColorMode(state: ColorSchemeValues, colorMode: ColorMode) {
  return produce(state, draft => {
    draft.colorMode = colorMode
  })
}

const [useColorSchemeContext, ColorSchemeContext] =
  contextFactory<ColorSchemeValues>()

const [useColorSchemeActionsContext, ColorSchemeActionsContext] =
  contextFactory<ColorSchemeActions>()

export { useColorSchemeContext, useColorSchemeActionsContext }

const ColorSchemeContextProvider = (props: Props) => {
  const { children } = props

  const [state, setState] = useState<ColorSchemeValues>({})

  useEffect(() => {
    if (state.colorMode === undefined) {
      const isDarkMode = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
      setState(changeColorMode(state, isDarkMode ? 'dark' : 'light'))
    }
  }, [state])

  const setColorMode = useCallback(
    (colorMode: ColorMode) => setState(changeColorMode(state, colorMode)),
    [state]
  )

  const values = useMemo(() => state ?? {}, [state])
  const actions = useMemo(
    () => ({
      setColorMode
    }),
    [setColorMode]
  )
  return (
    <ColorSchemeContext.Provider value={values ?? {}}>
      <ColorSchemeActionsContext.Provider value={actions}>
        {children}
      </ColorSchemeActionsContext.Provider>
    </ColorSchemeContext.Provider>
  )
}

export default ColorSchemeContextProvider
