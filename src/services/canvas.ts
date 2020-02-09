import request from '../utils/request';
import { getImgListURl, submitExamURL } from '../utils/url';

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

export declare module submitExamParamsType {
  export interface Annotation2 {
    name: string;
    vertex: string;
  }

  export interface Annotation {
    id: number;
    bodyPart: string;
    annotations: Annotation2[];
  }

  export interface RootObject {
    annotations: Annotation[];
  }
}

export async function submitExam(annotations: submitExamParamsType.RootObject) {
  return request(submitExamURL, {
    data: annotations,
    method: 'POST',
  });
}
