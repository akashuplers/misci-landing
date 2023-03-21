export interface GenerateBlogMutationArg {
    keyword: String;
    user_id: String;
}

export interface User {
    id: string;
    email: string;
    company: string;
    iat: number;
    exp: number;
}