import z from 'zod/v4'
import { Email } from '~/emails/_components/email'
import { template } from '~/emails/utils'

const {
    handler,
    render
} = template('recover_account', ({ otp = "000-000" }) => (
    <Email>
        <h1 className='text-brand'>
            Recover Account
        </h1>
        <h1 className='text-black'>
            {otp}
        </h1>
    </Email>
), {
    otp: z.string()
})

export { handler }
export default render