import request from '@/utils/request';
import { loginURL } from '@/utils/url';

export interface LoginParamsType {
  userName: string;
  password: string;
}

export async function accountLogin(params: LoginParamsType) {
  return request(loginURL, {
    method: 'POST',
    data: {
      user_name: params.userName,
      password: params.password,
    },
  });
}

export async function getFakeCaptcha(mobile: string) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}
