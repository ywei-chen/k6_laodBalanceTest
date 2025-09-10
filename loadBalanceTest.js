import http from 'k6/http';
import { check, sleep } from 'k6';


export const options = {
  insecureSkipTLSVerify: true,
  /*stages: [
    { duration: '10s', target: 50},
    { duration: '20s', target: 100},
    { duration: '10s', target: 200},
    { duration: '10s', target: 0},
  ]*/
};

const staff = 'F19712';
const username = 'ff@mail.com';
const mail  = '6+SR1h9^c@s]';
const baseURL = 'https://172.16.32.17:8100/apis/v1/';


//cofit auth api
const auth = () => {
  const payload = JSON.stringify({login: username.trim(), password: mail.trim()});
  const params = { headers: {
    'Content-Type': 'application/json'
  }};
  const res = http.post(`${baseURL}auth`, payload, params);
  check(res, {
    'auth function api success': (res) => res.status === 200
  });
   return JSON.parse(res.body);
}

//cofit refresh_token api
const refresh_token = (refreshToken, authToken) => {
  const payload = JSON.stringify({refresh_token: refreshToken.trim()});
  const params = { headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  }};
  const res = http.post(`${baseURL}auth/refresh_token`, payload, params);
  check(res, {
    'refresh_token api success': (res) => res.status === 200
  });
   return JSON.parse(res.body);
}

//cofit staff_info api
const staff_info = (authToken) => {
  const params = { headers: {
     'Authorization': `Bearer ${authToken}`,
     'Accept': 'application/json'
  }};
  const url = `${baseURL}staff_info?staff_code=${encodeURIComponent(staff.trim())}`;
  const res = http.get(url, params);
  check(res, {
     'staff_info api success': (res) => res.status === 200
  });
  return JSON.parse(res.body);
}


const decode_payload = (decode, authToken) => {
  const params = { headers: {
     'Authorization': `Bearer ${authToken}`,
     'Accept': 'application/json'
  }};
  const url = `${baseURL}decode_payload?payload=${encodeURIComponent(decode.trim())}`;
  const res = http.get(url, params);
  check(res, {
     'decode_payload api success': (res) => res.status === 200
  });
  return JSON.parse(res.body);
}



export default function () {
  //解析auth API的值，並取出refresh_token、auth_token欄位的值給refresh_token API
   const authData = auth();
   const refreshToken0 = authData.refresh_token;
   const authToken0 = authData.auth_token;

  //解析refresh_token API的值，並取出auth_token欄位的值給staff_info API
   const refreshData = refresh_token(refreshToken0, authToken0);
   const authToken1 = refreshData.auth_token;

   //解析staff_info API的值，並取出staff_info欄位
   const staffData = staff_info(authToken1);
   const staffInfo = staffData.staff_info;

   const decodeRes = decode_payload(staffInfo, authToken1);
   console.log(decodeRes);
}
