export interface GenerateBlogMutationArg {
    keyword: string;
    user_id: string;
    article_ids: string[]
    keywords: string[];
    tones: string[];
}
export interface DeleteBlogMutationArg {
    blog_id: string;
}

export interface GenerateTMBlogOptions {
    keyword: String;
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
    problems: string[]
    painPoints: string[]
    challenges: string[]
    companyProfile: string[]
    latestLaunch: string[]
    strategicFocusAreas: string[]
    keyInvestment: string[]
    keyMembers: string[]
    risks: string[]
}


export interface ReGenerateBlogMutationArg {
    ideas: [Ideas];
    blog_id: string;
}

export interface UpdateBlogMutationArg {
    tinymce_json: String;
    blog_id: string;
    platform: String;
    imageUrl?: String;
    imageSrc?: String;
    description?: String;
    threads?: [String];
}

export interface Ideas {
    text: string;
    article_id: string;
}

export interface ReGenerateBlogMutationArg {
    ideas: [Ideas];
    blog_id: string
    useOldWebSource: Boolean
    updatedTopic: string
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

export interface IRNotifiyArgs {
    user_id: string;
    topic: String;
    sequence_ids: string[]
}

export interface BlogListArgs {
    page_limit: number;
    page_skip: number;
    status: [String];
    userName: String;
    search: String;
}

export interface PreferencesArgs {
    keywords: [String]
}