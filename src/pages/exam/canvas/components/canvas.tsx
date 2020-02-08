import React, { useEffect, useState } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import Konva from 'konva';
import { Spin, Button, Steps, Input, Divider, Typography, List } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { ConnectState } from '@/models/connect';
import { CanvasStateType, CanvasResultType } from '@/models/canvas';

import style from './canvas.less';

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

interface AnswerAreaProps {
  step: number;
  item: CanvasResultType[];
  itemIndex: number;
  nextStep: () => void;
  clearAll: () => void;
  dispatch: Dispatch<AnyAction>;
}

// 工具箱动态变化部分
const AnswerArea: React.FC<AnswerAreaProps> = props => {
  const [bodyPart, setBodyPart] = useState('');
  const [name, setName] = useState('');
  return (
    <>
      {props.step === 0 ? (
        <>
          <Input
            placeholder="请输入图片所示的部位"
            className={style.inputArea}
            value={bodyPart}
            onChange={e => setBodyPart(e.target.value)}
          />
          <Button onClick={props.nextStep} type="primary">
            下一步
          </Button>
        </>
      ) : (
        <>
          {props.item.length !== 0 && (
            <List
              size="small"
              header={<div>Header</div>}
              footer={<div>Footer</div>}
              bordered
              dataSource={props.item}
              renderItem={item => <List.Item>{item.name}</List.Item>}
            />
          )}
          <Divider />
          <Input
            placeholder="请输入正在标注的结构名称"
            className={style.inputArea}
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Button onClick={props.clearAll} disabled={props.itemIndex === 0}>
            上一个
          </Button>
          <Button onClick={props.clearAll}>清空</Button>
          <Button onClick={props.clearAll}>下一个</Button>
        </>
      )}
    </>
  );
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
      pointState.clear();
      lineState.clear();
    }
  };

  const nextStep = () => {
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
    }
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
      <div className={style.toolbox}>
        <Typography.Title level={4}>
          第{props.userCanvas.current + 1}题 / 共{props.userCanvas.image.length}题
        </Typography.Title>
        <Divider />
        {/* 进度条 */}
        <Steps direction="vertical" size="small" current={step}>
          <Steps.Step title="部位" description="请输入当前图片的部位" />
          <Steps.Step title="标注" description="请输入结构名称并在图形中进行标注" />
        </Steps>
        <AnswerArea
          step={step}
          nextStep={nextStep}
          clearAll={clearAll}
          itemIndex={props.userCanvas.currentItem}
          item={props.userCanvas.result[props.userCanvas.current].annotations}
          dispatch={props.dispatch}
        />
        <Divider />
        {/* 题目控制按钮 */}
        <Button
          disabled={props.userCanvas.current === 0}
          onClick={() =>
            props.dispatch({
              type: 'canvas/save',
              payload: {
                current: props.userCanvas.current - 1,
              },
            })
          }
        >
          <ArrowLeftOutlined />
          上一题
        </Button>
        <Button
          disabled={step !== 1 || props.userCanvas.current === props.userCanvas.image.length - 1}
          onClick={() => {
            props.dispatch({
              type: 'canvas/save',
              payload: {
                current: props.userCanvas.current + 1,
              },
            });
            setStep(0);
          }}
        >
          下一题
          <ArrowRightOutlined />
        </Button>
        <Button
          type="primary"
          disabled={!(step === 1 && props.userCanvas.current === props.userCanvas.image.length - 1)}
        >
          提交
        </Button>
      </div>
    </div>
  );
};

export default connect(({ canvas }: ConnectState) => ({
  userCanvas: canvas,
}))(Canvas);
