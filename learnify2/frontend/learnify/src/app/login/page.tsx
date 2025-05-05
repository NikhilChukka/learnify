'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            // const res = await axios.post('http://127.0.0.1:8000/auth/login', { email, password }, { withCredentials: true })
            // if (res.status === 200) {
            //     router.push('/upload')
            // }
            router.push('/upload')
        } catch (error) {
            console.error('Login failed:', error)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-8 font-[family-name:var(--font-geist-sans)]">
            <h1 className="text-3xl font-bold">Login</h1>
            <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-sm">
                <label className="flex flex-col gap-2">
                    <span>Email</span>
                    <input 
                        type="email" 
                        className="p-2 border border-solid border-black/[.08] dark:border-white/[.145]" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>
                <label className="flex flex-col gap-2">
                    <span>Password</span>
                    <input 
                        type="password" 
                        className="p-2 border border-solid border-black/[.08] dark:border-white/[.145]"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>
                <button 
                    type="submit"
                    className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm h-10 px-4"
                >
                    Login
                </button>
            </form>
        </div>
    )
}
