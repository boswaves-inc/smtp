import { formData } from 'zod-form-data'
import { Email } from '../../components/email'
import z from 'zod/v4'


export const Data = formData({
    otp: z.string()
})

export type Data = z.output<typeof Data>

export default () => (
    <Email>
        <h1 className='text-brand'>
            Verify Account
        </h1>
    </Email>
)