import { mergeResolvers } from "@graphql-tools/merge";
import { blogResolvers } from "./blogs";

const combinedResolvers = [
    blogResolvers
]

export const resolvers = mergeResolvers(combinedResolvers as []);
