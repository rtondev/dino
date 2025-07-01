import Input from '@/components/ui/Input';
import Link from 'next/link';
import { Calendar, Building } from 'lucide-react';

interface Step3ProfileProps {
  formData: {
    user_type: string;
    age: string | number;
    institution: string;
    privacy_policy_accepted: boolean;
  };
  errors: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Step3Profile({ formData, errors, onChange }: Step3ProfileProps) {
  return (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de usuário</label>
      <div className="grid grid-cols-3 gap-3 mb-2">
        <label className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${formData.user_type === 'aluno' ? 'border-[#42026F] bg-[#42026F]/10' : 'border-gray-300'}`}>
          <input
            type="radio"
            name="user_type"
            value="aluno"
            checked={formData.user_type === 'aluno'}
            onChange={onChange}
            className="mr-2"
          />
          <span className="text-2xl mr-2">🎓</span>
          <span className="text-sm">Aluno</span>
        </label>
        <label className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${formData.user_type === 'professor' ? 'border-[#42026F] bg-[#42026F]/10' : 'border-gray-300'}`}>
          <input
            type="radio"
            name="user_type"
            value="professor"
            checked={formData.user_type === 'professor'}
            onChange={onChange}
            className="mr-2"
          />
          <span className="text-2xl mr-2">👨‍🏫</span>
          <span className="text-sm">Professor</span>
        </label>
        <label className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${formData.user_type === 'admin' ? 'border-[#42026F] bg-[#42026F]/10' : 'border-gray-300'}`}>
          <input
            type="radio"
            name="user_type"
            value="admin"
            checked={formData.user_type === 'admin'}
            onChange={onChange}
            className="mr-2"
          />
          <span className="text-2xl mr-2">🦖</span>
          <span className="text-sm">Admin</span>
        </label>
      </div>
      {errors.user_type && <p className="mt-1 text-sm text-error-600">{errors.user_type}</p>}
      <Input
        label="Idade"
        name="age"
        type="number"
        leftIcon={<Calendar className="h-4 w-4" />}
        error={errors.age}
        value={formData.age || ''}
        onChange={onChange}
        placeholder="25"
        min="1"
        max="120"
      />
      <Input
        label="Instituição"
        name="institution"
        type="text"
        leftIcon={<Building className="h-4 w-4" />}
        error={errors.institution}
        value={formData.institution}
        onChange={onChange}
        placeholder="Universidade Federal"
      />
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            name="privacy_policy_accepted"
            checked={formData.privacy_policy_accepted}
            onChange={onChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label className="text-gray-700">
            Eu aceito a{' '}
            <Link
              href="/privacy-policy"
              className="text-primary-600 hover:text-primary-500"
              target="_blank"
            >
              política de privacidade
            </Link>
          </label>
          {errors.privacy_policy_accepted && (
            <p className="mt-1 text-sm text-error-600">
              {errors.privacy_policy_accepted}
            </p>
          )}
        </div>
      </div>
    </>
  );
} 