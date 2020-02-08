import { Reducer } from 'redux';
import { Effect } from 'dva';
import Konva from 'konva';
import { getList, getListReturnType } from '@/services/canvas';

export interface CanvasResultType {
  name: string;
  vertex: Konva.Layer;
}

export interface CanvasStateType {
  current: number;
  currentItem: number;
  image: {
    name: string;
    id: number;
  }[];
  result: {
    bodyPart: string;
    annotations: CanvasResultType[];
  }[];
}

export interface CanvasModelType {
  namespace: string;
  state: CanvasStateType;
  effects: {
    fetchImgList: Effect;
  };
  reducers: {
    changeImage: Reducer;
    save: Reducer;
  };
}

const Model: CanvasModelType = {
  namespace: 'canvas',
  state: {
    current: 0,
    currentItem: 0,
    image: [],
    result: [],
  },
  effects: {
    *fetchImgList({ payload }, { call, put }) {
      const res: getListReturnType.RootObject = yield call(getList, payload);
      if (res.status === 1) {
        yield put({
          type: 'changeImage',
          payload: res,
        });
      } else {
        throw new Error(res.error);
      }
    },
  },
  reducers: {
    changeImage(state, { payload }) {
      const data = payload.result.map((item: getListReturnType.Result) => ({
        name: `https://wghtstudio.cn/app/static/${item.image_path}`,
        id: item.id,
      }));

      const temp = payload.result.map(() => ({
        bodyPart: '',
        annotations: [],
      }));

      return {
        ...state,
        image: data,
        result: temp,
      };
    },
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};

export default Model;
