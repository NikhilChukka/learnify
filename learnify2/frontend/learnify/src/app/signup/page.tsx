import Link from 'next/link';


export default function SignUp(){
    return (
        <div className='flex flex-col items-center justify-center min-h-screen pb-20 gap-8 font-[family-name:var(--font-geist-sans)]'>
            <h1 className='text-3xl font-bold'>Sign Up</h1>
            <form className= 'flex flex-col gap-4 w-full max-w-sm' action="">
                <label className="flex flex-col gap-2" htmlFor="email" >
                    <span>Email</span>
                    <input type="email" className="p-2 border border-solid border-black/[.08] dark:border-white/[.5]" />
                </label>
                <label htmlFor="password" className="flex flex-col gap-2">
                    <span>Password</span>
                    <input type="password" className='p-2 border border-solid border-black/[.08] dark:border-white/[.5]'/>
                </label>
                <label htmlFor="password" className="flex flex-col gap-2">
                    <span>Retype your password</span>
                    <input type="password" className='p-2 border border-solid border-black/[.08] dark:border-white/[.5]'/>
                </label>
                <button className='rounded-full h-10 px-4 bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm' type='submit'>
                    Sign Up
                </button>
                <label htmlFor="login here" className='flex gap-2 p-2'>Already have an account?
                </label>
                <Link href='/login' className='rounded-full border flex items-center justify-center border-solid border-transparent 
                transition-colors w-1/2 h-10 px-4 bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm'>
                    Login
                </Link>
                
            </form>
        </div>
    )
}