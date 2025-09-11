import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import LoginForm from '../../../features/auth/LoginForm'
import OnboardingForm from '../../../features/auth/OnboardingForm'
import { Icon } from '@/components/ui'

export default async function Page() {
  const session = await getServerSession(authOptions)

  const BULLETS: string[] = [
    'Meet other Fanattic users and build your network.',
    'Earn rewards and redeem for gifts.',
    'Stay up to date with the latest Navattic events.',
  ]

  // If user is authenticated, show onboarding form
  if (session) {
    return (
      <section className="flex h-screen flex-col items-center justify-center bg-gray-50">
        <div className="w-xl rounded-xl bg-white p-8 shadow-sm">
          <OnboardingForm session={session} />
        </div>
      </section>
    )
  }

  // If user is not authenticated, show sign-up form
  return (
    <div className="flex">
      <section className="flex h-screen flex-1 flex-col items-center justify-center bg-white">
        <div className="m-4 w-full max-w-xl bg-white p-8">
          <LoginForm mode="signup" />
        </div>
      </section>
      <div className="grid flex-1 place-items-center border-l border-gray-200 bg-gray-50">
        <div className="mx-auto my-20 w-fit max-w-xl px-6 lg:px-0">
          <div className="text-emphasis mb-4 text-lg font-semibold text-balance lg:text-xl">
            Join the Navattic Fanattic community and{' '}
            <span className="text-gray-600">earn rewards.</span>
          </div>
          <div className="flex flex-col gap-3">
            {BULLETS.map((bullet) => (
              <div className="flex gap-3 text-gray-500" key={bullet}>
                <Icon name="check" size="lg" />
                <div>{bullet}</div>
              </div>
            ))}
          </div>
          <div className="text-subtle mt-5 lg:mt-12">
            <div className="mt-20">
              <p className="">Used by forward-thinking teams</p>
              <div className="border-default mt-4 grid grid-cols-3 gap-4 gap-y-10 rounded-lg border border-dotted bg-white/30 px-4 py-8 backdrop-blur-md">
                <img
                  alt="Cisco logo"
                  loading="lazy"
                  width="300"
                  height="158"
                  decoding="async"
                  data-nimg="1"
                  style={{ scale: '1.5' }}
                  className="h-[26px] w-full max-w-[180px] object-contain object-center"
                  srcSet="https://cdn.sanity.io/images/8czhh5u2/production/fecb9fbbbcd58213fbcde8e5ef184533cef113a9-3795x2000.png?w=300&amp;auto=format 1x, https://cdn.sanity.io/images/8czhh5u2/production/fecb9fbbbcd58213fbcde8e5ef184533cef113a9-3795x2000.png?w=300&amp;auto=format 2x"
                  src="https://cdn.sanity.io/images/8czhh5u2/production/fecb9fbbbcd58213fbcde8e5ef184533cef113a9-3795x2000.png?w=300&amp;auto=format"
                />
                <img
                  alt="Gusto logo"
                  loading="lazy"
                  width="300"
                  height="114"
                  decoding="async"
                  data-nimg="1"
                  className="h-[26px] w-full max-w-[180px] object-contain object-center"
                  srcSet="https://cdn.sanity.io/images/8czhh5u2/production/2164904f8353d174d02acc869dc13e8b9d689c7b-713x271.svg?w=300&amp;auto=format 1x, https://cdn.sanity.io/images/8czhh5u2/production/2164904f8353d174d02acc869dc13e8b9d689c7b-713x271.svg?w=300&amp;auto=format 2x"
                  src="https://cdn.sanity.io/images/8czhh5u2/production/2164904f8353d174d02acc869dc13e8b9d689c7b-713x271.svg?w=300&amp;auto=format"
                />
                <img
                  alt="VTS logo"
                  loading="lazy"
                  width="300"
                  height="78"
                  decoding="async"
                  data-nimg="1"
                  className="h-[26px] w-full max-w-[180px] object-contain object-center"
                  srcSet="https://cdn.sanity.io/images/8czhh5u2/production/59591151205e040e115a7f27fe7965dab0974512-784x203.svg?w=300&amp;auto=format 1x, https://cdn.sanity.io/images/8czhh5u2/production/59591151205e040e115a7f27fe7965dab0974512-784x203.svg?w=300&amp;auto=format 2x"
                  src="https://cdn.sanity.io/images/8czhh5u2/production/59591151205e040e115a7f27fe7965dab0974512-784x203.svg?w=300&amp;auto=format"
                />
                <img
                  alt="Dropbox logo"
                  loading="lazy"
                  width="300"
                  height="59"
                  decoding="async"
                  data-nimg="1"
                  style={{ scale: '0.9' }}
                  className="h-[26px] w-full max-w-[180px] object-contain object-center"
                  srcSet="https://cdn.sanity.io/images/8czhh5u2/production/d17d02621c07da0a2ef9081263afbe5ec8d30ceb-2560x504.png?w=300&amp;auto=format 1x, https://cdn.sanity.io/images/8czhh5u2/production/d17d02621c07da0a2ef9081263afbe5ec8d30ceb-2560x504.png?w=300&amp;auto=format 2x"
                  src="https://cdn.sanity.io/images/8czhh5u2/production/d17d02621c07da0a2ef9081263afbe5ec8d30ceb-2560x504.png?w=300&amp;auto=format"
                />
                <img
                  alt="Vitally logo"
                  loading="lazy"
                  width="300"
                  height="79"
                  decoding="async"
                  data-nimg="1"
                  className="h-[26px] w-full max-w-[180px] object-contain object-center"
                  srcSet="https://cdn.sanity.io/images/8czhh5u2/production/ebbe01f69daed519ecfc6ef6d947ecb2d018f2c3-774x203.svg?w=300&amp;auto=format 1x, https://cdn.sanity.io/images/8czhh5u2/production/ebbe01f69daed519ecfc6ef6d947ecb2d018f2c3-774x203.svg?w=300&amp;auto=format 2x"
                  src="https://cdn.sanity.io/images/8czhh5u2/production/ebbe01f69daed519ecfc6ef6d947ecb2d018f2c3-774x203.svg?w=300&amp;auto=format"
                />
                <img
                  alt="Coupa logo"
                  loading="lazy"
                  width="300"
                  height="73"
                  decoding="async"
                  data-nimg="1"
                  className="h-[26px] w-full max-w-[180px] object-contain object-center"
                  srcSet="https://cdn.sanity.io/images/8czhh5u2/production/b6cd0f1d03870a728beaeed418963b668e56f83e-5000x1412.png?w=300&amp;auto=format 1x, https://cdn.sanity.io/images/8czhh5u2/production/b6cd0f1d03870a728beaeed418963b668e56f83e-5000x1412.png?w=300&amp;auto=format 2x"
                  src="https://cdn.sanity.io/images/8czhh5u2/production/b6cd0f1d03870a728beaeed418963b668e56f83e-5000x1412.png?w=300&amp;auto=format"
                />
                <img
                  alt="Mixpanel logo"
                  loading="lazy"
                  width="300"
                  height="110"
                  decoding="async"
                  data-nimg="1"
                  className="h-[26px] w-full max-w-[180px] object-contain object-center"
                  srcSet="https://cdn.sanity.io/images/8czhh5u2/production/5a1d11efb760b63b786d3b880d292e7311852afa-1200x403.png?w=300&amp;auto=format 1x, https://cdn.sanity.io/images/8czhh5u2/production/5a1d11efb760b63b786d3b880d292e7311852afa-1200x403.png?w=300&amp;auto=format 2x"
                  src="https://cdn.sanity.io/images/8czhh5u2/production/5a1d11efb760b63b786d3b880d292e7311852afa-1200x403.png?w=300&amp;auto=format"
                />
                <img
                  alt="Intuit logo"
                  loading="lazy"
                  width="300"
                  height="90"
                  decoding="async"
                  data-nimg="1"
                  className="h-[26px] w-full max-w-[180px] object-contain object-center"
                  srcSet="https://cdn.sanity.io/images/8czhh5u2/production/2cd142fdf78243e7d1feb6eca5591edb456dcb5a-1200x361.png?w=300&amp;auto=format 1x, https://cdn.sanity.io/images/8czhh5u2/production/2cd142fdf78243e7d1feb6eca5591edb456dcb5a-1200x361.png?w=300&amp;auto=format 2x"
                  src="https://cdn.sanity.io/images/8czhh5u2/production/2cd142fdf78243e7d1feb6eca5591edb456dcb5a-1200x361.png?w=300&amp;auto=format"
                />
                <img
                  alt="Datadog logo"
                  loading="lazy"
                  width="300"
                  height="158"
                  decoding="async"
                  data-nimg="1"
                  style={{ scale: '2.2' }}
                  className="h-[26px] w-full max-w-[180px] object-contain object-center"
                  srcSet="https://cdn.sanity.io/images/8czhh5u2/production/13f4ee4cdeb2287ac776c7046a31d44f15f11b58-1200x630.png?w=300&amp;auto=format 1x, https://cdn.sanity.io/images/8czhh5u2/production/13f4ee4cdeb2287ac776c7046a31d44f15f11b58-1200x630.png?w=300&amp;auto=format 2x"
                  src="https://cdn.sanity.io/images/8czhh5u2/production/13f4ee4cdeb2287ac776c7046a31d44f15f11b58-1200x630.png?w=300&amp;auto=format"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
