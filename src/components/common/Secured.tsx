import { withAuthenticationRequired } from '@auth0/auth0-react'
import React from 'react'

const Secured = (props: { children?: React.ReactNode }) => {
  return <>{props.children}</>
}

export default withAuthenticationRequired(Secured)
