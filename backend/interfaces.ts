export interface GenerateBlogMutationArg {
    keyword: String;
    user_id: string;
}

export interface UpdateBlogMutationArg {
    tinymce_json: String;
    blog_id: string;
    platform: String;
}

export interface Ideas {
    text: String;
    article_id: String;
}

export interface ReGenerateBlogMutationArg {
    ideas: [Ideas];
    blog_id: string
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