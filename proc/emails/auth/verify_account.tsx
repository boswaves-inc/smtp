import z from 'zod/v4'
import { Email } from '~/emails/_components/email'
import { template } from '~/emails/utils'

const schema = {
    otp: z.string()
}

const {
    handler,
    render
} = template('recover_account', ({ otp = "000-000" }) => (
    <Email>
        <h1 className='text-brand'>
            Verify Account
        </h1>
        <h1 className='text-black'>
            {otp}
        </h1>
    </Email>
), schema)

export { handler }
export default render