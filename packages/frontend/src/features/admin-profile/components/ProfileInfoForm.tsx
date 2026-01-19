import React, { useState, useEffect } from 'react';
import { FormInput } from '../../../components/FormComponents';

interface ProfileInfoFormProps {
  initialData: {
    fullName: string;
    displayName?: string;
  };
  onSubmit: (data: { fullName: string; displayName?: string }) => Promise<void>;
  isLoading?: boolean;
}

export const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when initialData changes
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên là bắt buộc';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    }

    if (formData.displayName && formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Tên hiển thị phải có ít nhất 2 ký tự';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Lỗi cập nhật hồ sơ' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        label="Họ và Tên"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        error={errors.fullName}
        placeholder="Nhập họ và tên"
        disabled={isSubmitting || isLoading}
        required
      />

      <FormInput
        label="Tên Hiển Thị (Tùy Chọn)"
        name="displayName"
        value={formData.displayName || ''}
        onChange={handleChange}
        error={errors.displayName}
        placeholder="Nhập tên hiển thị"
        disabled={isSubmitting || isLoading}
      />
        <button type="submit" className="hidden" />
      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {errors.submit}
        </div>
      )}
    </form>
  );
};