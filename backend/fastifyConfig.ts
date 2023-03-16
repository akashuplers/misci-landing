import { __prod_cors__ } from "./constants";
import Fastify, { FastifyInstance } from "fastify";
// import fastifyCors from 'fastify-cors';
import csrf from "fastify-csrf";
import fastifyLog from "fastify-log";
// import fastifyMongodb from "fastify-mongodb";
// import { db } from "./mongoConfig/mongo";
const helmet = require('@fastify/helmet')

interface OurFastifyInstance extends FastifyInstance {
  db?: any;
  mongo?: any;
  authorize?: any;
  logger?: {
    info: (arg: string) => void;
    warn: (arg: string) => void;
    error: (arg: string) => void;
  };
}

const fastify: OurFastifyInstance = Fastify({pluginTimeout: 30000, logger: true});

//! TODO: Make sure to change these for our production app
const corsConfig = __prod_cors__;
// fastify.register(fastifyCors, corsConfig);

// fastify.register(fastifyCors, { origin: "*" });
// console.log("fastifyCors", fastifyCors);
fastify.register(helmet, {});


fastify.register(require('@fastify/csrf-protection'), {
  sessionPlugin: '@fastify/cookie',
  // cookieOpts: { signed: true }
});

fastify.register(fastifyLog, {
  allInOne: true,
  timeFormat: "MM/dd/YY-HH:mm:ss ",
  info: "#58a6ff",
  warn: "#d9910b",
  error: "#fc7970",
});

// fastify.register(fastifyMongodb, {
//   // client: db,
//   forceClose: true,
//   url: process.env.MONGO_STRING,
// });

export const log = {
  info: (arg: string) => fastify?.logger?.info(arg),
  warn: (arg: string) => fastify?.logger?.warn(arg),
  err: (arg: string) => fastify?.logger?.error(arg),
};

export { fastify };
