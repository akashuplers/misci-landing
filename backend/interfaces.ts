export interface GenerateBlogMutationArg {
    keyword: String;
    user_id: string;
}

export interface ReGenerateBlogMutationArg {
    ideas: [Ideas];
    blog_id: string;
}

export interface Ideas {
    idea: String;
    article_id: number;
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

export interface FetchBlog {
    id: string
}