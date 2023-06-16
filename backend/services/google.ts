const { google } = require('googleapis');
const sheets = google.sheets('v4');
export class Google {
    service: any;
    scopes: string[]
    constructor() {
        this.service = "auth.json"
        this.scopes = ['https://www.googleapis.com/auth/spreadsheets']
    }
    async getAuthToken() {
        try {
            const auth = new google.auth.GoogleAuth({
                keyFilename: this.service,
                scopes: this.scopes
            });
            const authToken = await auth.getClient();
            return authToken;
        }catch(e){
            console.log(e, "error from google")
            throw e?.response?.data || e?.message
        }
    }
    async getSpreadSheet({spreadsheetId, auth}: any) {
        try {
            const res = await sheets.spreadsheets.get({
                spreadsheetId,
                auth,
            });
            console.log(res,"sheet")
            return res;   
        }catch(e){
            console.log(e, "error from google")
            throw e?.response?.data || e?.message
        }
    }

    async getSpreadSheetValues({spreadsheetId, auth, sheetName}: {
        spreadsheetId: string;
        auth: any;
        sheetName: string
    }) {
        try {
            console.log(sheetName, "sheetName")
            const res = await sheets.spreadsheets.values.get({
                spreadsheetId,
                auth,
                range: sheetName
            });
            console.log(res, "values")
            if(res?.data) {
                return res?.data
            }
            return res;
        }catch(e){
            console.log(e, "error from google")
            throw e?.response?.data || e?.message
        }
    }
}