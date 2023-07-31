export interface BlogLink {
    label: string;
    value: string;
    selected: boolean;
    id: string;
    index: number;
    type: 'file' | 'url' | 'keyword';
}
export interface UserDataResponse {
    data: {
      me: {
        upcomingInvoicedDate: number;
        name: string;
        lastName: string;
        subscriptionId: string;
        subscribeStatus: string;
        paid: boolean;
        lastInvoicedDate: number;
        isSubscribed: boolean;
        interval: string;
        freeTrialDays: number;
        freeTrial: boolean;
        freeTrailEndsDate: null | string; // The date might be null or a string
        email: string;
        date: string;
        admin: string;
        _id: string;
        credits: number;
        prefFilled: boolean;
        profileImage:  string;
        publishCount: number;
        prefData: []
        totalCredits: 25,
        paymentsStarts: null,
        creditRenewDay: null,
        hours_left_for_quota_renew: number,
        remaining_twitter_quota: number,
        total_twitter_quota: number,
        emailVerified: boolean
      };
    };
  }
  
  export interface InputData {
    urls: string[];
    keywords: string[];
    files: File[];
  }