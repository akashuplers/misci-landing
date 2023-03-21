import { mergeResolvers } from "@graphql-tools/merge";
import { blogResolvers } from "./blogs";
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';

const combinedResolvers = [
    blogResolvers,
    {
        JSON: GraphQLJSON,
    }
]

export const resolvers = mergeResolvers(combinedResolvers as []);
