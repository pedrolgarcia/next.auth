import { FormEvent, useContext, useState } from 'react'
import { parseCookies } from 'nookies'

import styles from '../styles/Home.module.css'

import { AuthContext } from '../contexts/AuthContext'
import { GetServerSideProps } from 'next'

export default function Home() {
  const { signIn } = useContext(AuthContext)

  const [email, setEmail] = useState('diego@rocketseat.team')
  const [password, setPassword] = useState('123456')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const data = {
      email,
      password,
    }

    await signIn(data)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Entrar</button>
    </form>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = parseCookies(ctx)

  if (cookies['@next.auth:token']) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }
}
