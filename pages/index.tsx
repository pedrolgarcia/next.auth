import { FormEvent, useState } from 'react'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const data = {
      email,
      password,
    }
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
