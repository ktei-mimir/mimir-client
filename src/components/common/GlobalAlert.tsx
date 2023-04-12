import { useGlobalAlertContext } from '@/context/GlobalAlertContext'
import Alert from '@/components/common/Alert'

const GlobalAlert = () => {
  const { error } = useGlobalAlertContext()

  if (error) {
    return (
      <div className="flex w-full justify-center">
        <Alert.Error message={error} />
      </div>
    )
  }

  return null
}

export default GlobalAlert
