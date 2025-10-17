import styled from '@emotion/styled';

const LoadingContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, 
    #0a1a0e 0%, 
    #1a3a1b 25%, 
    #0f2f0f 50%, 
    #1a3a1b 75%, 
    #0a1a0e 100%
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
`;

const LoadingIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 24px;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
  }
`;

const LoadingText = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  background: linear-gradient(135deg, #228B22 0%, #32CD32 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
`;

const LoadingSubtext = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
`;

export default function LoadingScreen() {
  return (
    <LoadingContainer>
      <LoadingIcon>🌟</LoadingIcon>
      <LoadingText>StarPump 启动中...</LoadingText>
      <LoadingSubtext>正在初始化引力系统</LoadingSubtext>
    </LoadingContainer>
  );
}
