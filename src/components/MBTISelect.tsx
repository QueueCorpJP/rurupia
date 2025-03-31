import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define all MBTI personality types + "I don't know" option
export const mbtiTypes = [
  { id: 'unknown', label: 'わからない' },
  { id: 'ISTJ', label: 'ISTJ - 慎重派 (管理者)' },
  { id: 'ISFJ', label: 'ISFJ - 思いやり派 (擁護者)' },
  { id: 'INFJ', label: 'INFJ - 理想派 (提唱者)' },
  { id: 'INTJ', label: 'INTJ - 戦略家 (建築家)' },
  { id: 'ISTP', label: 'ISTP - 職人気質 (巨匠)' },
  { id: 'ISFP', label: 'ISFP - 芸術家 (冒険家)' },
  { id: 'INFP', label: 'INFP - 理想主義者 (仲介者)' },
  { id: 'INTP', label: 'INTP - 論理学者 (思想家)' },
  { id: 'ESTP', label: 'ESTP - 起業家 (実業家)' },
  { id: 'ESFP', label: 'ESFP - エンターテイナー (エンターテイナー)' },
  { id: 'ENFP', label: 'ENFP - チャンピオン (運動家)' },
  { id: 'ENTP', label: 'ENTP - 発明家 (討論者)' },
  { id: 'ESTJ', label: 'ESTJ - 管理者 (幹部)' },
  { id: 'ESFJ', label: 'ESFJ - 領事官 (領事)' },
  { id: 'ENFJ', label: 'ENFJ - 教育者 (主人公)' },
  { id: 'ENTJ', label: 'ENTJ - 指揮官 (指揮官)' },
];

interface MBTISelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

/**
 * A reusable MBTI type selector component 
 */
export const MBTISelect: React.FC<MBTISelectProps> = ({
  value,
  onValueChange,
  placeholder = "MBTIタイプを選択"
}) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {mbtiTypes.map(type => (
          <SelectItem key={type.id} value={type.id}>
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MBTISelect; 