import { mergeResolvers } from "@graphql-tools/merge";
import { blogResolvers } from "./blogs";
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';
import { usersResolver } from "./users";

const combinedResolvers = [
    blogResolvers,
    usersResolver,
    {
        JSON: GraphQLJSON,
    }
]

export const resolvers = mergeResolvers(combinedResolvers as []);
