import { Reducer } from 'redux';
import { Effect } from 'dva';
import { router } from 'umi';
import { notification } from 'antd';
import Konva from 'konva';
import { getList, submitExam, getListReturnType, submitExamParamsType } from '@/services/canvas';
import { ConnectState } from './connect.d';

export interface CanvasResultType {
  name: string;
  vertex: string;
}

export interface CanvasStateType {
  current: number;
  currentItem: number;
  image: {
    name: string;
    id: number;
    width: number;
    height: number;
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
    submit: Effect;
  };
  reducers: {
    changeImage: Reducer;
    saveImageDetail: Reducer;
    saveBodyPart: Reducer;
    saveAnnotations: Reducer;
    deleteAnnotation: Reducer;
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
    *submit(_, { call, select }) {
      const data: submitExamParamsType.RootObject = {
        annotations: [],
      };
      const state: CanvasStateType = yield select((s: ConnectState) => s.canvas);
      state.result.forEach((item, index) => {
        const temp = item.annotations.map(itemAnno => {
          const layer: Konva.Layer = Konva.Node.create(itemAnno.vertex);
          let vertex = '';
          layer.children.each(itemNode => {
            vertex += `${itemNode.x() / (800 / state.image[index].width)},${itemNode.y() /
              (600 / state.image[index].height)};`;
          });

          return { name: itemAnno.name, vertex };
        });
        data.annotations.push({
          id: state.image[index].id,
          bodyPart: item.bodyPart,
          annotations: temp,
        });
      });
      const res = yield call(submitExam, data);
      if (res.status === 1) {
        router.replace('/');
        notification.success({
          message: '提交成功',
        });
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
        current: 0,
      };
    },
    saveImageDetail(state, { payload }) {
      const data: CanvasStateType = JSON.parse(JSON.stringify(state));
      data.image[data.current].width = payload.width;
      data.image[data.current].height = payload.height;
      return { ...data };
    },
    saveBodyPart(state, { payload }) {
      const data: CanvasStateType = JSON.parse(JSON.stringify(state));
      data.result[data.current].bodyPart = payload;
      return { ...data };
    },
    saveAnnotations(state, { payload }) {
      const data: CanvasStateType = JSON.parse(JSON.stringify(state));
      data.result[data.current].annotations.push(payload);
      return { ...data };
    },
    deleteAnnotation(state: CanvasStateType, { payload }) {
      state.result[state.current].annotations.splice(payload, 1);
      return { ...state };
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
