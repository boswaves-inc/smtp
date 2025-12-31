import _ from 'lodash';
import express from 'express'

export default () => {
    const router = express()

    router.get('/', (_, res) => {
        return res.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            service: "boswaves/smtp",
            version: "1.0.0",
        })
    })

    return router;
}