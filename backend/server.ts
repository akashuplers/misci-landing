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
import bodyParser from 'body-parser';
// import {fastify, log} from './fastifyConfig'
import db from "./plugins/db/dbConnection";
import { pubsub } from "./pubsub";
const express = require('express');

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
  const httpServer = createServer(app);
  const database = await db()
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
  console.log(wsServer.options)
  app.use('/graphql', cors<cors.CorsRequest>(), bodyParser.json(), expressMiddleware(server, {
    context: async ({req, res}) => ({
      db: database,
      pubsub: pubsub
    })
  }));
  httpServer.listen(PORT, async () => {
    if(process.env.NODE_ENV !== "production") {
      console.log(`🚀 Query endpoint ready at http://localhost:${PORT}/graphql`);
      console.log(`🚀 Subscription endpoint ready at ws://localhost:${PORT}/graphql`);
    } else {
      console.log(`🚀 Query endpoint ready at https://${process.env.BASE_URL}:${PORT}/graphql`);
      console.log(`🚀 Subscription endpoint ready at wss://${process.env.BASE_URL}:${PORT}/graphql`);
    }
  })
};

startServer()