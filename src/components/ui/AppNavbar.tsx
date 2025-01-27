import SignInButton from './AuthButton'

const AppNavbar = () => {
  return (
    <nav className="bg-white p-4 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-gray-800 font-bold">
          <a href="/" className="text-gray-700 hover:text-gray-900">
            Fanatic Portal
          </a>
        </div>
        <div className="space-x-8">
          <a href="/challenges" className="text-gray-700 hover:text-gray-900">
            Challenges
          </a>
          <a href="/admin" className="text-gray-700 hover:text-gray-900">
            Admin
          </a>
        </div>
        <SignInButton />
      </div>
    </nav>
  )
}

export default AppNavbar
