import { memo, ReactNode } from 'react'
import classNames from 'classnames'

type Props = {
  children?: ReactNode
  className?: string
}

const Container = (props: Props) => {
  return (
    <div className={classNames('pt-5', props.className)}>{props.children}</div>
  )
}

export default memo(Container)
