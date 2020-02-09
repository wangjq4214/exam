import React, { useState } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { Button, Steps, Input, Divider, Typography, List, message } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { ConnectState } from '@/models/connect';
import { CanvasStateType } from '@/models/canvas';

import style from './canvas.less';

interface ToolboxProps {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  clearAll: () => void;
  nextStep: (bodtPart: string) => void;
  saveStep: (name: string) => void;
  userCanvas: CanvasStateType;
  loading?: boolean;
  dispatch: Dispatch<AnyAction>;
}

const Toolbox: React.FC<ToolboxProps> = props => {
  const { step, setStep, clearAll, nextStep, saveStep, userCanvas, dispatch } = props;
  const [bodyPart, setBodyPart] = useState('');
  const [name, setName] = useState('');

  return (
    <div className={style.toolbox}>
      <Typography.Title level={4}>
        第{userCanvas.current + 1}题 / 共{userCanvas.image.length}题
      </Typography.Title>
      <Divider />
      {/* 进度条 */}
      <Steps direction="vertical" size="small" current={step}>
        <Steps.Step title="部位" description="请输入当前图片的部位" />
        <Steps.Step title="标注" description="请输入结构名称并在图形中进行标注" />
      </Steps>
      <Divider />
      {props.step === 0 ? (
        <>
          <Input
            placeholder="请输入图片所示的部位"
            className={style.inputArea}
            value={bodyPart}
            onChange={e => setBodyPart(e.target.value)}
          />
          <Button
            onClick={() => {
              nextStep(bodyPart);
              setBodyPart('');
            }}
            type="primary"
          >
            下一步
          </Button>
        </>
      ) : (
        <>
          <List
            style={{ marginBottom: '5px' }}
            header={<div>已标注</div>}
            size="small"
            bordered
            dataSource={userCanvas.result[userCanvas.current].annotations}
            renderItem={(item, index) => (
              <List.Item>
                <div>{item.name}</div>
                <div>
                  <a
                    onClick={() => {
                      dispatch({
                        type: 'canvas/deleteAnnotation',
                        payload: index,
                      });
                    }}
                  >
                    删除
                  </a>
                </div>
              </List.Item>
            )}
          />
          <Input
            placeholder="请输入正在标注的结构名称"
            className={style.inputArea}
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Button onClick={clearAll}>清空</Button>
          <Button
            onClick={() => {
              if (name === '') {
                message.error('结构名称必须填写');
                return;
              }
              saveStep(name);
              setName('');
            }}
            type="primary"
          >
            保存
          </Button>
        </>
      )}
      <Divider />
      {/* 题目控制按钮 */}
      <Button
        disabled={userCanvas.current === 0}
        onClick={() => {
          props.dispatch({
            type: 'canvas/save',
            payload: {
              current: userCanvas.current - 1,
            },
          });
          setBodyPart(userCanvas.result[userCanvas.current].bodyPart);
        }}
      >
        <ArrowLeftOutlined />
        上一题
      </Button>
      <Button
        disabled={userCanvas.current === userCanvas.image.length - 1}
        onClick={() => {
          dispatch({
            type: 'canvas/save',
            payload: {
              current: userCanvas.current + 1,
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
        loading={props.loading}
        disabled={!(step === 1 && userCanvas.current === userCanvas.image.length - 1)}
        onClick={() =>
          dispatch({
            type: 'canvas/submit',
          })
        }
      >
        提交
      </Button>
    </div>
  );
};

export default connect(({ canvas, loading }: ConnectState) => ({
  userCanvas: canvas,
  loading: loading.effects['canvas/submit'],
}))(Toolbox);
