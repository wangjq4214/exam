import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { Card, Button, notification } from 'antd';
import { ConnectState } from '@/models/connect';
import { CanvasStateType } from '@/models/canvas';
import Canvas from './components/canvas';

interface Props {
  dispatch: Dispatch<AnyAction>;
  userCanvas: CanvasStateType;
  fetchImgList?: boolean;
}

const Index: React.FC<Props> = props => {
  const [examing, setExaming] = useState<boolean>(false);

  const enterExam = async () => {
    try {
      await props.dispatch({
        type: 'canvas/fetchImgList',
      });
      setExaming(true);
    } catch (e) {
      notification.error({
        description: '服务器未完成请求',
        message: e,
      });
    }
  };

  return (
    <PageHeaderWrapper content="考试详情">
      <Card>
        {!examing ? (
          <div style={{ textAlign: 'center' }}>
            <Button onClick={enterExam} loading={props.fetchImgList}>
              进入考试
            </Button>
          </div>
        ) : (
          <Canvas />
        )}
      </Card>
    </PageHeaderWrapper>
  );
};

export default connect(({ canvas, loading }: ConnectState) => ({
  userCanvas: canvas,
  fetchImgList: loading.effects['canvas/fetchImgList'],
}))(Index);
