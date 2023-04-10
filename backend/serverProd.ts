import dotenv from "dotenv-safe";
dotenv.config();

import path from "path";
import {typeDefs} from './graphql/typeDefs'
import {resolvers} from './graphql/resolver'
import WebSocket, { Server } from 'ws';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { expressMiddleware } from '@apollo/server/express4';
import { useServer } from 'graphql-ws/lib/use/ws';
import { createServer } from 'http';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from 'cors'
import GraphQLJSON from 'graphql-type-json';
import bodyParser from 'body-parser';
// import {fastify, log} from './fastifyConfig'
import db from "./plugins/db/dbConnection";
import { pubsub } from "./pubsub";
import { User } from "./interfaces";
import { verify } from "jsonwebtoken";
import { GraphQLError } from "graphql";
const express = require('express');
const authRoutes = require('./routes/authRoutes')
const waitlist = require('./routes/waitlistRoutes')
const upload = require('./routes/uploadRoutes')
const stripe = require('./routes/stripeRoutes')
const quickupload = require('./routes/quickuploadRoutes')

const PORT = process.env.PORT || 5000

// await (
//   (async () => {
//     const database = await db()
//   })()
// )
const getDynamicContext = async (ctx: any, msg: any, args: any) => {
  return { pubsub };
};
const startServer = async () => {
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const app = express()
  app.use(cors());
  // parse various different custom JSON types as JSON
  app.use(bodyParser.json({limit: '50mb'}))

  // parse some custom thing into a Buffer
  app.use(bodyParser.raw())
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/auth', authRoutes)
  app.use('/waitlist', waitlist)
  app.use('/upload', upload)
  app.use('/stripe', stripe)
  app.use('/quickupload', quickupload)
  const httpServer = createServer(app);
  const database = await db()
  app.set('db', database)
  // Creating the WebSocket server
  const wsServer = new Server({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if app.use
    // serves expressMiddleware at a different path
    path: '/graphql',
  });
  // Hand in the schema we just created and have the
  // WebSocketServer start listening.
  const serverCleanup = useServer({ schema, context: async (ctx, msg, args) => {
    // You can define your own function for setting a dynamic context
    // or provide a static value
    return getDynamicContext(ctx, msg, args);
  }, }, wsServer);
  // Set up ApolloServer.
  const server = new ApolloServer({
    schema,
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),
        // Proper shutdown for the WebSocket server.
        {
          async serverWillStart() {
            return {
              async drainServer() {
                await serverCleanup.dispose();
              },
            };
          },
        },
      ],
  });
  await server.start()
  app.use('/graphql', cors<cors.CorsRequest>(), bodyParser.json(), expressMiddleware(server, {
    context: async ({req, res}: any) => {
      const authHeaders = req?.headers?.authorization || "";
      const accessToken = authHeaders.split(" ")[1];
      const temp1 = req?.headers?.[process.env.PYKEY1!];
      const temp2 = req?.headers?.[process.env.PYKEY2!];
      // if (temp1 && temp2) {
      //   if (process.env.PYVAL1 !== temp1 || process.env.PYVAL2 !== temp2) {
      //     return res.status(403).send({ error: true, message: "FORBIDDEN" });
      //   }
      // } else {
      //   // if (!accessToken) {
      //   //   res
      //   //     .status(401)
      //   //     .send({ error: true, message: "Please Register or Login" });
      //   // }
        
      // }
      let verAcc = {};
      if (accessToken) {
        try {
          verAcc = verify(accessToken, process.env.JWT_SECRET_KEY!);
          req.verAcc = verAcc;
        } catch (err) {
          throw new GraphQLError('User is not authenticated', {
            extensions: {
              code: 'UNAUTHENTICATED',
              http: { status: 401 }
            }
          });
        }
      }
      const token = req?.headers?.authorization
        ? req?.headers?.authorization?.split(" ")?.[1]
        : "";
      let user = <User>{};
      try {
        user = <User>verify(token, process.env.JWT_SECRET_KEY!);
      } catch (err) {
        return res.status(401).send({ error: true, message: err.message });
      }
      return {
        db: database,
        pubsub: pubsub,
        req, res,
        user
      }
    }
  }));
  httpServer.listen(PORT, async () => {
    console.log(`🚀 Query endpoint ready at https://${process.env.BASE_URL}:${PORT}/graphql`);
    console.log(`🚀 Subscription endpoint ready at wss://${process.env.BASE_URL}:${PORT}/graphql`);
  })
};

startServer()