import React, { useEffect, useState } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import Konva from 'konva';
import { Spin } from 'antd';
import { ConnectState } from '@/models/connect';
import { CanvasStateType } from '@/models/canvas';

import style from './canvas.less';
import Toolbox from './toolbox';

// 根据标记点画出区域
const drawArea = (source: Konva.Layer, target: Konva.Layer) => {
  const triangle = new Konva.Shape({
    sceneFunc: function sceneFunc(context) {
      context.beginPath();
      source.children.each(item => {
        if (item.index === 0) {
          context.moveTo(item.attrs.x, item.attrs.y);
        }
        context.lineTo(item.attrs.x, item.attrs.y);
      });
      context.closePath();
      context.fillStrokeShape(this);
    },
    fill: '#00D2FF',
    opacity: 0.1,
    stroke: 'black',
    strokeWidth: 4,
  });
  target.clear();
  target.add(triangle);
  target.draw();
};

interface CanvasProps {
  userCanvas: CanvasStateType;
  dispatch: Dispatch<AnyAction>;
}

const Canvas: React.FC<CanvasProps> = props => {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [stage, setStage] = useState<Konva.Stage>();
  const [pointState, setPoint] = useState<Konva.Layer>();
  const [lineState, setLine] = useState<Konva.Layer>();

  useEffect(() => {
    setLoading(true);
    const { image, current } = props.userCanvas;
    const img = new Image();
    img.src = image[current].name;
    img.onload = () => {
      props.dispatch({
        type: 'canvas/saveImageDetail',
        payload: {
          width: img.width,
          height: img.height,
        },
      });
      setLoading(false);
      const canvas = new Konva.Stage({
        container: 'canvas',
        width: 800,
        height: 600,
      });

      const imgLayer = new Konva.Layer();
      const pointLayer = new Konva.Layer();
      const lineLayer = new Konva.Layer();

      // 添加背景图片
      const canvasImg = new Konva.Image({
        image: img,
        scaleX: canvas.width() / img.width,
        scaleY: canvas.height() / img.height,
      });

      imgLayer.add(canvasImg);

      canvas.add(imgLayer);
      canvas.add(lineLayer);
      canvas.add(pointLayer);

      setPoint(pointLayer);
      setLine(lineLayer);
      setStage(canvas);
    };
  }, [props.userCanvas.current]);

  const clearAll = () => {
    if (pointState && lineState) {
      pointState.destroyChildren();
      lineState.destroyChildren();
      pointState.clear();
      lineState.clear();
    }
  };

  const nextStep = (bodyPart: string) => {
    if (stage && pointState && lineState) {
      stage.on('click', (e: Konva.KonvaEventObject<MouseEvent>) => {
        const point = new Konva.Circle({
          x: e.evt.offsetX - 2,
          y: e.evt.offsetY - 2,
          radius: 4,
          fill: 'green',
          draggable: true,
        });
        point.on('click', (evt: Konva.KonvaEventObject<MouseEvent>) => {
          evt.cancelBubble = true;
        });
        point.on('dragend', () => {
          drawArea(pointState, lineState);
        });
        pointState.add(point);
        drawArea(pointState, lineState);
        pointState.draw();
      });
      setStep(1);
      props.dispatch({
        type: 'canvas/saveBodyPart',
        payload: bodyPart,
      });
    }
  };

  const saveStep = (name: string) => {
    props.dispatch({
      type: 'canvas/saveAnnotations',
      payload: {
        name,
        vertex: pointState?.toJSON(),
      },
    });
    clearAll();
  };

  return (
    <div className={style.layout}>
      {/* 画板与loading */}
      {loading && (
        <div className={style.canvas}>
          <Spin spinning={loading} size="large"></Spin>
        </div>
      )}
      {!loading && <div id="canvas" className={style.canvas}></div>}
      {/* 工具箱 */}
      <Toolbox
        step={step}
        setStep={setStep}
        clearAll={clearAll}
        nextStep={nextStep}
        saveStep={saveStep}
      />
    </div>
  );
};

export default connect(({ canvas }: ConnectState) => ({
  userCanvas: canvas,
}))(Canvas);
