import axios, { AxiosError } from 'axios'
import { parseCookies, setCookie } from 'nookies'

import { signOut } from '../contexts/AuthContext'

let cookies = parseCookies()
let isRefreshing = false
let failedRequestsQueue: any[] = []

export const api = axios.create({
  baseURL: 'http://localhost:3333',
})

const { '@next.auth:token': tokenFromStorage } = cookies
if (tokenFromStorage) {
  api.defaults.headers.common['Authorization'] = `Bearer ${tokenFromStorage}`
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const { code } = error.response?.data as { code: string }

      if (code === 'token.expired') {
        cookies = parseCookies()

        const { '@next.auth:refreshToken': refreshToken } = cookies
        const originalConfig = error.config

        if (!isRefreshing) {
          isRefreshing = true

          api
            .post('/refresh', {
              refreshToken,
            })
            .then((response) => {
              const { token, refreshToken: newRefreshToken } = response.data

              setCookie(undefined, '@next.auth:token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
              })

              setCookie(undefined, '@next.auth:refreshToken', newRefreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
              })

              api.defaults.headers.common['Authorization'] = `Bearer ${token}`

              failedRequestsQueue.forEach((request) => request.onSuccess(token))
              failedRequestsQueue = []
            })
            .catch((err) => {
              failedRequestsQueue.forEach((request) => request.onFailure(err))
              failedRequestsQueue = []
            })
            .finally(() => {
              isRefreshing = false
            })
        }

        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            onSuccess: (token: string) => {
              if (originalConfig?.headers) {
                originalConfig.headers['Authorization'] = `Bearer ${token}`
                resolve(api(originalConfig))
              }
            },
            onFailure: (err: AxiosError) => {
              reject(err)
            },
          })
        })
      } else {
        signOut()
      }
    }

    return Promise.reject(error)
  },
)
