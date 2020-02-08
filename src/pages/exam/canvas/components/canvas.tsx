import React, { useEffect, useState } from 'react';
import Konva from 'konva';
import { Spin, Button, Radio, Steps } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';

import style from './canvas.less';

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
  nextStep: () => void;
}

const AnswerArea: React.FC<AnswerAreaProps> = props => (
  <>
    {props.step === 0 ? (
      <div>123</div>
    ) : (
      <Radio.Group value={1}>
        <Radio value={1}>A</Radio>
        <Radio value={2}>B</Radio>
        <Radio value={3}>C</Radio>
        <Radio value={4}>D</Radio>
      </Radio.Group>
    )}
  </>
);

interface CanvasProps {
  url: string;
}

const Canvas: React.FC<CanvasProps> = props => {
  const [loading, setLoading] = useState(true);
  const [img] = useState(new Image());
  const [step, setSetp] = useState(0);
  const [stage, setStage] = useState<Konva.Stage>();
  const [pointState, setPoint] = useState<Konva.Layer>();
  const [lineState, setLine] = useState<Konva.Layer>();

  useEffect(() => {
    img.src = props.url;
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
  }, [props.url]);

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
      setSetp(1);
    }
  };

  return (
    <div className={style.layout}>
      <Spin spinning={loading} size="large"></Spin>
      {!loading && (
        <>
          <div id="canvas"></div>
          <div>
            <Steps direction="vertical" size="small" current={step}>
              <Steps.Step title="部位" description="请输入当前图片的部位" />
              <Steps.Step title="标注" description="请输入结构名称并在图形中进行标注" />
            </Steps>
            <AnswerArea step={step} nextStep={nextStep} />
            <Button onClick={clearAll}>清空</Button>
            <br />
            <Button>
              <ArrowLeftOutlined />
              上一题
            </Button>
            <Button>
              下一题
              <ArrowRightOutlined />
            </Button>
            <Button type="primary">提交</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Canvas;
