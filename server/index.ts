import express from "express";
import api from './api'
import react from './react/vite'

import { Postgres } from "./services/postgres";
import { Auth } from "./services/auth";

const pg_client = new Postgres()

const auth_client = new Auth({
  postgres: pg_client
})


api({
    postgres: pg_client,
    auth: auth_client
})


react()