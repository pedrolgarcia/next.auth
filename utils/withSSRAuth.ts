import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next'
import { destroyCookie, parseCookies } from 'nookies'
import { AuthTokenError } from '../services/errors/AuthTokenError'

export function withSSRAuth<P extends { [key: string]: any }>(
  fn: GetServerSideProps<P>,
) {
  return async (
    ctx: GetServerSidePropsContext,
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx)

    if (!cookies['@next.auth:token']) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
    }

    try {
      return await fn(ctx)
    } catch (err) {
      if (err instanceof AuthTokenError) {
        destroyCookie(undefined, '@next.auth:token')
        destroyCookie(undefined, '@next.auth:refreshToken')
      }

      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
    }
  }
}
