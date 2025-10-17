# 🚀 **PlanetSwap V4 部署配置指南**

**基于X Layer Testnet的多链架构**

---

## 🌍 **环境变量配置**

### **创建 `.env.local` 文件**

```bash
# 在 PlanetSwap-FrontEnd 目录下创建 .env.local
cp .env.example .env.local  # 如果有模板
# 或直接创建新文件
```

### **🔗 必需配置**

```bash
# WalletConnect 配置
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# 🎯 X Layer Testnet 合约地址 (部署后更新)
NEXT_PUBLIC_PLANET_TOKEN_XLAYER=0x...
NEXT_PUBLIC_WOKB_XLAYER=0x...
NEXT_PUBLIC_PLANET_FACTORY_XLAYER=0x...
NEXT_PUBLIC_PLANET_ROUTER_XLAYER=0x...
NEXT_PUBLIC_MASTER_CHEF_XLAYER=0x...
NEXT_PUBLIC_MERKLE_DISTRIBUTOR_XLAYER=0x...
```

---

## 🎯 **X Layer Testnet 信息**

| 配置项 | 值 |
|--------|-----|
| **Chain ID** | `1952` |
| **网络名称** | `X Layer Testnet` |
| **RPC URL** | `https://testrpc.xlayer.tech/terigon` |
| **原生代币** | `OKB` |
| **区块浏览器** | `https://web3.okx.com/explorer/xlayer-test` |

---

## 📋 **部署检查清单**

### **✅ 合约部署状态**

- [ ] ✅ PLANET Token 已部署
- [ ] ✅ WOKB (Wrapped OKB) 已部署  
- [ ] ✅ PlanetFactory 已部署
- [ ] ✅ PlanetRouter 已部署
- [ ] ✅ MasterChef 已部署
- [ ] ✅ MerkleDistributor 已部署

### **🔧 前端配置状态**

- [ ] ✅ 环境变量已配置
- [ ] ✅ 合约地址已更新
- [ ] ✅ 链配置已验证
- [ ] ✅ WalletConnect 已设置

---

## 🛠️ **开发环境设置**

### **1. 安装依赖**
```bash
cd PlanetSwap-FrontEnd
npm install
# 或
yarn install
```

### **2. 启动开发服务器**
```bash
npm run dev
# 或  
yarn dev
```

### **3. 连接X Layer Testnet**
- 在钱包中添加X Layer Testnet网络
- 获取测试OKB: [X Layer Faucet](https://xlayer.tech/faucet)
- 连接到PlanetSwap前端

---

## 🚀 **生产部署**

### **1. 构建项目**
```bash
npm run build
npm start
```

### **2. 部署选项**
- **Vercel**: 推荐，零配置部署
- **Netlify**: 简单配置
- **Docker**: 自托管选项

### **3. 域名配置**
- 更新 `appUrl` 为实际域名
- 配置DNS解析
- 设置SSL证书

---

## 🔍 **故障排除**

### **常见问题**

1. **钱包连接失败**
   - 检查网络是否添加X Layer Testnet
   - 验证RPC URL是否正确

2. **合约交互错误**  
   - 确认合约地址是否正确
   - 检查链ID是否匹配

3. **环境变量未生效**
   - 重启开发服务器
   - 检查变量名是否正确

### **调试工具**
- 浏览器开发者控制台
- X Layer Testnet区块浏览器
- Wagmi开发者工具

---

## 📞 **技术支持**

如遇到部署问题，请检查：
1. 环境变量配置
2. 合约部署状态  
3. 网络连接状况
4. 控制台错误日志
