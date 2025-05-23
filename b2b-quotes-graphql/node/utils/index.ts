/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as crypto from 'crypto'

import type { RequestTracingConfig } from '@vtex/api'
import { AuthenticationError, ForbiddenError, UserInputError } from '@vtex/api'
import type { AxiosError } from 'axios'

export const toHash = (obj: any) => {
  return crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex')
}

export const NO_REPLY_EMAIL = 'noreply@vtexcommerce.com.br'

export function statusToError(e: any) {
  if (!e.response) {
    throw e
  }

  const { response } = e as AxiosError
  const { status } = response!

  if (status === 401) {
    throw new AuthenticationError(e)
  }

  if (status === 403) {
    throw new ForbiddenError(e)
  }

  if (status === 400) {
    throw new UserInputError(e)
  }

  throw e
}

export const isEmail = new RegExp(/[a-z0-9]+@[a-z]+.[a-z]{2,3}/)

export const createTracing = (
  metric: string,
  tracingConfig?: RequestTracingConfig
) => ({
  requestSpanNameSuffix: metric,
  ...tracingConfig?.tracing,
})
