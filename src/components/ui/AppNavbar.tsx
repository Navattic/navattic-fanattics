import Link from 'next/link'
import SignInButton from './AuthButton'
import { NavatticLogo } from './NavatticLogo'

const AppNavbar = () => {
  return (
    <nav className="bg-white p-4 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-gray-800 font-bold">
          <Link href="/" className="text-gray-700 hover:text-gray-900">
            <NavatticLogo />
          </Link>
        </div>
        <div className="flex gap-3">
          <SignInButton />
          <Link
            href="/admin"
            className="text-gray-700 hover:text-gray-900 border border-gray-200 rounded-md px-2 py-1"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default AppNavbar
