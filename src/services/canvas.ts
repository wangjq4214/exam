import request from '../utils/request';
import { getImgListURl } from '../utils/url';

export declare namespace getListReturnType {
  export interface Result {
    id: number;
    image_path: string;
  }

  export interface RootObject {
    result: Result[];
    error: string;
    status: number;
  }
}

export async function getList(id: number) {
  return request<getListReturnType.RootObject>(getImgListURl, {
    params: {
      id,
    },
    method: 'GET',
  });
}
