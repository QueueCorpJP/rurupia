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
  { id: 'unknown', label: '全て' },
  { id: 'INTJ', label: 'INTJ - 建築家' },
  { id: 'INTP', label: 'INTP - 論理学者' },
  { id: 'ENTJ', label: 'ENTJ - 指揮官' },
  { id: 'ENTP', label: 'ENTP - 討論者' },
  { id: 'INFJ', label: 'INFJ - 提唱者' },
  { id: 'INFP', label: 'INFP - 仲介者' },
  { id: 'ENFJ', label: 'ENFJ - 主人公' },
  { id: 'ENFP', label: 'ENFP - 運動家' },
  { id: 'ISTJ', label: 'ISTJ - 管理者' },
  { id: 'ISFJ', label: 'ISFJ - 擁護者' },
  { id: 'ESTJ', label: 'ESTJ - 幹部' },
  { id: 'ESFJ', label: 'ESFJ - 領事' },
  { id: 'ISTP', label: 'ISTP - 巨匠' },
  { id: 'ISFP', label: 'ISFP - 冒険家' },
  { id: 'ESTP', label: 'ESTP - 起業家' },
  { id: 'ESFP', label: 'ESFP - エンターテイナー' },
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
            <SelectContent position="popper" side="bottom" sideOffset={5} align="start" avoidCollisions={false}>
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