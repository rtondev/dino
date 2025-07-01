import Input from '@/components/ui/Input';
import { User, Mail } from 'lucide-react';

interface Step1UserEmailProps {
  formData: {
    username: string;
    email: string;
  };
  errors: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Step1UserEmail({ formData, errors, onChange }: Step1UserEmailProps) {
  return (
    <>
      <Input
        label="Nome de usuário"
        name="username"
        type="text"
        leftIcon={<User className="h-4 w-4" />}
        error={errors.username}
        value={formData.username}
        onChange={onChange}
        placeholder="seu_usuario"
        helperText="4-50 caracteres, apenas letras, números e underscore"
      />
      <Input
        label="Email"
        name="email"
        type="email"
        leftIcon={<Mail className="h-4 w-4" />}
        error={errors.email}
        value={formData.email}
        onChange={onChange}
        placeholder="seu@email.com"
      />
    </>
  );
} 