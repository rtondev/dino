import { CheckCircle, XCircle } from 'lucide-react';

interface PasswordChecklistProps {
  password: string;
}

const requirements = [
  {
    label: 'Mínimo 6 caracteres',
    test: (pw: string) => pw.length >= 6,
  },
  {
    label: 'Máximo 12 caracteres',
    test: (pw: string) => pw.length <= 12 && pw.length > 0,
  },
  {
    label: 'Pelo menos uma letra minúscula',
    test: (pw: string) => /[a-z]/.test(pw),
  },
  {
    label: 'Pelo menos uma letra maiúscula',
    test: (pw: string) => /[A-Z]/.test(pw),
  },
  {
    label: 'Pelo menos um caractere especial',
    test: (pw: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  },
];

export default function PasswordChecklist({ password }: PasswordChecklistProps) {
  return (
    <ul className="mt-2 space-y-1 text-sm">
      {requirements.map((req, idx) => {
        const passed = req.test(password || '');
        return (
          <li key={idx} className={passed ? 'text-green-600 flex items-center' : 'text-gray-400 flex items-center'}>
            {passed ? <CheckCircle className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
            {req.label}
          </li>
        );
      })}
    </ul>
  );
} 