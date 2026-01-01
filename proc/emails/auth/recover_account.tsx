import { Row, Section, Column } from '@react-email/components'
import { formData } from 'zod-form-data'
import { Email } from '~/components/email'
import z from 'zod/v4'

export const Data = formData({
    otp: z.string()
})

export type Data = z.output<typeof Data>

export default () => (
    <Email>
        <h1 className='text-brand'>
            Recover Account
        </h1>
        <Section>
            <Row>
                <Column>A</Column>
            </Row>
            <Row>
                <Column>B</Column>
            </Row>
            <Row>
                <Column>C</Column>
            </Row>
        </Section>
    </Email>
)