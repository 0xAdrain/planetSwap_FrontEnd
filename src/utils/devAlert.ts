export const showDevAlert = (feature?: string) => {
  const message = feature 
    ? `${feature} 功能开发中，当前仅用于展示界面效果。` 
    : '该功能开发中，当前仅用于展示界面效果。';
  
  alert(`🚧 ${message}\n\n📝 所有数据均为模拟数据\n🔧 实际功能即将上线`);
};
