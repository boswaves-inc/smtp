import cors from 'cors'

export default () => cors({
    allowedHeaders: [
        'Content-Type',
        'Authorization'
    ]
})
