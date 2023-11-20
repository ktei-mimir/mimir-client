import {
  useColorSchemeActionsContext,
  useColorSchemeContext
} from '@/context/ColorSchemeContext'
import { memo, useCallback } from 'react'

const ColorModeSwitcher = () => {
  const { colorMode } = useColorSchemeContext()
  const { setColorMode } = useColorSchemeActionsContext()

  const toggleColorMode = useCallback(() => {
    setColorMode(colorMode === 'dark' ? 'light' : 'dark')
  }, [colorMode, setColorMode])

  return (
    <label className="relative mb-3 inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        value=""
        className="peer sr-only"
        onChange={toggleColorMode}
        checked={colorMode === 'dark'}
      />
      <div
        className="dark:peer-focus:ring-zic-800 peer h-6 w-11 rounded-full bg-gray-200 after:absolute
      after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border
      after:border-gray-300 after:bg-white after:transition-all after:content-['']
      peer-checked:bg-zinc-600 peer-checked:after:translate-x-full peer-checked:after:border-white
      peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-zinc-800
      rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700"
      ></div>
      <span className="drak:text-gray-400 ms-3 text-sm font-medium text-white">
        {colorMode === 'dark' ? 'Light mode' : 'Dark mode'}
      </span>
    </label>
  )
}

export default memo(ColorModeSwitcher)
