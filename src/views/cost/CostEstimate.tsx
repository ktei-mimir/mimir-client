import { TbPigMoney } from 'react-icons/tb'
import { useQuery, useQueryClient } from 'react-query'
import { getCurrentMonthCost, GetCurrentMonthCostResponse } from '@/api/costApi'
import useAuthenticatedApi from '@/hooks/useAuthenticatedApi'
import { useCallback, useEffect } from 'react'
import { emitter, SocketMessage } from '@/context/WebSocketContext'

const CostEstimate = () => {
  const authenticatedApi = useAuthenticatedApi()
  const queryClient = useQueryClient()
  const { data: cost } = useQuery<GetCurrentMonthCostResponse>(
    'costs/current_month',
    async () => {
      return await getCurrentMonthCost(authenticatedApi)
    }
  )

  const handleSocketMessage = useCallback(
    (payload: SocketMessage) => {
      if (payload.action !== 'streamCompletion') {
        return
      }
      const m = payload as unknown as {
        stop?: boolean
      }
      if (m.stop) {
        queryClient.invalidateQueries('costs/current_month').then()
      }
    },
    [queryClient]
  )

  useEffect(() => {
    emitter.on('onMessage', handleSocketMessage)
    return () => {
      emitter.off('onMessage', handleSocketMessage)
    }
  }, [handleSocketMessage])

  if (!cost) {
    return null
  }
  return (
    <span className="me-2 inline-flex items-center rounded bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-400">
      <TbPigMoney className="text-base" />
      <span className="ml-2">
        <span>{cost.amount}</span>
        <span className="ml-0.5">{cost.unit} this month</span>
      </span>
    </span>
  )
}

export default CostEstimate
