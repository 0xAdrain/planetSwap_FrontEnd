import { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { PhotoIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Container = styled.div`
  max-width: 1800px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 550px 1fr;
  gap: 40px;
  
  @media (max-width: 1400px) {
    grid-template-columns: 500px 1fr;
    gap: 30px;
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const Header = styled.div`
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #32CD32;
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
`;

const StatusBadges = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 20px;
  flex-wrap: wrap;
`;

const StatusBadge = styled.div<{ variant: 'success' | 'info' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.variant === 'success' 
    ? 'rgba(34, 139, 34, 0.2)' 
    : 'rgba(59, 130, 246, 0.2)'};
  border: 1px solid ${props => props.variant === 'success' 
    ? 'rgba(34, 139, 34, 0.4)' 
    : 'rgba(59, 130, 246, 0.4)'};
  border-radius: 24px;
  padding: 8px 16px;
  color: ${props => props.variant === 'success' ? '#32CD32' : '#60A5FA'};
  font-size: 0.9rem;
  font-weight: 500;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const FormCard = styled(motion.div)`
  background: linear-gradient(145deg, rgba(15, 35, 15, 0.9) 0%, rgba(25, 55, 25, 0.8) 100%);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  gap: 20px;
  width: 100%;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  min-width: 0;
`;

const Label = styled.label`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  font-weight: 500;
  
  span {
    color: #32CD32;
  }
`;

const Input = styled.input`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 12px;
  padding: 14px 16px;
  color: white;
  font-size: 1rem;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #32CD32;
    box-shadow: 0 0 0 2px rgba(50, 205, 50, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const TextArea = styled.textarea`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 12px;
  padding: 14px 16px;
  color: white;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #32CD32;
    box-shadow: 0 0 0 2px rgba(50, 205, 50, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const CharCount = styled.div`
  text-align: right;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  margin-top: -4px;
`;

const UploadArea = styled.div<{ hasImage: boolean }>`
  background: rgba(0, 0, 0, 0.4);
  border: 2px dashed ${props => props.hasImage ? '#32CD32' : 'rgba(34, 139, 34, 0.3)'};
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    border-color: #32CD32;
    background: rgba(0, 0, 0, 0.5);
  }
  
  svg {
    width: 48px;
    height: 48px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0 auto 12px;
  }
  
  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.95rem;
  }
`;

const ImagePreview = styled.div`
  position: relative;
  display: inline-block;
  
  img {
    max-width: 200px;
    max-height: 200px;
    border-radius: 8px;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  svg {
    width: 16px;
    height: 16px;
    color: white;
  }
  
  &:hover {
    background: #dc2626;
    transform: scale(1.1);
  }
`;

const ChainBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(34, 139, 34, 0.2);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 8px;
  padding: 8px 16px;
  color: #32CD32;
  font-size: 0.9rem;
  font-weight: 500;
`;

const LaunchButton = styled(motion.button)`
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 32px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 25px rgba(30, 144, 255, 0.4);
    transform: translateY(-2px);
  }
`;

const Footer = styled.div`
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid rgba(34, 139, 34, 0.2);
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
`;

const RulesSidebar = styled.div`
  position: sticky;
  top: 24px;
  height: fit-content;
  max-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
`;

const RulesCard = styled(motion.div)`
  background: linear-gradient(145deg, rgba(15, 35, 15, 0.9) 0%, rgba(25, 55, 25, 0.8) 100%);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const RulesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-shrink: 0;
`;

const RulesTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 600;
  color: #32CD32;
  margin: 0;
`;

const AddRuleButton = styled(motion.button)`
  background: linear-gradient(135deg, #32CD32 0%, #228B22 100%);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(34, 139, 34, 0.4);
  }
`;

const RulesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
  margin-right: -8px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(34, 139, 34, 0.5);
    border-radius: 10px;
    
    &:hover {
      background: rgba(34, 139, 34, 0.7);
    }
  }
`;

const RuleItem = styled(motion.div)`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(34, 139, 34, 0.2);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #32CD32;
    background: rgba(0, 0, 0, 0.4);
  }
`;

const RuleName = styled.div`
  color: white;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RuleDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
`;

const RuleRow = styled.div`
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.7);
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  &:hover {
    background: rgba(239, 68, 68, 0.2);
  }
`;

const EmptyRules = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.95rem;
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: linear-gradient(145deg, rgba(15, 35, 15, 0.95) 0%, rgba(25, 55, 25, 0.9) 100%);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 20px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #32CD32;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  svg {
    width: 24px;
    height: 24px;
  }
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const RuleTaxRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DistributionSection = styled.div`
  margin-top: 24px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(34, 139, 34, 0.2);
`;

const DistributionTitle = styled.h4`
  color: #32CD32;
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DistributionItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgba(34, 139, 34, 0.5);
    background: rgba(0, 0, 0, 0.4);
  }
`;

const DistributionHeader = styled.div`
  display: grid;
  grid-template-columns: 30px 1fr 100px 80px;
  gap: 12px;
  align-items: center;
`;

const ConfigSection = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  padding-top: 16px;
  margin-top: 4px;
  border-top: 1px solid rgba(34, 139, 34, 0.15);
`;

const ConfigItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ConfigLabel = styled.label`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ConfigInput = styled(Input)`
  font-size: 0.9rem;
  padding: 10px 14px;
`;

const DistributionSelect = styled.select`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  color: white;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #32CD32;
    box-shadow: 0 0 0 2px rgba(50, 205, 50, 0.2);
  }
  
  option {
    background: rgba(15, 35, 15, 0.95);
    color: white;
  }
`;

const ConfigSelect = styled(DistributionSelect)`
  font-size: 0.9rem;
  padding: 10px 14px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: rgba(255, 255, 255, 0.95);
  }
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #32CD32;
  }
`;

const InfoButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: help;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  position: relative;
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  &:hover {
    color: #32CD32;
    background: rgba(34, 139, 34, 0.2);
  }
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  background: rgba(15, 35, 15, 0.98);
  border: 1px solid rgba(34, 139, 34, 0.5);
  border-radius: 8px;
  padding: 12px 16px;
  min-width: 250px;
  max-width: 300px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.85rem;
  line-height: 1.5;
  z-index: 1000;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 12px;
    border: 6px solid transparent;
    border-top-color: rgba(15, 35, 15, 0.98);
  }
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.2);
    transition: 0.3s;
    border-radius: 24px;
    
    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }
  
  input:checked + span {
    background-color: #32CD32;
  }
  
  input:checked + span:before {
    transform: translateX(26px);
  }
`;

const AddDistributionButton = styled(motion.button)`
  background: rgba(34, 139, 34, 0.15);
  border: 2px dashed rgba(34, 139, 34, 0.4);
  border-radius: 14px;
  padding: 16px;
  color: #32CD32;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 8px;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(34, 139, 34, 0.25);
    border-color: #32CD32;
    border-style: solid;
    transform: translateY(-1px);
  }
  
  svg {
    width: 22px;
    height: 22px;
  }
`;

const DistributionLabel = styled.label`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
`;

const PercentageInput = styled(Input)`
  text-align: center;
`;

const TotalPercentage = styled.div<{ valid: boolean }>`
  margin-top: 12px;
  padding: 12px;
  background: ${props => props.valid ? 'rgba(34, 139, 34, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  border: 1px solid ${props => props.valid ? 'rgba(34, 139, 34, 0.4)' : 'rgba(239, 68, 68, 0.4)'};
  border-radius: 8px;
  color: ${props => props.valid ? '#32CD32' : '#ef4444'};
  text-align: center;
  font-weight: 600;
`;

const CreateRuleButton = styled(LaunchButton)`
  margin-top: 24px;
`;

interface DistributionItem {
  id: string;
  type: string;
  percentage: number;
  config?: {
    // Buyback & Burn
    burnInterval?: string; // 'immediate' | 'daily' | 'weekly'
    minBuybackAmount?: number;
    
    // Airdrop Pool
    airdropInterval?: string; // 'daily' | 'weekly' | 'monthly'
    minHoldAmount?: number;
    snapshotTime?: string;
    
    // Donation
    charityAddress?: string;
    donationInterval?: string; // 'monthly' | 'quarterly' | 'yearly'
    
    // Strategy
    targetAssets?: string[]; // ['BTC', 'ETH']
    buyThreshold?: number; // Percentage drop to buy
    sellThreshold?: number; // Percentage gain to sell
    rebalanceInterval?: string; // 'daily' | 'weekly'
    
    // Liquidity Pool
    targetPool?: string; // Pool address or identifier
    autoCompound?: boolean;
    
    // Development Fund
    vestingPeriod?: number; // in days
    releaseInterval?: string; // 'monthly' | 'quarterly'
    
    // Marketing
    campaignBudget?: number;
    approvalRequired?: boolean;
  };
}

const DISTRIBUTION_OPTIONS = [
  {
    value: 'buyback',
    label: 'Buyback & Burn',
    description: 'Automatically buy back tokens from the market and burn them permanently, reducing total supply and potentially increasing token value.'
  },
  {
    value: 'airdrop',
    label: 'Airdrop Pool',
    description: 'Distribute tokens to existing holders as rewards, encouraging long-term holding and community loyalty.'
  },
  {
    value: 'donation',
    label: 'Donation',
    description: 'Allocate funds to charitable causes or community projects, building positive brand image and social impact.'
  },
  {
    value: 'strategy',
    label: 'Strategy (BTC/ETH)',
    description: 'Invest in blue-chip assets like BTC/ETH. When they appreciate above a set threshold, sell and convert back to project tokens.'
  },
  {
    value: 'liquidity',
    label: 'Liquidity Pool',
    description: 'Add to liquidity pools to improve trading depth and reduce price slippage for better user experience.'
  },
  {
    value: 'development',
    label: 'Development Fund',
    description: 'Support ongoing project development, including new features, audits, and technical improvements.'
  },
  {
    value: 'marketing',
    label: 'Marketing & Growth',
    description: 'Fund marketing campaigns, partnerships, and community growth initiatives to expand project reach.'
  },
];

interface TaxRule {
  id: string;
  enabled: boolean;
  buyTax: number;
  sellTax: number;
  distributions: DistributionItem[];
}

export default function LaunchTokenInterface() {
  const [description, setDescription] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);
  const [taxRule, setTaxRule] = useState<TaxRule>({
    id: '1',
    enabled: false,
    buyTax: 0,
    sellTax: 0,
    distributions: [] as DistributionItem[],
  });
  
  const maxDescriptionLength = 256;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLaunch = () => {
    alert('Token launch functionality is under development. This is for demonstration purposes only.');
  };

  const handleToggleTaxRule = () => {
    setTaxRule({ ...taxRule, enabled: !taxRule.enabled });
  };

  const handleAddDistribution = () => {
    const newDist: DistributionItem = {
      id: Date.now().toString(),
      type: DISTRIBUTION_OPTIONS[0].value,
      percentage: 0,
      config: getDefaultConfig(DISTRIBUTION_OPTIONS[0].value),
    };
    setTaxRule({
      ...taxRule,
      distributions: [...taxRule.distributions, newDist],
    });
  };

  const getDefaultConfig = (type: string) => {
    switch (type) {
      case 'buyback':
        return { burnInterval: 'daily', minBuybackAmount: 0 };
      case 'airdrop':
        return { airdropInterval: 'weekly', minHoldAmount: 0, snapshotTime: '00:00' };
      case 'donation':
        return { charityAddress: '', donationInterval: 'monthly' };
      case 'strategy':
        return { targetAssets: ['BTC'], buyThreshold: 10, sellThreshold: 20, rebalanceInterval: 'weekly' };
      case 'liquidity':
        return { targetPool: '', autoCompound: true };
      case 'development':
        return { vestingPeriod: 180, releaseInterval: 'monthly' };
      case 'marketing':
        return { campaignBudget: 0, approvalRequired: true };
      default:
        return {};
    }
  };

  const handleRemoveDistribution = (id: string) => {
    const updatedDistributions = taxRule.distributions.filter(d => d.id !== id);
    // 自动重新分配百分比
    const filledDistributions = autoFillPercentages(updatedDistributions);
    setTaxRule({
      ...taxRule,
      distributions: filledDistributions,
    });
  };

  const handleUpdateDistribution = (id: string, field: 'type' | 'percentage', value: string | number) => {
    const updatedDistributions = taxRule.distributions.map(d => {
      if (d.id === id) {
        if (field === 'type') {
          // 类型改变时，重置配置为默认值
          return { ...d, type: String(value), config: getDefaultConfig(String(value)) };
        }
        if (field === 'percentage') {
          return { ...d, percentage: Number(value) };
        }
        return { ...d, [field]: value };
      }
      return d;
    });
    
    // 如果修改的是百分比，自动填充剩余
    if (field === 'percentage') {
      const filledDistributions = autoFillPercentages(updatedDistributions);
      setTaxRule({
        ...taxRule,
        distributions: filledDistributions,
      });
    } else {
      setTaxRule({
        ...taxRule,
        distributions: updatedDistributions,
      });
    }
  };

  const handleUpdateConfig = (id: string, configKey: string, value: any) => {
    const updatedDistributions = taxRule.distributions.map(d =>
      d.id === id ? { ...d, config: { ...d.config, [configKey]: value } } : d
    );
    setTaxRule({
      ...taxRule,
      distributions: updatedDistributions,
    });
  };

  const getDistributionLabel = (type: string) => {
    return DISTRIBUTION_OPTIONS.find(opt => opt.value === type)?.label || type;
  };

  const getDistributionDescription = (type: string) => {
    return DISTRIBUTION_OPTIONS.find(opt => opt.value === type)?.description || '';
  };

  const renderDistributionConfig = (dist: DistributionItem) => {
    const config = dist.config || {};
    
    switch (dist.type) {
      case 'buyback':
        return (
          <ConfigSection initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ConfigItem>
              <ConfigLabel>Burn Interval</ConfigLabel>
              <ConfigSelect
                value={config.burnInterval || 'daily'}
                onChange={(e) => handleUpdateConfig(dist.id, 'burnInterval', e.target.value)}
              >
                <option value="immediate">Immediate</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </ConfigSelect>
            </ConfigItem>
            <ConfigItem>
              <ConfigLabel>Min Buyback Amount</ConfigLabel>
              <ConfigInput
                type="number"
                placeholder="0"
                value={config.minBuybackAmount || ''}
                onChange={(e) => handleUpdateConfig(dist.id, 'minBuybackAmount', Number(e.target.value))}
              />
            </ConfigItem>
          </ConfigSection>
        );
      
      case 'airdrop':
        return (
          <ConfigSection initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ConfigItem>
              <ConfigLabel>Airdrop Interval</ConfigLabel>
              <ConfigSelect
                value={config.airdropInterval || 'weekly'}
                onChange={(e) => handleUpdateConfig(dist.id, 'airdropInterval', e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </ConfigSelect>
            </ConfigItem>
            <ConfigItem>
              <ConfigLabel>Min Hold Amount</ConfigLabel>
              <ConfigInput
                type="number"
                placeholder="0"
                value={config.minHoldAmount || ''}
                onChange={(e) => handleUpdateConfig(dist.id, 'minHoldAmount', Number(e.target.value))}
              />
            </ConfigItem>
            <ConfigItem>
              <ConfigLabel>Snapshot Time</ConfigLabel>
              <ConfigInput
                type="time"
                value={config.snapshotTime || '00:00'}
                onChange={(e) => handleUpdateConfig(dist.id, 'snapshotTime', e.target.value)}
              />
            </ConfigItem>
          </ConfigSection>
        );
      
      case 'donation':
        return (
          <ConfigSection initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ConfigItem>
              <ConfigLabel>Charity Address</ConfigLabel>
              <ConfigInput
                type="text"
                placeholder="0x..."
                value={config.charityAddress || ''}
                onChange={(e) => handleUpdateConfig(dist.id, 'charityAddress', e.target.value)}
              />
            </ConfigItem>
            <ConfigItem>
              <ConfigLabel>Donation Interval</ConfigLabel>
              <ConfigSelect
                value={config.donationInterval || 'monthly'}
                onChange={(e) => handleUpdateConfig(dist.id, 'donationInterval', e.target.value)}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </ConfigSelect>
            </ConfigItem>
          </ConfigSection>
        );
      
      case 'strategy':
        return (
          <ConfigSection initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ConfigItem>
              <ConfigLabel>Target Assets</ConfigLabel>
              <div style={{ display: 'flex', gap: '8px' }}>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={config.targetAssets?.includes('BTC') || false}
                    onChange={(e) => {
                      const assets = config.targetAssets || [];
                      const newAssets = e.target.checked 
                        ? [...assets, 'BTC'] 
                        : assets.filter(a => a !== 'BTC');
                      handleUpdateConfig(dist.id, 'targetAssets', newAssets);
                    }}
                  />
                  BTC
                </CheckboxLabel>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={config.targetAssets?.includes('ETH') || false}
                    onChange={(e) => {
                      const assets = config.targetAssets || [];
                      const newAssets = e.target.checked 
                        ? [...assets, 'ETH'] 
                        : assets.filter(a => a !== 'ETH');
                      handleUpdateConfig(dist.id, 'targetAssets', newAssets);
                    }}
                  />
                  ETH
                </CheckboxLabel>
              </div>
            </ConfigItem>
            <ConfigItem>
              <ConfigLabel>Buy Threshold (%)</ConfigLabel>
              <ConfigInput
                type="number"
                placeholder="10"
                value={config.buyThreshold || ''}
                onChange={(e) => handleUpdateConfig(dist.id, 'buyThreshold', Number(e.target.value))}
              />
            </ConfigItem>
            <ConfigItem>
              <ConfigLabel>Sell Threshold (%)</ConfigLabel>
              <ConfigInput
                type="number"
                placeholder="20"
                value={config.sellThreshold || ''}
                onChange={(e) => handleUpdateConfig(dist.id, 'sellThreshold', Number(e.target.value))}
              />
            </ConfigItem>
            <ConfigItem>
              <ConfigLabel>Rebalance Interval</ConfigLabel>
              <ConfigSelect
                value={config.rebalanceInterval || 'weekly'}
                onChange={(e) => handleUpdateConfig(dist.id, 'rebalanceInterval', e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </ConfigSelect>
            </ConfigItem>
          </ConfigSection>
        );
      
      case 'liquidity':
        return (
          <ConfigSection initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ConfigItem>
              <ConfigLabel>Target Pool</ConfigLabel>
              <ConfigInput
                type="text"
                placeholder="Pool address"
                value={config.targetPool || ''}
                onChange={(e) => handleUpdateConfig(dist.id, 'targetPool', e.target.value)}
              />
            </ConfigItem>
            <ConfigItem>
              <ConfigLabel>Auto-Compound</ConfigLabel>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={config.autoCompound !== false}
                  onChange={(e) => handleUpdateConfig(dist.id, 'autoCompound', e.target.checked)}
                />
                Enable auto-compound
              </CheckboxLabel>
            </ConfigItem>
          </ConfigSection>
        );
      
      case 'development':
        return (
          <ConfigSection initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ConfigItem>
              <ConfigLabel>Vesting Period (days)</ConfigLabel>
              <ConfigInput
                type="number"
                placeholder="180"
                value={config.vestingPeriod || ''}
                onChange={(e) => handleUpdateConfig(dist.id, 'vestingPeriod', Number(e.target.value))}
              />
            </ConfigItem>
            <ConfigItem>
              <ConfigLabel>Release Interval</ConfigLabel>
              <ConfigSelect
                value={config.releaseInterval || 'monthly'}
                onChange={(e) => handleUpdateConfig(dist.id, 'releaseInterval', e.target.value)}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </ConfigSelect>
            </ConfigItem>
          </ConfigSection>
        );
      
      case 'marketing':
        return (
          <ConfigSection initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ConfigItem>
              <ConfigLabel>Campaign Budget</ConfigLabel>
              <ConfigInput
                type="number"
                placeholder="0"
                value={config.campaignBudget || ''}
                onChange={(e) => handleUpdateConfig(dist.id, 'campaignBudget', Number(e.target.value))}
              />
            </ConfigItem>
            <ConfigItem>
              <ConfigLabel>Approval Required</ConfigLabel>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={config.approvalRequired !== false}
                  onChange={(e) => handleUpdateConfig(dist.id, 'approvalRequired', e.target.checked)}
                />
                Require approval
              </CheckboxLabel>
            </ConfigItem>
          </ConfigSection>
        );
      
      default:
        return null;
    }
  };

  const autoFillPercentages = (distributions: DistributionItem[]) => {
    if (distributions.length === 0) return [];
    
    const filled = distributions.filter(d => d.percentage > 0);
    const empty = distributions.filter(d => d.percentage === 0);
    
    const totalFilled = filled.reduce((sum, d) => sum + d.percentage, 0);
    const remaining = 100 - totalFilled;
    
    if (empty.length > 0 && remaining > 0) {
      const autoPercentage = Math.floor(remaining / empty.length * 100) / 100;
      const lastAutoPercentage = remaining - (autoPercentage * (empty.length - 1));
      
      return distributions.map((d, index) => {
        if (d.percentage === 0) {
          const emptyIndex = empty.findIndex(e => e.id === d.id);
          return {
            ...d,
            percentage: emptyIndex === empty.length - 1 ? lastAutoPercentage : autoPercentage
          };
        }
        return d;
      });
    }
    
    return distributions;
  };

  const totalDistribution = taxRule.distributions.reduce((sum, d) => sum + d.percentage, 0);
  const isDistributionValid = taxRule.distributions.length > 0 && Math.abs(totalDistribution - 100) < 0.01;

  return (
    <Container>
      <Header>
        <Title>Launched</Title>
        <Subtitle>
          PlanetSwap: A secure and rapid multichain launchpad for everyone. Remember always DYOR.
        </Subtitle>
        <StatusBadges>
          <StatusBadge variant="success">
            <XMarkIcon />
            No Presale
          </StatusBadge>
          <StatusBadge variant="info">
            <XMarkIcon />
            No Team Allocation
          </StatusBadge>
        </StatusBadges>
      </Header>

      <MainContent>
        <FormCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
        <FormGrid>
          <FormGroup>
            <Label>Token Logo<span>*</span></Label>
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleLogoUpload}
            />
            <UploadArea
              hasImage={!!logoPreview}
              onClick={() => document.getElementById('logo-upload')?.click()}
            >
              {logoPreview ? (
                <ImagePreview>
                  <img src={logoPreview} alt="Token Logo" />
                  <RemoveButton onClick={(e) => {
                    e.stopPropagation();
                    setLogoPreview('');
                  }}>
                    <XMarkIcon />
                  </RemoveButton>
                </ImagePreview>
              ) : (
                <>
                  <PhotoIcon />
                  <p>Upload</p>
                </>
              )}
            </UploadArea>
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label>Token Name<span>*</span></Label>
              <Input type="text" placeholder="Enter token name" />
            </FormGroup>
            <FormGroup>
              <Label>Token Symbol (Ticker)<span>*</span></Label>
              <Input type="text" placeholder="Enter token symbol" />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label>Token Description<span>*</span></Label>
            <TextArea
              placeholder="maxLength is 6"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, maxDescriptionLength))}
            />
            <CharCount>{description.length}/{maxDescriptionLength}</CharCount>
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label>Website<span>*</span></Label>
              <Input type="url" placeholder="Enter website URL" />
            </FormGroup>
            <FormGroup>
              <Label>Telegram<span>*</span></Label>
              <Input type="text" placeholder="Enter Telegram link" />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label>Twitter<span>*</span></Label>
            <Input type="text" placeholder="Enter Twitter handle" />
          </FormGroup>

          <FormGroup>
            <Label>Liquidity Pair<span>*</span></Label>
            <ChainBadge>
              Balance: - ETH
            </ChainBadge>
            <Input
              type="number"
              placeholder="Enter The amount"
              style={{ marginTop: '12px' }}
            />
          </FormGroup>

          <LaunchButton
            onClick={handleLaunch}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            LAUNCH
          </LaunchButton>
        </FormGrid>
      </FormCard>

        <RulesSidebar>
          <RulesCard
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <RulesHeader>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <RulesTitle>Tax Rule</RulesTitle>
                <Toggle>
                  <input
                    type="checkbox"
                    checked={taxRule.enabled}
                    onChange={handleToggleTaxRule}
                  />
                  <span></span>
                </Toggle>
              </div>
            </RulesHeader>

            {taxRule.enabled && (
              <RulesList>
                <RuleItem
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <RuleDetails>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                      <FormGroup>
                        <Label>Buy Tax (%)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          max="100"
                          value={taxRule.buyTax || ''}
                          onChange={(e) => setTaxRule({ ...taxRule, buyTax: Number(e.target.value) })}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>Sell Tax (%)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          max="100"
                          value={taxRule.sellTax || ''}
                          onChange={(e) => setTaxRule({ ...taxRule, sellTax: Number(e.target.value) })}
                        />
                      </FormGroup>
                    </div>
                    
                    <div>
                      <DistributionTitle>Tax Distribution (Must total 100%)</DistributionTitle>
                      
                      {taxRule.distributions.map((dist, index) => (
                        <DistributionItem key={dist.id}>
                          <DistributionHeader>
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>#{index + 1}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                              <DistributionSelect
                                value={dist.type}
                                onChange={(e) => handleUpdateDistribution(dist.id, 'type', e.target.value)}
                                style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                              >
                                {DISTRIBUTION_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </DistributionSelect>
                              <InfoButton
                                onMouseEnter={() => setHoveredInfo(dist.id)}
                                onMouseLeave={() => setHoveredInfo(null)}
                              >
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {hoveredInfo === dist.id && (
                                  <Tooltip>
                                    {getDistributionDescription(dist.type)}
                                  </Tooltip>
                                )}
                              </InfoButton>
                            </div>
                            <PercentageInput
                              type="number"
                              placeholder="Auto"
                              min="0"
                              max="100"
                              step="0.01"
                              value={dist.percentage || ''}
                              onChange={(e) => handleUpdateDistribution(dist.id, 'percentage', Number(e.target.value))}
                              style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>%</span>
                              <DeleteButton onClick={() => handleRemoveDistribution(dist.id)}>
                                <XMarkIcon />
                              </DeleteButton>
                            </div>
                          </DistributionHeader>
                          
                          {renderDistributionConfig(dist)}
                        </DistributionItem>
                      ))}

                      <AddDistributionButton
                        onClick={handleAddDistribution}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ marginTop: '12px' }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>+</span>
                        Add Distribution
                      </AddDistributionButton>

                      {taxRule.distributions.length > 0 && (
                        <TotalPercentage valid={isDistributionValid} style={{ marginTop: '12px' }}>
                          Total: {totalDistribution.toFixed(2)}% {isDistributionValid ? '✓' : '(Auto-fill to 100%)'}
                        </TotalPercentage>
                      )}
                    </div>
                  </RuleDetails>
                </RuleItem>
              </RulesList>
            )}
          </RulesCard>
        </RulesSidebar>
      </MainContent>


      <Footer>
        ©2025 launched in PlanetSwap
      </Footer>
    </Container>
  );
}

