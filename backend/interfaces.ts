export interface GenerateBlogMutationArg {
    keyword: String;
    user_id: String;
}

export interface UpdateBlogMutationArg {
    tinymce_json: String;
    blog_id: string;
    platform: String;
}

export interface User {
    id: string;
    email: string;
    company: string;
    iat: number;
    exp: number;
}