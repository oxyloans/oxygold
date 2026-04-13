let BASE_URL = '';
let userType = "prod"; // default to local
if(userType === "local") {
    BASE_URL = "http://65.0.147.157:9900/api";
} else {
    BASE_URL = "https://meta.oxyloans.com/api";
}

export const API_BASE_URL = BASE_URL;