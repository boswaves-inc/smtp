import _ from 'lodash';
import express from 'express'
import { Context } from '../types';

export default ({ auth }: Context) => {
    const router = express()

    router.get('/', async (req, res) => {
        const { permissions } = await auth.authenticate_key(req, res)

    })

    router.post('/', async (req, res) => {
        const { permissions } = await auth.authenticate_key(req, res)

    })

    router.get('/:id', async (req, res) => {
        const { permissions } = await auth.authenticate_key(req, res)

    })

    router.delete('/:id', async (req, res) => {
        const { permissions } = await auth.authenticate_key(req, res)

    })

    router.post('/:id/retry-dns', async (req, res) => {
        const { permissions } = await auth.authenticate_key(req, res)

    })

    router.post('/:id/smtp', async (req, res) => {
        const { permissions } = await auth.authenticate_key(req, res)

    })

    router.delete('/:id/smtp', async (req, res) => {
        const { permissions } = await auth.authenticate_key(req, res)

    })

    router.post('/:id/verify', async (req, res) => {
        const { permissions } = await auth.authenticate_key(req, res)

    })

    return router;
}