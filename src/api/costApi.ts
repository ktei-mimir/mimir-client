import { AuthenticatedApi } from '@/hooks/useAuthenticatedApi'

export type GetCurrentMonthCostResponse = {
  amount: number
  unit: 'USD' | 'AUD'
}

export const getCurrentMonthCost = (api: AuthenticatedApi) =>
  api
    .get<GetCurrentMonthCostResponse>('costs/current_month')
    .then(res => res.data)
