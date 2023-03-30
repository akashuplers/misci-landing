import { gql } from "@apollo/client";

export const getAllBlogs = gql`{
    query GetAllBlogs {
        getAllBlogs {
            _id
            title  
            description
            tags   
            image 
        }
    }
}
`;
