import Input from '@/components/ui/Input';
import PasswordChecklist from '@/components/PasswordChecklist';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface Step2PasswordProps {
  formData: {
    password: string;
    confirmPassword: string;
  };
  errors: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (v: boolean) => void;
}

export default function Step2Password({ formData, errors, onChange, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword }: Step2PasswordProps) {
  return (
    <>
      <Input
        label="Sua senha"
        name="password"
        type={showPassword ? 'text' : 'password'}
        leftIcon={<Lock className="h-4 w-4" />}
        rightIcon={
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        error={errors.password}
        value={formData.password}
        onChange={onChange}
        placeholder="Sua senha"
        helperText="6-12 caracteres, com minúscula, maiúscula, número e caractere especial"
      />
      <PasswordChecklist password={formData.password} />
      <Input
        label="Confirmar senha"
        name="confirmPassword"
        type={showConfirmPassword ? 'text' : 'password'}
        leftIcon={<Lock className="h-4 w-4" />}
        rightIcon={
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-400 hover:text-gray-600">
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        error={errors.confirmPassword}
        value={formData.confirmPassword}
        onChange={onChange}
        placeholder="Confirme sua senha"
      />
    </>
  );
} 