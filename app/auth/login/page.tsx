
import { LoginForm } from '@/components/login-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

export default function Page() {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-white p-6 md:p-10">
      <div className="flex flex-col items-center w-full max-w-2xl bg-white/80 shadow-lg rounded-2xl px-8 py-6 mb-8 border border-orange-100">
        <Image src="/logo-caffeinated.png" alt="J.A.S. Caffeinated Logo" width={380} height={180} className="mb-3" priority />
        <h1 className='text-4xl font-extrabold text-center text-orange-900 drop-shadow-lg tracking-tight mb-2'>
          Welcome to <span className="text-[#E59C53]">J.A.S. Caffeinated</span>
          <br className="hidden md:block" /> QR Menu System Admin Site
        </h1>
        <div className="h-1 w-24 bg-[#E59C53] rounded-full mb-2"></div>
      </div>
      <div className="w-full max-w-md">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
